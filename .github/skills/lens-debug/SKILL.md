---
name: lens-debug
description: Debug TypeScript errors, runtime crashes, missing references, and common Lens Studio / Spectacles development issues. Load when investigating bugs, errors, or unexpected behavior in Spectacles templates.
argument-hint: [error message or description]
user-invocable: false
---

# Lens Studio / Spectacles Debug Guide

Debugging issue: **$ARGUMENTS**

## Step 1: Identify the Error Type

### Compile-Time TypeScript Errors

| Error | Likely Cause | Fix |
|-------|-------------|-----|
| `Cannot find module 'X.lspkg/...'` | Package not in `Packages/` folder | Add the `.lspkg` package to the project's `Packages/` directory |
| `Property X does not exist on type Y` | Wrong component type or missing cast | Check `getComponent(TypeName.getTypeName())` usage |
| `Object is possibly undefined` | Missing null check | Guard with `if (!this.x) return` |
| `@component not recognized` | Missing SnapDecorators import | Verify `tsconfig.json` includes Lens Studio globals |

### Runtime Errors (Lens Studio Console)

| Error | Likely Cause | Fix |
|-------|-------------|-----|
| `Cannot read property 'X' of undefined` | `@input` not connected in Inspector | Check all `@input` fields are assigned in the Lens Studio Inspector |
| `X is not a function` | Wrong component type fetched | Verify the component type name string matches |
| `Script component not found` | Script not attached to scene object | Attach the script component in Scene Hierarchy |
| `Network request failed` | RSG not configured | Ensure Remote Service Gateway is set up in project settings |

---

## Step 2: Common Debug Patterns

### Check if @input fields are assigned

Always validate at the start of `onStart()`:

```typescript
@bindStartEvent
private onStart(): void {
  if (!this.myTarget) {
    print("[ERROR] MyComponent: myTarget is not assigned in the Inspector!")
    return
  }
  if (!this.myComponent) {
    print("[ERROR] MyComponent: myComponent reference missing!")
    return
  }
}
```

### Enable Logger output

Set `enableLogging = true` and `enableLoggingLifecycle = true` on the component in the Inspector to see lifecycle events. Or add temporary `print()` calls:

```typescript
print("[DEBUG] MyComponent: value = " + JSON.stringify(this.someValue))
```

### Verify component fetch

```typescript
// CORRECT — use getTypeName() static method
const interactable = obj.getComponent(Interactable.getTypeName()) as Interactable

// Then verify
if (!interactable) {
  print("[ERROR] No Interactable component found on " + obj.name)
  return
}
```

### Check event subscription timing

Events must be subscribed in `onAwake()`, before the first `onStart()` fires:

```typescript
onAwake(): void {
  // Subscribe here — NOT in onStart
  this.otherComponent.onSomething.add((data) => {
    this.handleData(data)
  })
}
```

---

## Step 3: Category-Specific Debugging

### SIK (SpectaclesInteractionKit)

```typescript
// Is hand tracking active?
const hand = HandInputData.getInstance().getHand("right")
print("[DEBUG] Right hand tracked: " + hand.isTracked())

// Is the Interactable triggering?
interactable.onTriggerStart.add(() => {
  print("[DEBUG] Interactable triggered!")
})

// Is WorldCameraFinderProvider working?
const cam = WorldCameraFinderProvider.getInstance()
print("[DEBUG] Camera found: " + (cam !== null))
```

### Remote Service Gateway (AI)

```typescript
// Check WebSocket states
this.GeminiLive.onOpen.add(() => print("[DEBUG] Gemini: connected"))
this.GeminiLive.onError.add((e) => print("[ERROR] Gemini: " + JSON.stringify(e)))
this.GeminiLive.onClose.add((e) => print("[DEBUG] Gemini: closed — " + e.reason))

// Check audio output
this.dynamicAudioOutput.onAudioStarted?.add(() => print("[DEBUG] Audio output started"))
```

### Sync Kit (Multiplayer)

```typescript
// Am I the owner?
print("[DEBUG] doIOwnStore: " + this.syncEntity.networkRoot.doIOwnStore())

// Is session connected?
const session = SessionController.getInstance()
print("[DEBUG] Session users: " + session.getUsers().length)

// Did property change arrive?
this.myProp.onRemoteChange.add((val) => {
  print("[DEBUG] Remote change received: " + JSON.stringify(val))
})
```

### SnapML

```typescript
// Did inference run?
this.mlComponent.runImmediate(false)
const out = this.mlComponent.getOutput("output")
print("[DEBUG] ML output shape: " + JSON.stringify(out?.shape))
print("[DEBUG] ML output length: " + (out?.data as Float32Array)?.length)
```

---

## Step 4: Performance Issues

### Frame rate drop

- Move heavy computation out of `UpdateEvent` — use interval-based throttling:
  ```typescript
  private frameCounter = 0
  private onUpdate(): void {
    if (++this.frameCounter % 5 !== 0) return  // run every 5 frames
    this.heavyOperation()
  }
  ```

- Avoid creating objects every frame — pre-allocate:
  ```typescript
  // BAD
  this.createEvent("UpdateEvent").bind(() => {
    const v = new vec3(0, 1, 0)  // allocation every frame
  })

  // GOOD
  private readonly UP = new vec3(0, 1, 0)  // allocated once
  ```

### Memory leaks (events not unsubscribed)

```typescript
onAwake(): void {
  const handler = (data: any) => this.handleData(data)
  this.other.onSomething.add(handler)

  // Clean up on destroy
  this.createEvent("OnDestroyEvent").bind(() => {
    this.other.onSomething.remove(handler)
  })
}
```

---

## Step 5: Useful Lens Studio APIs for Debugging

```typescript
// Print to console (always visible, regardless of Logger)
print("Debug: " + message)

// Current time
const t = getTime()

// Check if scene object is enabled
print("Enabled: " + this.getSceneObject().enabled)

// Get component on a scene object
const comp = sceneObj.getComponent("Component.ScriptComponent")

// Find scene object by name (expensive — avoid in UpdateEvent)
const obj = scene.getRootObject(0)  // gets first root; traverse manually
```
