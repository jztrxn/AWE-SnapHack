---
name: spectacles-conventions
description: Spectacles TypeScript coding conventions, Lens Studio component patterns, decorators, logging, and project structure. Load automatically when writing or reviewing TypeScript for Lens Studio / Spectacles.
user-invocable: false
paths: "**/*.ts"
---

# Spectacles TypeScript Conventions

Always apply these conventions when writing or modifying TypeScript for this project.

## Component Structure

Every interactive script must:
- Use `@component` decorator
- Extend `BaseScriptComponent`
- Include a `@ui.label` describing the component for the Inspector
- Use `@input @hint()` for every exposed property
- Set up a `Logger` in `onAwake()`

```typescript
/**
 * Specs Inc. 2026
 * ComponentName – Brief description of purpose
 */
import {bindStartEvent} from "SnapDecorators.lspkg/decorators"
import {Logger} from "Utilities.lspkg/Scripts/Utils/Logger"

@component
export class ComponentName extends BaseScriptComponent {
  @ui.label('<span style="color: #60A5FA;">ComponentName – One-line purpose</span><br/><span style="color: #94A3B8; font-size: 11px;">Detailed inspector help text.</span>')
  @ui.separator

  @ui.label('<span style="color: #60A5FA;">References</span>')
  @ui.group_start("References")
  @input
  @hint("What this reference is used for")
  someTarget: SceneObject

  @input
  @hint("Another exposed property")
  someValue: number = 1.0
  @ui.group_end

  @ui.separator
  @ui.label('<span style="color: #60A5FA;">Logging</span>')
  @input
  @hint("Enable general logging")
  enableLogging: boolean = false

  @input
  @hint("Enable lifecycle event logging (onAwake, onStart, etc.)")
  enableLoggingLifecycle: boolean = false

  private logger: Logger

  onAwake(): void {
    this.logger = new Logger("ComponentName", this.enableLogging || this.enableLoggingLifecycle, true)
    if (this.enableLoggingLifecycle) this.logger.debug("LIFECYCLE: onAwake()")
  }

  @bindStartEvent
  private onStart(): void {
    if (this.enableLoggingLifecycle) this.logger.debug("LIFECYCLE: onStart()")
    if (!this.someTarget) {
      this.logger.error("someTarget is not assigned!")
      return
    }
  }
}
```

## Naming Conventions

- Classes: `PascalCase` (e.g. `AIAssistantUIBridge`, `SphereController`)
- Files: `PascalCase.ts` matching the class name
- No spaces in folder/file names — use CamelCase
- Scripts live in `Assets/<ProjectName>/Scripts/`

## Imports

```typescript
// 1. Package imports (.lspkg paths)
import {Interactable} from "SpectaclesInteractionKit.lspkg/Components/Interaction/Interactable/Interactable"
import {Logger} from "Utilities.lspkg/Scripts/Utils/Logger"

// 2. Local imports
import {MyHelper} from "./MyHelper"

// 3. Lens Studio globals are implicit (no import needed)
// vec3, quat, SceneObject, etc. are always available
```

## Key Packages (import paths)

| Package | Import prefix |
|---------|--------------|
| SpectaclesInteractionKit | `SpectaclesInteractionKit.lspkg/` |
| SpectaclesSyncKit | `SpectaclesSyncKit.lspkg/` |
| SpectaclesUIKit | `SpectaclesUIKit.lspkg/` |
| RemoteServiceGateway | `RemoteServiceGateway.lspkg/` |
| LSTween | `LSTween.lspkg/` |
| Utilities | `Utilities.lspkg/` |
| SnapDecorators | `SnapDecorators.lspkg/` |

## Event Pattern

```typescript
import Event from "SpectaclesInteractionKit.lspkg/Utils/Event"

// Declare
public onSomething: Event<{value: string}> = new Event<{value: string}>()

// Subscribe
this.otherComponent.onSomething.add((data) => {
  this.logger.info("Received: " + data.value)
})

// Invoke
this.onSomething.invoke({value: "hello"})
```

## Lifecycle Events

Use `createEvent` for Lens Studio lifecycle hooks:

```typescript
onAwake(): void {
  this.createEvent("UpdateEvent").bind(() => this.onUpdate())
  this.createEvent("OnDestroyEvent").bind(() => this.onDestroy())
}
```

Or use SnapDecorators:

```typescript
import {bindStartEvent, bindUpdateEvent} from "SnapDecorators.lspkg/decorators"

@bindStartEvent
private onStart(): void { /* ... */ }

@bindUpdateEvent
private onUpdate(): void { /* ... */ }
```

## Error Handling

Always guard inputs at the start of `onStart()`:

```typescript
if (!this.requiredInput) {
  this.logger.error("requiredInput is not assigned in the Inspector!")
  return
}
```

## DO NOT

- Use `var` — use `const` or `let`
- Use `console.log` — use `this.logger`
- Leave `@input` without `@hint`
- Use spaces in file/folder names
- Import from framework internals not in `.lspkg/` paths
