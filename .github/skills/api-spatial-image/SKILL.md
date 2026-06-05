---
name: api-spatial-image
description: Convert 2D images into 3D spatialized meshes using the Spatial Image package. Includes depth animation, angle validation, gallery navigation, and frame management. Load when implementing spatial photo viewing, 3D image galleries, or depth-based image display.
user-invocable: false
---

# Spatial Image — 2D to 3D Spatialization

**Requirements:** Lens Studio v5.3+, Spectacles OS v5.58+. Install **Spatial Image** package from Asset Library. Requires Remote Service Gateway credential.

Reference: `Spatial Image/`, `Spatial Image Advanced/`

> Only one image can be spatialized at a time. Multiple simultaneous requests cause delays.

---

## Scene Setup (Required)

4 key scene objects in the Spatial Image template:

| Object | Purpose |
|--------|---------|
| `SpectaclesInteractionKit` | Hand interactions |
| `SikSpatialImageFrame` | Container + manipulation of the spatial image |
| `SpatialGallery` | Multi-image browsing |
| `RemoteServiceGatewayCredentials` | RSG auth for spatialization service |

---

## Core Script: SpatialImageFrame

The `SpatialImageFrame` manages the full pipeline — load flat image → spatialize → swap to 3D:

```typescript
// Set an image (Texture) on the frame
// swapWhenSpatialized=true: automatically switches to 3D when ready
frame.setImage(myTexture, true)

// Toggle between flat and spatialized display
frame.setSpatialized(true)   // show 3D
frame.setSpatialized(false)  // show flat
```

---

## Gallery Pattern (multiple images)

```typescript
// From SpatialGallery.ts pattern:
@component
export class ImageGallery extends BaseScriptComponent {
  @input frame: SpatialImageFrame   // the SIK frame component
  @input gallery: Texture[]         // array of image textures
  @input shuffle: boolean = false

  private index: number = 0

  onAwake(): void {
    this.createEvent('OnStartEvent').bind(() => this.init())
  }

  private init(): void {
    if (this.shuffle) this.gallery = this.shuffleArray(this.gallery)
    this.setIndex(0)
  }

  private setIndex(newIndex: number): void {
    this.index = Math.max(0, Math.min(newIndex, this.gallery.length - 1))
    this.frame.setImage(this.gallery[this.index], true)  // true = swap to 3D when ready
  }

  public nextImage(): void { this.setIndex(this.index + 1) }
  public prevImage(): void { this.setIndex(this.index - 1) }

  private shuffleArray(arr: Texture[]): Texture[] {
    return [...arr].sort(() => Math.random() - 0.5)
  }
}
```

---

## Angle Validation

Controls whether the spatial effect is shown based on viewing angle (hides 3D artifacts at extreme angles):

```typescript
// SpatialImageAngleValidator API:
validator.setValidZoneAngle(25)   // degrees — valid viewing cone (default 25°)
validator.setValidZoneFocal(2)    // focal distance behind image (default 2)

// Subscribe to validity changes
validator.addOnValidityCallback((entered: boolean) => {
  if (entered) {
    // User is looking straight at image — show full 3D
  } else {
    // Extreme angle — flatten back to 2D
  }
})
```

---

## Depth Animation

```typescript
// SpatialImageDepthAnimator — controls how "3D" the image looks:
depthAnimator.setBaseDepthScale(1.0)  // 0=flat, 1=full 3D (default max)
depthAnimator.animateSpeed = 2.0      // how fast depth transitions

// Easing: 'ease-in-out-sine' used internally — replace for custom effects
```

---

## Focal Point Adjustment (when image moves)

When user grabs and moves the image, adjust the focal offset to prevent depth warping:

```typescript
private setFocalPoint(): void {
  const camPos = this.camera.getTransform().getWorldPosition()
  const imgPos = this.spatializer.getTransform().getWorldPosition()
  const distance = camPos.distance(imgPos)
  this.spatializer.setFrameOffset(-distance)
}
```

---

## API Summary

### SpatialImageFrame

| Method | Description |
|--------|-------------|
| `setImage(texture, swapWhenSpatialized)` | Start spatializing a texture |
| `setSpatialized(bool)` | Toggle flat vs 3D display |

### SpatialImageAngleValidator

| Method | Description |
|--------|-------------|
| `setValidZoneAngle(degrees)` | Valid cone width in degrees |
| `setValidZoneFocal(distance)` | Focal distance behind image |
| `addOnValidityCallback(fn)` | Called when validity changes |
| `removeOnValidityCallback(fn)` | Unsubscribe |

### SpatialImageDepthAnimator

| Method | Description |
|--------|-------------|
| `setBaseDepthScale(0–1)` | Max depth of spatialization |
| `animateSpeed` | Transition speed |

---

## Troubleshooting

- **Background cut off** → Increase far clipping plane on camera
- **Doesn't appear in Preview** → Set preview device to Spectacles, check internet
- **Delays** → Only one spatialization at a time; queue requests
