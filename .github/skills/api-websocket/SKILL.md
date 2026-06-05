---
name: api-websocket
description: Create real-time WebSocket connections from Spectacles using the InternetModule. Supports text and binary (Blob) frames. Load when implementing real-time data streaming, custom server communication, live data feeds, or any persistent socket connections.
user-invocable: false
---

# WebSocket API — Real-Time Connections

**Requirements:** Lens Studio v5.4+, Spectacles OS v5.059+. Add `InternetModule` to project. Device only (Preview requires Device Type Override = Spectacles).

> `wss://` (secure) → publishable. `ws://` (insecure) → requires Experimental APIs, testing only.

Reference: `Fetch/`, `AI Playground/` (RSG uses WebSocket internally)

---

## Setup

```typescript
@input internetModule: InternetModule
// OR:
private internetModule: InternetModule = require('LensStudio:InternetModule')
```

---

## Full WebSocket Component

```typescript
@component
export class WebSocketClient extends BaseScriptComponent {
  @input internetModule: InternetModule

  @input
  @hint("WebSocket server URL (wss://...)")
  serverUrl: string = "wss://example.com/ws"

  private socket: WebSocket

  onAwake(): void {
    this.createEvent('OnStartEvent').bind(() => this.connect())
    this.createEvent('OnDestroyEvent').bind(() => this.disconnect())
  }

  private connect(): void {
    this.socket = this.internetModule.createWebSocket(this.serverUrl)
    this.socket.binaryType = 'blob'  // enables binary frame support

    this.socket.onopen = (event: WebSocketEvent) => {
      print("[WS] Connected")
      this.onConnected()
    }

    this.socket.onmessage = async (event: WebSocketMessageEvent) => {
      if (event.data instanceof Blob) {
        // Binary frame
        const bytes = await event.data.bytes()  // Uint8Array
        const text = await event.data.text()    // string
        this.onBinaryMessage(bytes, text)
      } else {
        // Text frame
        this.onTextMessage(event.data as string)
      }
    }

    this.socket.onclose = (event: WebSocketCloseEvent) => {
      if (event.wasClean) {
        print("[WS] Closed cleanly")
      } else {
        print("[WS] Closed with error, code: " + event.code)
      }
    }

    this.socket.onerror = (_: WebSocketEvent) => {
      print("[WS] Error")
    }
  }

  private onConnected(): void {
    // Send initial message
    this.sendText(JSON.stringify({type: "hello", version: 1}))
  }

  private onTextMessage(text: string): void {
    print("[WS] Received: " + text)
    try {
      const data = JSON.parse(text)
      // handle data...
    } catch (e) {
      print("[WS] Parse error: " + e)
    }
  }

  private onBinaryMessage(bytes: Uint8Array, text: string): void {
    print("[WS] Binary frame, " + bytes.length + " bytes")
  }

  // Send text
  public sendText(message: string): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(message)
    }
  }

  // Send binary
  public sendBinary(data: Uint8Array): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(data)
    }
  }

  public disconnect(): void {
    this.socket?.close()
  }
}
```

---

## WebSocket States

```typescript
// Check before sending
if (this.socket.readyState === WebSocket.OPEN) {
  this.socket.send(message)
} else if (this.socket.readyState === WebSocket.CONNECTING) {
  print("[WS] Still connecting...")
}
```

| State | Value | Description |
|-------|-------|-------------|
| `CONNECTING` | 0 | Connection in progress |
| `OPEN` | 1 | Connected, ready to send |
| `CLOSING` | 2 | Closing handshake |
| `CLOSED` | 3 | Connection closed |

---

## JSON Protocol Pattern

```typescript
interface WSMessage {
  type: string
  data?: any
  id?: string
}

public sendJSON(msg: WSMessage): void {
  this.socket.send(JSON.stringify(msg))
}

private onTextMessage(text: string): void {
  const msg = JSON.parse(text) as WSMessage
  switch (msg.type) {
    case "update": this.handleUpdate(msg.data); break
    case "error":  print("[WS] Server error: " + msg.data); break
    case "pong":   print("[WS] Pong received"); break
  }
}
```

---

## Reconnect Pattern

```typescript
private reconnectDelay = 2.0

private onSocketClose(): void {
  print("[WS] Reconnecting in " + this.reconnectDelay + "s...")
  const delay = this.createEvent('DelayedCallbackEvent')
  delay.bind(() => this.connect())
  delay.reset(this.reconnectDelay)
}
```

---

## Known Limitations

- `Blob` does not support `ArrayBuffer` or `Stream`
- `binaryType = 'arraybuffer'` is **not** supported — use `'blob'` for binary
- `extensions`, `protocol`, `bufferedAmount` properties not available
- `ws://` (insecure) requires Experimental APIs enabled
