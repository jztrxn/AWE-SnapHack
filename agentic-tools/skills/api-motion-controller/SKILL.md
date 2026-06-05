---
name: api-motion-controller
description: Use the Motion Controller Module to track the Spectacles App mobile phone as a 6DoF controller — world position, rotation, touch events, and haptic feedback. Load when implementing phone-as-controller interactions, mobile-to-Spectacles input, or haptic feedback features.
user-invocable: false
paths: "**/*.ts"
---

# Motion Controller Module — Phone as 6DoF Controller

The Spectacles App on the user's phone becomes a tracked controller with position, rotation, touch, and haptics.

**Requirements:** Spectacles App installed and connected. Lens Studio + connected Spectacles device for testing.

> Only one Motion Controller supported at a time. Only Spectacles App controller supported currently.

Reference: `Spectacles Mobile Kit/`, `BLE Playground/`

---

## Setup

```typescript
const MotionControllerModule = require('LensStudio:MotionControllerModule')
```

---

## Basic 6DoF Transform Controller

Track phone world position and rotation and apply to a scene object:

```typescript
const MotionControllerModule = require('LensStudio:MotionControllerModule')

@component
export class PhoneController extends BaseScriptComponent {
  @input
  @hint("Scene object to move with the phone")
  controlledObject: SceneObject

  private controller

  onAwake(): void {
    const options = MotionController.Options.create()
    options.motionType = MotionController.MotionType.SixDoF
    options.controllerId = ""  // "" targets the Spectacles App mobile phone controller

    this.controller = MotionControllerModule.getController(options)

    // Check availability before using
    if (!this.controller.isControllerAvailable()) {
      print("[Controller] Not yet available — waiting for connection")
    }

    // React to controller connect/disconnect
    this.controller.onControllerStateChange.add((isAvailable: boolean) => {
      print("[Controller] Available: " + isAvailable)
    })

    this.controller.onTransformEvent.add(this.onTransform.bind(this))
  }

  private onTransform(position: vec3, rotation: quat): void {
    if (!this.controlledObject) return
    const tr = this.controlledObject.getTransform()
    tr.setWorldPosition(position)
    tr.setWorldRotation(rotation)
  }
}
```

### Reading last-known position/rotation without an event

```typescript
// Poll the most recently received transform values
const pos: vec3 = this.controller.getWorldPosition()
const rot: quat = this.controller.getWorldRotation()
```

---

## Touch Events

```typescript
onAwake(): void {
  const options = MotionController.Options.create()
  options.motionType = MotionController.MotionType.SixDoF
  this.controller = MotionControllerModule.getController(options)

  this.controller.onTransformEvent.add((pos, rot) => {
    this.controlledObject.getTransform().setWorldPosition(pos)
    this.controlledObject.getTransform().setWorldRotation(rot)
  })

  // onTouchEvent signature: event4<vec2, number, number, MotionController.TouchPhase, void>
  // Parameters: normalizedPosition, touchId, timestampMilliseconds, phase
  this.controller.onTouchEvent.add(
    (normalizedPosition: vec2, touchId: number, timestampMilliseconds: number, phase: MotionController.TouchPhase) => {
      switch (phase) {
        case MotionController.TouchPhase.Began:
          print("[Controller] Touch began at: " + normalizedPosition)
          this.onTouchBegan(normalizedPosition)
          break
        case MotionController.TouchPhase.Moved:
          print("[Controller] Touch moved: " + normalizedPosition)
          break
        case MotionController.TouchPhase.Ended:
          print("[Controller] Touch ended")
          break
        case MotionController.TouchPhase.Canceled:
          print("[Controller] Touch canceled")
          break
      }
    }
  )
}

private onTouchBegan(pos: vec2): void {
  // Toggle, interact, shoot, etc.
  this.targetObject.enabled = !this.targetObject.enabled
}
```

---

## Haptic Feedback

> Requires **Vibration** and **System Haptics** enabled on the user's phone.

```typescript
private triggerHaptic(): void {
  const request = MotionController.HapticRequest.create()
  request.hapticFeedback = MotionController.HapticFeedback.VibrationMedium
  request.duration = 0.3
  this.controller.invokeHaptic(request)
}
```

### Haptic Feedback Options

| Value | Description |
|-------|-------------|
| `VibrationLight` | Short, light tap |
| `VibrationMedium` | Medium vibration |
| `VibrationHeavy` | Strong vibration |
| `SelectionChanged` | Selection click |
| `ImpactLight/Medium/Heavy` | Impact feedback types |
| `NotificationSuccess/Warning/Error` | Notification patterns |

---

## Full Example: Touch to Toggle + Haptic

```typescript
const MotionControllerModule = require('LensStudio:MotionControllerModule')

@component
export class MotionControllerExample extends BaseScriptComponent {
  @input targetObject: SceneObject

  private controller

  onAwake(): void {
    const options = MotionController.Options.create()
    options.motionType = MotionController.MotionType.SixDoF
    this.controller = MotionControllerModule.getController(options)

    this.controller.onTransformEvent.add((pos: vec3, rot: quat) => {
      this.sceneObject.getTransform().setWorldPosition(pos)
      this.sceneObject.getTransform().setWorldRotation(rot)
    })

    this.controller.onTouchEvent.add((normalizedPos, id, ts, phase) => {
      if (phase !== MotionController.TouchPhase.Began) return

      this.targetObject.enabled = !this.targetObject.enabled

      if (this.targetObject.enabled) {
        const req = MotionController.HapticRequest.create()
        req.hapticFeedback = MotionController.HapticFeedback.VibrationMedium
        req.duration = 0.2
        this.controller.invokeHaptic(req)
      }
    })
  }
}
```

---

## API Reference

### `MotionController.MotionType` enum

| Value | Description |
|-------|-------------|
| `NoMotion` | No motion tracking |
| `ThreeDoF` | Rotation only (3 degrees of freedom) |
| `SixDoF` | Full position + rotation (6 degrees of freedom) |

### `MotionController.TouchPhase` enum

| Value | Description |
|-------|-------------|
| `Began` | Finger touched screen |
| `Moved` | Finger moved on screen |
| `Ended` | Finger lifted from screen |
| `Canceled` | Touch canceled by system |

### Key methods and events

| Member | Type/Signature | Description |
|--------|----------------|-------------|
| `isControllerAvailable()` | `() => boolean` | Check if controller is connected before use |
| `getWorldPosition()` | `() => vec3` | Last known world position |
| `getWorldRotation()` | `() => quat` | Last known world rotation |
| `onControllerStateChange` | `event1<boolean, void>` | Fires when controller connects or disconnects |
| `onTransformEvent` | `event2<vec3, quat, void>` | Fires each frame with position and rotation |
| `onTouchEvent` | `event4<vec2, number, number, TouchPhase, void>` | Touch input (normalizedPos, touchId, timestampMs, phase) |
| `invokeHaptic(request)` | `(HapticRequest) => void` | Trigger haptic feedback on phone |

### `MotionControllerOptions.controllerId`

Set to `""` to target the Spectacles App mobile phone controller (the only supported controller currently).

---

## Notes

- Motion Controller also fires standard Lens Studio touch events: `TapEvent`, `TouchStartEvent`, `TouchMoveEvent`, `TouchEndEvent`
- `normalizedPosition` ranges `0..1` in both axes (relative to phone screen)
- Testing: click `Preview Lens → Send to Connected Spectacles`, open Spectacles App, enable **Controller** toggle
