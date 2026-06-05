---
name: api-bluetooth
description: Use the Bluetooth Low Energy (BLE) GATT API to scan, connect to, read, write, and receive notifications from BLE devices (smart home, wearables, sensors) from Spectacles. Load when implementing Bluetooth or IoT device connectivity.
user-invocable: false
paths: "**/*.ts"
---

# Bluetooth BLE GATT API

**Requirements:** Lens Studio v5.10+, Spectacles OS v5.062+. Device only (no Preview support).

Reference template: `BLE Playground/`

> **Privacy:** BLE disables camera frame / location / audio. Use Extended Permissions for combined access (not publishable).
> **HID devices not supported** — GATT only.

---

## Setup

Add `BluetoothCentralModule` to your project assets, then reference it:

```typescript
@input
@hint("The BluetoothCentralModule asset from the project")
bluetoothModule: Bluetooth.BluetoothCentralModule
```

---

## Single Device — Scan, Connect, Read/Write/Notify

```typescript
@component
export class BLEController extends BaseScriptComponent {
  @input bluetoothModule: Bluetooth.BluetoothCentralModule

  private readonly DEVICE_NAME = "My BLE Device"
  private readonly SERVICE_UUID = "932C32BD-0000-47A2-835A-A8D455B859DD"
  private readonly CHAR_UUID   = "932C32BD-0002-47A2-835A-A8D455B859DD"

  private gatt: Bluetooth.BluetoothGatt

  onAwake(): void {
    if (global.deviceInfoSystem.isEditor()) return  // skip in editor
    this.createEvent('OnStartEvent').bind(() => this.scan())
  }

  private scan(): void {
    const filter = new Bluetooth.ScanFilter()
    filter.deviceName = this.DEVICE_NAME  // case-sensitive

    const settings = new Bluetooth.ScanSettings()
    settings.uniqueDevices = true
    settings.timeoutSeconds = 30
    settings.scanMode = Bluetooth.ScanMode.LowPower

    this.bluetoothModule
      .startScan([filter], settings, (result) => this.predicate(result))
      .then((result) => this.onFound(result))
      .catch((err) => print("[BLE] Scan ended: " + err))
  }

  private predicate(result: Bluetooth.ScanResult): boolean {
    return result.deviceName === this.DEVICE_NAME  // return true to stop scan
  }

  private onFound(scanResult: Bluetooth.ScanResult): void {
    this.bluetoothModule
      .connectGatt(scanResult.deviceAddress)
      .then((gatt) => {
        this.gatt = gatt as Bluetooth.BluetoothGatt
        print("[BLE] Connected to " + scanResult.deviceName)

        // Monitor connection state
        this.gatt.onConnectionStateChangedEvent.add((e) => {
          print("[BLE] Connection state: " + e.state)  // 0=Disconnected, 1=Connected
        })

        this.setupCharacteristic()
      })
      .catch((err) => print("[BLE] Connect error: " + err))
  }

  private setupCharacteristic(): void {
    try {
      const service = this.gatt.getService(this.SERVICE_UUID)
      const char = service.getCharacteristic(this.CHAR_UUID)

      // Read
      char.readValue().then((val: Uint8Array) => {
        print("[BLE] Read value: " + val)
      })

      // Write (e.g., power on = [1])
      char.writeValue(new Uint8Array([1])).then(() => {
        print("[BLE] Write OK")
      })

      // Subscribe to notifications
      char.registerNotifications((val: Uint8Array) => {
        print("[BLE] Notification: " + val)
      })
    } catch (err) {
      print("[BLE] Characteristic error: " + err)
    }
  }

  public async stopScanEarly(): Promise<void> {
    // Cancel an active scan before it times out
    await this.bluetoothModule.stopScan()
  }

  public async unsubscribeAll(char: Bluetooth.BluetoothCharacteristic): Promise<void> {
    // Unsubscribe all registered notification handlers on a characteristic
    await char.unregisterNotifications()
  }

  public disconnect(): void {
    this.gatt?.disconnect()
  }
}
```

---

## Multiple Devices

For multiple devices, collect results in the predicate (return `false` to keep scanning), then connect serially after timeout:

```typescript
private scanResults: Bluetooth.ScanResult[] = []

// In predicate — collect but don't stop:
private predicate(result: Bluetooth.ScanResult): boolean {
  this.scanResults.push(result)
  return false  // keep scanning until timeout
}

// In .catch (timeout fires here for multi-device):
.catch(() => {
  this.connectNext(0)
})

private connectNext(index: number): void {
  if (index >= this.scanResults.length) return
  this.bluetoothModule
    .connectGatt(this.scanResults[index].deviceAddress)
    .then(() => this.connectNext(index + 1))
    .catch(() => this.connectNext(index + 1))
}
```

---

## async/await Alternative

```typescript
private async scanAndConnect(): Promise<void> {
  try {
    const filter = new Bluetooth.ScanFilter()
    const settings = new Bluetooth.ScanSettings()
    settings.uniqueDevices = true
    settings.timeoutSeconds = 30

    const result = await this.bluetoothModule.startScan(
      [filter], settings, (r) => r.deviceName === this.DEVICE_NAME
    )
    this.gatt = (await this.bluetoothModule.connectGatt(result.deviceAddress)) as Bluetooth.BluetoothGatt
  } catch (err) {
    print("[BLE] Error: " + err)
  }
}
```

---

## BluetoothCentralModule Properties

| Property | Type | Description |
|---|---|---|
| `bluetoothModule.status` | `Bluetooth.BluetoothStatus` | Current adapter status (e.g. `PoweredOn`, `PoweredOff`, `Unknown`) |

## BluetoothGatt Properties

| Property | Type | Description |
|---|---|---|
| `gatt.mtu` | `number` | Maximum Transmission Unit — max bytes per BLE packet (typically 23–517) |
| `gatt.onConnectionStateChangedEvent` | `Event` | Fires when connection state changes (0=Disconnected, 1=Connected) |

## Key API Summary

| Method | Returns | Description |
|---|---|---|
| `bluetoothModule.startScan(filters, settings, predicate)` | `Promise<ScanResult>` | Start BLE scan; resolves when predicate returns `true` |
| `bluetoothModule.stopScan()` | `Promise<void>` | Stop an active scan early |
| `bluetoothModule.connectGatt(address)` | `Promise<BluetoothGatt>` | Connect to a device by address |
| `char.readValue()` | `Promise<Uint8Array>` | Read characteristic value |
| `char.writeValue(data)` | `Promise<void>` | Write to characteristic |
| `char.registerNotifications(callback)` | `void` | Subscribe to characteristic notifications |
| `char.unregisterNotifications()` | `Promise<void>` | Unsubscribe all notification handlers |
| `gatt.disconnect()` | `void` | Disconnect from device |

---

## Key Limitations

- Connect to devices **serially** (not in parallel)
- `BluetoothCentralModule.status` reflects adapter state but may return `Unknown` — verify on device
- UUIDs are case-insensitive in matching
- Only `Uint8Array` supported for characteristic values (not `Int8Array`)
- Use **nRF Connect** app to inspect device UUIDs before coding
