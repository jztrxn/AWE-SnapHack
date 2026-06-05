---
name: new-template
description: Create a new Spectacles Lens Studio template project following the repository structure conventions. Use when asked to scaffold a new template, example project, or sample experience.
argument-hint: <TemplateName> [brief description]
disable-model-invocation: true
---

# Create New Spectacles Template

Create a new template project named: **$ARGUMENTS**

## Template Directory Structure

```
<TemplateName>/
├── <TemplateName>.esproj          # Lens Studio project file (copy from existing)
├── ci_export.json                 # Optional upload metadata for Asset Library workflows (use placeholders until your process assigns IDs)
├── Assets/
│   ├── <TemplateName>/
│   │   ├── AssetImage/            # Promotional images (PNG, SVG)
│   │   ├── Prefabs/               # Reusable scene prefabs
│   │   ├── Render/                # Render settings
│   │   ├── Scripts/               # TypeScript components
│   │   └── Textures/              # Textures and images
│   └── Modules/                   # Package dependencies (Packages folder)
├── Packages/                      # Dependent .lspkg packages
└── README.md                      # Template documentation
```

## Steps to Create

### 1. Create the directory structure

```bash
mkdir -p "<TemplateName>/Assets/<TemplateName>/Scripts"
mkdir -p "<TemplateName>/Assets/<TemplateName>/Prefabs"
mkdir -p "<TemplateName>/Assets/<TemplateName>/Render"
mkdir -p "<TemplateName>/Assets/<TemplateName>/AssetImage"
mkdir -p "<TemplateName>/Assets/<TemplateName>/Textures"
mkdir -p "<TemplateName>/Packages"
```

### 2. Create `ci_export.json`

```json
{
  "qa": {
    "entry_id": "",
    "space_id": ""
  },
  "prod": {
    "entry_id": "",
    "space_id": ""
  }
}
```

### 3. Create a starter README.md

```markdown
# <TemplateName>

Brief description of what this template demonstrates.

## Features

- Feature 1
- Feature 2

## Requirements

- Spectacles device (or Lens Studio preview)
- Lens Studio 5.x or later

## Packages Used

- SpectaclesInteractionKit (SIK)
- [List other packages]

## How It Works

Describe the key scripts and how they connect.

## Key Scripts

| Script | Purpose |
|--------|---------|
| `<MainScript>.ts` | Entry point and orchestration |

## Getting Started

1. Open `<TemplateName>.esproj` in Lens Studio
2. Build and send to Spectacles
3. [Usage instructions]
```

### 4. Create the main TypeScript script

Create `Assets/<TemplateName>/Scripts/<MainController>.ts` following the standard component pattern from `spectacles-conventions`:

```typescript
/**
 * Specs Inc. 2026
 * <MainController> – Entry point for <TemplateName>
 */
import {bindStartEvent} from "SnapDecorators.lspkg/decorators"
import {Logger} from "Utilities.lspkg/Scripts/Utils/Logger"

@component
export class <MainController> extends BaseScriptComponent {
  @ui.label('<span style="color: #60A5FA;"><MainController> – <description></span>')
  @ui.separator

  @input
  @hint("Enable general logging")
  enableLogging: boolean = false

  @input
  @hint("Enable lifecycle logging")
  enableLoggingLifecycle: boolean = false

  private logger: Logger

  onAwake(): void {
    this.logger = new Logger("<MainController>", this.enableLogging || this.enableLoggingLifecycle, true)
    if (this.enableLoggingLifecycle) this.logger.debug("LIFECYCLE: onAwake()")
  }

  @bindStartEvent
  private onStart(): void {
    if (this.enableLoggingLifecycle) this.logger.debug("LIFECYCLE: onStart()")
    this.initialize()
  }

  private initialize(): void {
    this.logger.info("<TemplateName> initialized")
  }
}
```

### 5. Naming rules

- **No spaces** — use `CamelCase` for all directories and files
- **PascalCase** for TypeScript class names
- The template folder name at the repo root is the canonical project name
- Scripts mirror the class name: `MyComponent.ts` exports `class MyComponent`

## Packages to Add (in Packages/ folder)

Always required:
- `SpectaclesInteractionKit.lspkg` — hand tracking and interaction
- `SnapDecorators.lspkg` — `@bindStartEvent`, `@bindUpdateEvent`
- `Utilities.lspkg` — `Logger`

Add as needed:
- `SpectaclesSyncKit.lspkg` — multiplayer
- `SpectaclesUIKit.lspkg` — UI components
- `RemoteServiceGateway.lspkg` — AI APIs
- `LSTween.lspkg` — animations
- `SpectaclesNavigationKit.lspkg` — navigation/mapping

## Reference Examples by Category

| What to build | Best reference template |
|--------------|------------------------|
| Basic interaction | `Essentials/` |
| AI voice/chat | `AI Playground/` |
| Multiplayer | `Sync Kit Basic Example/` |
| ML/Vision | `SnapML Starter/` |
| Spatial/depth | `Spatial Image/` |
| Navigation | `Navigation Kit/` |
| Networking | `Fetch/` |
