---
name: api-spatial-anchors
description: Place and persist AR content at fixed real-world positions using the Spatial Anchors API (AnchorModule, AnchorSession, WorldAnchor). Anchors survive across Lens sessions. Load when implementing persistent AR placement, furniture placement, room decoration, or location-anchored content.
user-invocable: false
---

# Spatial Anchors API

**Requirements:** Lens Studio v5.12+, Spectacles OS v5.63+. Install **Spatial Anchors** package from Asset Library.

Reference: `Spatial Anchors/` template

---

## Architecture

```
AnchorModule (scene asset)
  └── openSession() → AnchorSession
        ├── createWorldAnchor(pose) → WorldAnchor
        ├── saveAnchor(anchor)         (persists across sessions)
        ├── deleteAnchor(anchor)
        └── onAnchorNearby → (anchor)  (fired when scan finds saved anchor)

AnchorComponent (on SceneObject)
  └── .anchor = myAnchor              (attaches object to world position)
```

---

## Setup

1. Add **AnchorModule** scene object (from Spatial Anchors package) to hierarchy
2. Camera needs **Device Tracking** component in **World** mode
3. For cloud persistence: add **Location Cloud Storage Module** + permissions script

```typescript
// Required for cloud storage
@component
export class Permissions extends BaseScriptComponent {
  onAwake() { require('LensStudio:ConnectedLensModule') }
}
```

---

## Full Implementation

```typescript
import {AnchorSession, AnchorSessionOptions} from './Spatial Anchors/AnchorSession'
import {Anchor} from './Spatial Anchors/Anchor'
import {AnchorComponent} from './Spatial Anchors/AnchorComponent'
import {AnchorModule} from './Spatial Anchors/AnchorModule'
import {PinchButton} from 'SpectaclesInteractionKit.lspkg/Components/UI/PinchButton/PinchButton'

@component
export class AnchorPlacementController extends BaseScriptComponent {
  @input anchorModule: AnchorModule
  @input createButton: PinchButton
  @input camera: SceneObject
  @input contentPrefab: ObjectPrefab

  private anchorSession: AnchorSession

  onAwake(): void {
    this.createEvent('OnStartEvent').bind(() => this.onStart())
    this.createEvent('OnDestroyEvent').bind(() => this.cleanup())
  }

  private async onStart(): Promise<void> {
    // Wire up create button
    this.createButton.onButtonPinched.add(() => this.placeAnchor())

    // Start session — scans for previously saved anchors
    const options = new AnchorSessionOptions()
    options.scanForWorldAnchors = true
    options.area = "my-lens-area"  // optional: scope anchors to a named area

    this.anchorSession = await this.anchorModule.openSession(options)

    // Called when a previously saved anchor is found during scan
    this.anchorSession.onAnchorNearby.add((anchor: Anchor) => {
      print("[Anchors] Found anchor: " + anchor.id + " state=" + anchor.state)
      this.attachContent(anchor)
    })
  }

  // Create a new anchor 50cm in front of the user and save it
  private async placeAnchor(): Promise<void> {
    const camTransform = this.camera.getTransform().getWorldTransform()
    const anchorPose = camTransform.mult(mat4.fromTranslation(new vec3(0, 0, -50)))

    const anchor = await this.anchorSession.createWorldAnchor(anchorPose)
    this.attachContent(anchor)

    // Save to persist across sessions
    try {
      await this.anchorSession.saveAnchor(anchor)
      print("[Anchors] Saved anchor: " + anchor.id)
    } catch (err) {
      print("[Anchors] Save failed: " + err)
    }
  }

  // Attach a prefab to an anchor via AnchorComponent
  private attachContent(anchor: Anchor): void {
    const obj = this.contentPrefab.instantiate(this.getSceneObject())
    obj.setParent(this.getSceneObject())

    const anchorComp = obj.createComponent(AnchorComponent.getTypeName()) as AnchorComponent
    anchorComp.anchor = anchor

    // Track anchor state
    anchor.onFound.add(() => {
      print("[Anchors] Anchor found — showing content")
      obj.enabled = true
    })
    anchor.onLost.add(() => {
      print("[Anchors] Anchor lost — hiding content")
      obj.enabled = false
    })
    anchor.onError.add((err: Error) => {
      print("[Anchors] Anchor error: " + err.message)
    })
  }

  private async cleanup(): Promise<void> {
    await this.anchorSession?.close()
  }
}
```

---

## Anchor States

```
Initializing → Ready → Found ↔ Lost
                     → Error (terminal)
```

| State | Meaning |
|-------|---------|
| `Initializing` | Just created or loading |
| `Ready` | Has all info needed to track |
| `Found` | Currently tracked — `toWorldFromAnchor` is valid |
| `Lost` | Temporarily not visible — retain content |
| `Error` | Unrecoverable — `onFound` will never fire |

---

## Update / Delete Anchors

```typescript
// Move an existing anchor to a new pose
anchor.toWorldFromAnchor = newPose  // mat4
await this.anchorSession.saveAnchor(anchor)

// Delete permanently
await this.anchorSession.deleteAnchor(anchor)

// Reset session (forget all anchors in current area)
await this.anchorSession.reset()
```

---

## Key Notes

- **Content is NOT saved** — only the anchor pose persists. Re-attach content in `onAnchorNearby`
- Use `anchor.id` (unique per area) to map anchors to your content data
- Local storage is default — cloud storage requires `LocationCloudStorageModule`
- Device needs to **relocalize** in the same physical area to find saved anchors
- Script must be placed **after** AnchorModule in the Scene Hierarchy
