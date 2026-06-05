---
name: new-lens-script
description: Create a new TypeScript component script for Lens Studio / Spectacles following project conventions. Use when asked to create a new script, component, or TypeScript file for a Spectacles template.
argument-hint: <ComponentName> [brief description]
paths: "**/*.ts"
---

# Create New Lens Studio TypeScript Script

Create a new TypeScript component script for: **$ARGUMENTS**

## Steps

1. **Determine the component name and purpose** from the arguments.
2. **Identify the target template folder** — scripts live at `Assets/<TemplateName>/Scripts/<ComponentName>.ts`.
3. **Generate the script** following this exact structure:

```typescript
/**
 * Specs Inc. 2026
 * <ComponentName> – <One-line description>
 *
 * Connections:
 * - <List key @input connections and what they connect to>
 *
 * Lifecycle:
 * - onAwake: Initialize logger, set up event listeners
 * - onStart: Validate inputs, start main logic
 */
import {bindStartEvent} from "SnapDecorators.lspkg/decorators"
import {Logger} from "Utilities.lspkg/Scripts/Utils/Logger"
// Add other imports as needed

@component
export class <ComponentName> extends BaseScriptComponent {
  @ui.label('<span style="color: #60A5FA;"><ComponentName> – <short description></span><br/><span style="color: #94A3B8; font-size: 11px;"><Detailed help for the inspector.></span>')
  @ui.separator

  // ─── Inputs ───────────────────────────────────────────────
  @ui.label('<span style="color: #60A5FA;">References</span>')
  @ui.group_start("References")
  @input
  @hint("<What this is used for>")
  someObject: SceneObject
  @ui.group_end

  // ─── Settings ─────────────────────────────────────────────
  @ui.separator
  @ui.label('<span style="color: #60A5FA;">Settings</span>')
  @ui.group_start("Settings")
  @input
  @hint("<What this setting does>")
  someValue: number = 1.0
  @ui.group_end

  // ─── Logging ──────────────────────────────────────────────
  @ui.separator
  @ui.label('<span style="color: #60A5FA;">Logging</span>')
  @input
  @hint("Enable general logging")
  enableLogging: boolean = false

  @input
  @hint("Enable lifecycle event logging")
  enableLoggingLifecycle: boolean = false

  private logger: Logger

  onAwake(): void {
    this.logger = new Logger(
      "<ComponentName>",
      this.enableLogging || this.enableLoggingLifecycle,
      true
    )
    if (this.enableLoggingLifecycle) this.logger.debug("LIFECYCLE: onAwake()")
  }

  @bindStartEvent
  private onStart(): void {
    if (this.enableLoggingLifecycle) this.logger.debug("LIFECYCLE: onStart()")
    this.validateInputs()
    this.initialize()
  }

  private validateInputs(): void {
    if (!this.someObject) {
      this.logger.error("someObject is not assigned in the Inspector!")
      return
    }
  }

  private initialize(): void {
    // Main setup logic
  }
}
```

4. **Adapt the template** to the actual use case — remove unused sections, add relevant imports and logic.
5. **Place the file** in the correct `Assets/<TemplateName>/Scripts/` directory.
6. **Do NOT** add `console.log`, `var`, or missing `@hint` annotations.

## Common Imports by Use Case

**Hand/Gesture interaction:**
```typescript
import {Interactable} from "SpectaclesInteractionKit.lspkg/Components/Interaction/Interactable/Interactable"
import {HandInputData} from "SpectaclesInteractionKit.lspkg/Providers/HandInputData/HandInputData"
import Event from "SpectaclesInteractionKit.lspkg/Utils/Event"
```

**Animation:**
```typescript
import animate from "SpectaclesInteractionKit.lspkg/Utils/animate"
import {LSTween} from "LSTween.lspkg/LSTween"
```

**Multiplayer:**
```typescript
import {SyncEntity} from "SpectaclesSyncKit.lspkg/Core/SyncEntity"
```

**AI/Networking:**
```typescript
import {Gemini, GeminiLiveWebsocket} from "RemoteServiceGateway.lspkg/HostedExternal/Gemini"
import {OpenAI, OpenAIRealtimeWebsocket} from "RemoteServiceGateway.lspkg/HostedExternal/OpenAI"
```
