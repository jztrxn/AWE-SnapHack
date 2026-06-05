---
name: api-custom-locations
description: Build AR experiences tied to specific real-world locations using Custom Locations — scan a space with Spectacles, import the mesh into Lens Studio, and place AR content that appears in that exact physical location. Load when implementing location-locked AR, site-specific experiences, or scanning-based content placement.
user-invocable: false
---

# Custom Locations — Real-World Location AR

**Requirements:** Lens Studio v5.7+, Spectacles OS v5.060+. Custom Locations Lens app on Spectacles.

Reference: `Custom Locations/` template (London example)

---

## Workflow Overview

```
1. Scan location on-device (Custom Locations Lens)
      ↓ creates colored mesh + localization viewpoints
2. Publish scan → get Location ID
      ↓
3. Import mesh into Lens Studio (Scene → World → Custom Location)
      ↓ enter Location ID
4. Place AR content relative to the scanned mesh
      ↓
5. Publish Lens → users see content at that location
```

---

## Step 1: Scanning a Location

1. Open **Custom Locations Lens** on Spectacles (found in All Lenses)
2. Tap **Scan New** → **Begin Scanning**
3. Move **laterally** around the space — avoid rotating in place
4. Continue until mesh looks complete → tap **Finish Scan**
5. Accept legal disclaimer → Publish → note the **Location ID**

**Good scan tips:**
- Move in a sweeping figure-8 pattern
- Cover all angles users will view from
- Avoid fast camera motion and extreme up/down angles
- Scan for longer to get more localization viewpoints

---

## Step 2: Import Mesh to Lens Studio

1. In Lens Studio Scene Hierarchy: `World → Custom Location`
2. Select the new asset in Asset Browser
3. Enter your **Location ID** in the field
4. Lens Studio downloads and shows the colored mesh

> The mesh is a **dev tool** for positioning content — don't use it as a visual in the published Lens.

---

## Step 3: Place AR Content

Position virtual objects relative to the imported mesh in Lens Studio. The `LocatedAtComponent` ties objects to the location:

```typescript
// Objects under the Custom Location node in hierarchy
// are automatically placed using LocatedAtComponent tracking
// No scripting needed for basic placement

// For dynamic content at runtime:
@component
export class LocationContentController extends BaseScriptComponent {
  @input
  @hint("The Custom Location scene object (with LocatedAtComponent)")
  customLocation: SceneObject

  onAwake(): void {
    this.createEvent('OnStartEvent').bind(() => this.setupContent())
  }

  private setupContent(): void {
    // Check if location has been found (device localized to scan)
    const locatedAt = this.customLocation
      .getComponent('Component.LocatedAtComponent')

    if (locatedAt) {
      print("[CustomLoc] Location component found")
    }
  }
}
```

---

## Location Groups (multiple nearby locations)

Link up to 5 nearby locations (<20m apart) into a group for seamless transitions:

1. In Custom Locations Lens: **New Group** → select locations → **New Group**
2. Visit each location and wait for stabilization → **Finalize**
3. In Lens Studio: Add `Custom Location Group` component → enter **Group ID** → **Reload Group**
4. Lens Studio generates child Custom Location objects for each member

```
SceneObject
  └── Custom Location Group (component, Group ID: "abc123")
        ├── Custom Location A
        ├── Custom Location B
        └── Custom Location C
```

---

## Incremental Scans (add more viewpoints)

When users can't localize from certain angles, add viewpoints without changing the mesh:

1. In Custom Locations Lens: `...` on existing scan → `+` → confirm
2. Localize against existing scan → tap **Finish Scan**
3. Move around to capture new viewpoints → **Publish** → get **new ID**
4. In Lens Studio: replace the old Location ID with the new one
5. Publish updated Lens

> New scan = new ID, same coordinate frame → no need to reposition AR content

---

## Key Concepts

| Concept | Description |
|---------|-------------|
| **Location ID** | Unique scan identifier — share carefully (public once published) |
| **Viewpoints** | Camera positions from which Spectacles can localize |
| **Localization** | Device recognizing its position within a scanned space |
| **Mesh** | Visual aid in Lens Studio only — not rendered in published Lens |
| **LocatedAtComponent** | Lens Studio component that anchors content to a location |

---

## Limitations

- Saved Location IDs are stored **locally on-device** — factory reset loses them
- Published locations are **public** — avoid scanning private/sensitive spaces
- Maximum **5 locations** per group
- Works outdoors and indoors — indoors often scans better
- Performance degrades in very large spaces — keep scans focused
