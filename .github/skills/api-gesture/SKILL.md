---
name: api-gesture
description: Use the low-level Gesture Module for pinch, targeting ray, grab, and phone-in-hand detection in Spectacles. Use this instead of SIK when building a custom interaction system or needing raw gesture events. Load when implementing custom gesture recognition or input handling.
user-invocable: false
paths: "**/*.ts"
---

# Gesture Module — Low-Level Gesture Detection

> Prefer **SpectaclesInteractionKit (SIK)** for standard UI interactions. Use GestureModule directly when building a **custom interaction system** or need raw gesture data.

Reference: `Essentials/`

---

## Setup

```typescript
private gestureModule: GestureModule = require('LensStudio:GestureModule')
```

---

## Pinch Gesture

```typescript
@component
export class PinchHandler extends BaseScriptComponent {
  private gestureModule: GestureModule = require('LensStudio:GestureModule')

  onAwake(): void {
    // Pinch down (start) — Right hand
    this.gestureModule
      .getPinchDownEvent(GestureModule.HandType.Right)
      .add((args: PinchDownArgs) => {
        print("Right pinch start, confidence=" + args.confidence)
        print("Palm orientation: " + args.palmOrientation)
      })

    // Pinch up (release) — Right hand
    this.gestureModule
      .getPinchUpEvent(GestureModule.HandType.Right)
      .add((args: PinchUpArgs) => {
        print("Right pinch released")
        print("Palm orientation: " + args.palmOrientation)
      })

    // Filtered pinch — more robust when hand is moving
    this.gestureModule
      .getFilteredPinchDownEvent(GestureModule.HandType.Right)
      .add((args: PinchDownArgs) => {
        print("Right filtered pinch start (stable even while moving)")
      })

    this.gestureModule
      .getFilteredPinchUpEvent(GestureModule.HandType.Right)
      .add((args: PinchUpArgs) => {
        print("Right filtered pinch released")
      })

    // Palm tap — index finger of one hand taps palm of other hand
    this.gestureModule
      .getPalmTapDownEvent(GestureModule.HandType.Right)
      .add(() => {
        print("Palm tap down on right hand")
      })

    this.gestureModule
      .getPalmTapUpEvent(GestureModule.HandType.Right)
      .add(() => {
        print("Palm tap up on right hand")
      })

    // Pinch strength (0=none, 1=full — fires every frame)
    this.gestureModule
      .getPinchStrengthEvent(GestureModule.HandType.Right)
      .add((args: PinchStrengthArgs) => {
        if (args.strength > 0.5) {
          print("Pinching with strength: " + args.strength)
        }
      })

    // Left hand pinch
    this.gestureModule
      .getPinchDownEvent(GestureModule.HandType.Left)
      .add(() => print("Left pinch"))
  }
}
```

---

## Targeting Gesture (pointing ray)

Fires **every frame** with a ray direction for content targeting:

```typescript
this.gestureModule
  .getTargetingDataEvent(GestureModule.HandType.Right)
  .add((args: TargetingDataArgs) => {
    if (!args.isValid) return  // ray values are stale when isValid=false

    const origin: vec3 = args.rayOriginInWorld
    const direction: vec3 = args.rayDirectionInWorld

    // Cast ray to find what user is pointing at
    // args.isValid=false means ray retains last known values
  })
```

---

## Grab Gesture

```typescript
this.gestureModule
  .getGrabBeginEvent(GestureModule.HandType.Right)
  .add((_: GrabBeginArgs) => {
    print("Grab started")
  })

this.gestureModule
  .getGrabEndEvent(GestureModule.HandType.Right)
  .add((_: GrabEndArgs) => {
    print("Grab ended")
  })
```

---

## Phone-in-Hand Detection

```typescript
this.gestureModule
  .getIsPhoneInHandBeginEvent(GestureModule.HandType.Right)
  .add(() => {
    print("Phone detected in right hand")
    // Trigger mobile controller mode, switch UI, etc.
  })

this.gestureModule
  .getIsPhoneInHandEndEvent(GestureModule.HandType.Right)
  .add(() => {
    print("Phone no longer in right hand")
  })
```

---

## API Summary

All methods take `handType: GestureModule.HandType` as parameter — either `GestureModule.HandType.Left` or `GestureModule.HandType.Right`.

| Method | Args | Description |
|--------|------|-------------|
| `getPinchDownEvent(hand)` | `{confidence, palmOrientation}` | Pinch started |
| `getPinchUpEvent(hand)` | `{palmOrientation}` | Pinch released |
| `getFilteredPinchDownEvent(hand)` | `{confidence, palmOrientation}` | Pinch started — more robust when hand is moving |
| `getFilteredPinchUpEvent(hand)` | `{palmOrientation}` | Pinch released — more robust when hand is moving |
| `getPalmTapDownEvent(hand)` | `{}` | Index finger of one hand taps palm of the other |
| `getPalmTapUpEvent(hand)` | `{}` | Lifts index finger from palm |
| `getPinchStrengthEvent(hand)` | `{strength: 0–1}` | Pinch strength, fires every frame |
| `getTargetingDataEvent(hand)` | `{isValid, rayOriginInWorld, rayDirectionInWorld}` | Pointing ray, fires every frame |
| `getGrabBeginEvent(hand)` | `{}` | Grab/fist started |
| `getGrabEndEvent(hand)` | `{}` | Grab released |
| `getIsPhoneInHandBeginEvent(hand)` | `{}` | Phone detected in hand |
| `getIsPhoneInHandEndEvent(hand)` | `{}` | Phone no longer in hand |

---

## GestureModule vs SIK

| Use case | Use |
|----------|-----|
| Buttons, sliders, draggable objects, UI | SIK (`Interactable`, `PinchButton`) |
| Custom interaction system | `GestureModule` directly |
| Raw pinch strength curve | `GestureModule.getPinchStrengthEvent` |
| Pointing ray for custom raycasting | `GestureModule.getTargetingDataEvent` |
| Phone-in-hand detection | `GestureModule` only |
