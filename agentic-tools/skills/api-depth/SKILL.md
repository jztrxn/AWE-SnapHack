---
name: api-depth
description: Access real-time depth frames from Spectacles using the DepthModule — per-pixel depth data, back-projection to 3D world space, and camera intrinsics. Experimental API. Load when implementing depth-based AR placement, occlusion, or spatial understanding.
user-invocable: false
paths: "**/*.ts"
---

# Depth Module — Depth Frame Access

**Requirements:** Experimental API. Requires camera access (disables open internet unless Extended Permissions used).

Reference: `Spatial Image/`, `Depth Cache/`

---

## Setup

```typescript
private depthModule: DepthModule = require('LensStudio:DepthModule')
```

> `createDepthFrameSession()` must NOT be called inside `onAwake`. Use `OnStartEvent`.

---

## Full Component

```typescript
@component
export class DepthFrameReader extends BaseScriptComponent {
  private depthModule: DepthModule = require('LensStudio:DepthModule')
  private session: DepthFrameSession
  private frameRegistration: EventRegistration

  onAwake(): void {
    this.createEvent('OnStartEvent').bind(() => this.startSession())
    this.createEvent('OnDestroyEvent').bind(() => this.stopSession())
  }

  private startSession(): void {
    this.session = this.depthModule.createDepthFrameSession()

    this.frameRegistration = this.session.onNewFrame.add(
      (data: DepthFrameData) => this.onDepthFrame(data)
    )

    this.session.start()
  }

  private onDepthFrame(data: DepthFrameData): void {
    const cam = data.deviceCamera

    // --- Sample depth at a specific pixel ---
    const px = 112, py = 80
    const idx = Math.floor(px + py * cam.resolution.x)
    const depthValue = data.depthFrame[idx]  // depth in centimeters

    // --- Back-project pixel to 3D in device reference space ---
    const uv = new vec2(px / cam.resolution.x, py / cam.resolution.y)
    const point3dDeviceRef = cam.unproject(uv, depthValue)

    // --- Transform to world space ---
    const worldFromDeviceRef = data.toWorldTrackingOriginFromDeviceRef
    const point3dWorld = worldFromDeviceRef.multiplyPoint(point3dDeviceRef)

    print("[Depth] 3D point in world: " + point3dWorld)
  }

  private stopSession(): void {
    if (this.session && this.frameRegistration) {
      this.session.onNewFrame.remove(this.frameRegistration)
      this.session.stop()
    }
  }
}
```

---

## DepthFrameData Properties

```typescript
session.onNewFrame.add((data: DepthFrameData) => {
  // Camera info for this depth frame
  const cam = data.deviceCamera
  print("Resolution: " + cam.resolution)          // vec2 in pixels
  print("Focal length: " + cam.focalLength)       // vec2
  print("Principal point: " + cam.principalPoint) // vec2
  print("Camera pose: " + cam.pose)               // mat4

  // Depth array — Float32Array per pixel, in centimeters
  const depth: Float32Array = data.depthFrame

  // Transform: device reference → world tracking origin (mat4)
  const worldFromDevice: mat4 = data.toWorldTrackingOriginFromDeviceRef

  // Timestamp — use to sync with CameraModule color frames
  const ts: number = data.timestampSeconds
})
```

---

## Depth + Color Frame Sync

Depth is estimated from the **left color camera** on Spectacles '24. Sync frames by comparing timestamps:

```typescript
// From CameraModule (color) frame:
provider.onNewFrame.add((colorFrame) => {
  const colorTs = colorFrame.timestampMillis / 1000  // convert to seconds
  // Match with depthFrame.timestampSeconds
})
```

---

## Iterate All Pixels

```typescript
private onDepthFrame(data: DepthFrameData): void {
  const cam = data.deviceCamera
  const w = cam.resolution.x
  const h = cam.resolution.y
  const depth = data.depthFrame
  const world = data.toWorldTrackingOriginFromDeviceRef

  for (let py = 0; py < h; py += 4) {  // sample every 4th row for perf
    for (let px = 0; px < w; px += 4) {
      const d = depth[Math.floor(px + py * w)]
      if (d <= 0) continue  // invalid depth

      const uv = new vec2(px / w, py / h)
      const p = cam.unproject(uv, d)
      const worldPt = world.multiplyPoint(p)
      // use worldPt...
    }
  }
}
```

---

## Notes

- Depth update rate is **~5Hz** — not suitable for fast-moving objects
- Depth is estimated (not measured with a depth sensor) — accuracy varies
- The depth camera uses the **left color camera** frame as source
- `depthFrame` is a `Float32Array` of depth values in **centimeters**
- Invalid/out-of-range pixels return `0` or negative values
- Requires device — no Lens Studio Preview support for depth
