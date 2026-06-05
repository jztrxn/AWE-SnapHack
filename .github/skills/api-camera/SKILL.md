---
name: api-camera
description: Access camera frames from Spectacles using the CameraModule — continuous video stream, still image capture, camera intrinsics, and project/unproject for 3D-2D coordinate mapping. Experimental API. Load when implementing computer vision, AR overlays on camera, or sending frames to AI models.
user-invocable: false
paths: "**/*.ts"
---

# Camera Module — Camera Frame Access

**Requirements:** Experimental API. Lens Studio v5.x+, Spectacles device only.

> **Privacy:** Camera frame access disables open internet. Use Extended Permissions for combined camera + internet (not publishable publicly).

Reference: `Crop/`, `Depth Cache/`, `AI Playground/`

---

## Setup

```typescript
private cameraModule: CameraModule = require('LensStudio:CameraModule')
```

> `CameraModule.createCameraRequest()` must NOT be called inside `onAwake`. Use `OnStartEvent`.

Use the lowest resolution needed — higher resolutions increase power consumption and thermal load on device:

```typescript
// Discover available resolutions before choosing one
const supportedResolutions: vec2[] = this.cameraModule.getSupportedImageResolutions()
print("[Camera] Supported resolutions: " + JSON.stringify(supportedResolutions))
// Pick the smallest suitable resolution for power/thermal efficiency
```

---

## Continuous Camera Frame Stream

```typescript
@component
export class CameraFrameReader extends BaseScriptComponent {
  @input
  @hint("Image component to display the camera feed")
  displayImage: Image

  private cameraModule: CameraModule = require('LensStudio:CameraModule')
  private cameraTexture: Texture
  private frameRegistration: EventRegistration

  onAwake(): void {
    this.createEvent('OnStartEvent').bind(() => this.setupCamera())
    this.createEvent('OnDestroyEvent').bind(() => this.cleanup())
  }

  private setupCamera(): void {
    const request = CameraModule.createCameraRequest()
    // Camera choices: Default_Color, Left_Color, Right_Color
    request.cameraId = CameraModule.CameraId.Default_Color

    this.cameraTexture = this.cameraModule.requestCamera(request)
    const provider = this.cameraTexture.control as CameraTextureProvider

    this.frameRegistration = provider.onNewFrame.add((frame) => {
      // Called every new frame — use texture for display or ML input
      if (this.displayImage) {
        this.displayImage.mainPass.baseTex = this.cameraTexture
      }
      this.processFrame(frame)
    })
  }

  private processFrame(frame: CameraFrame): void {
    // Access frame here — pass to MLComponent or RSG for AI processing
  }

  private cleanup(): void {
    const provider = this.cameraTexture?.control as CameraTextureProvider
    if (provider && this.frameRegistration) {
      provider.onNewFrame.remove(this.frameRegistration)
    }
  }
}
```

---

## Still Image Request (higher resolution, async)

```typescript
private async captureStillImage(): Promise<Texture | null> {
  try {
    const imageRequest = CameraModule.createImageRequest()
    // imageSmallerDimension sets resolution of the smaller axis
    imageRequest.imageSmallerDimension = 512

    const imageFrame = await this.cameraModule.requestImage(imageRequest)
    const texture = imageFrame.texture
    const timestampMs = imageFrame.timestampMillis
    return texture
  } catch (error) {
    print("[Camera] Still image failed: " + error)
    return null
  }
}
```

---

## Camera Intrinsics (for projection / unprojection)

```typescript
// Get camera info via DeviceInfoSystem
const camera = global.deviceInfoSystem.getTrackingCameraForId(
  CameraModule.CameraId.Left_Color
)

const focalLength = camera.focalLength       // vec2
const principalPoint = camera.principalPoint // vec2
const resolution = camera.resolution         // vec2
const pose = camera.pose                     // mat4 — offset from device ref

// Project 3D point → 2D pixel
const point3d = new vec3(x, y, z)
const pixel2d = camera.project(point3d)      // vec2 in pixel coords

// Unproject 2D pixel + depth → 3D point in device reference space
const normalizedUV = new vec2(pixelX / resolution.x, pixelY / resolution.y)
const point3dInDeviceRef = camera.unproject(normalizedUV, depthValue)
```

---

## Camera IDs

| ID | Description |
|----|-------------|
| `CameraModule.CameraId.Default_Color` | Main color camera (recommended) |
| `CameraModule.CameraId.Left_Color` | Left eye color camera |
| `CameraModule.CameraId.Right_Color` | Right eye color camera |

---

## Sending Camera Frame to AI (RSG Pattern)

```typescript
// From AI Playground / Crop / Depth Cache templates:
import {VideoController} from "RemoteServiceGateway.lspkg/Helpers/VideoController"

private videoController = new VideoController(1500, CompressionQuality.HighQuality, EncodingType.Jpg)

// In onNewFrame:
this.videoController.onFrameReady.add((encodedJpeg) => {
  const msg = {
    realtime_input: {
      media_chunks: [{mime_type: "image/jpeg", data: encodedJpeg}]
    }
  }
  this.GeminiLive.send(msg)
})
```

---

## Notes

- Camera texture is a **live handle** — assign it directly to `mainPass.baseTex` or MLComponent input
- Use `Left_Color` for depth-synchronized workflows (depth module uses left camera)
- Frame timestamps from `CameraFrame` can sync with `DepthFrameData.timestampSeconds`
- `imageSmallerDimension` controls still image resolution — larger = slower
