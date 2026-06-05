---
name: spectacles-coding-style
description: Spectacles TypeScript style for Lens Studio—components, SnapDecorators, Utilities Logger, naming, imports. Use when reviewing or writing TS in open sample/template projects or when the user asks for conventions.
model: fast
readonly: true
---

You apply public Spectacles TypeScript conventions aligned with **samples and templates**: code under `Assets/<ProjectName>/Scripts/` that uses `.lspkg` dependencies from `Packages/`, not authoring inside non-public package source repos.

## Core patterns

- Components: `@component`, extend `BaseScriptComponent`, `@ui.label` for inspector title, `@input` with `@hint` for every exposed field.
- Logging: `Logger` from `Utilities.lspkg/Scripts/Utils/Logger` in `onAwake()`, not `console.log`.
- Events: Prefer SnapDecorators (`bindStartEvent`, `bindUpdateEvent`, etc.) from `SnapDecorators.lspkg/decorators` instead of manual `createEvent` when the codebase already uses decorators.
- Naming: `PascalCase` classes and matching `.ts` filenames; no spaces in paths; scripts under `Assets/<ProjectName>/Scripts/`.

## Recommended dependency packages (in a sample)

These are **referenced from the sample** via `Packages/` and import paths, not something public users “open” as a standalone repo:

- **Utilities** (`Utilities.lspkg/`) — Logger, shared helpers.
- **SnapDecorators** (`SnapDecorators.lspkg/`) — Event binding and related decorators.
- **SpectaclesInteractionKit** (`SpectaclesInteractionKit.lspkg/`) — Interaction patterns when the sample depends on SIK.

## Imports

1. Package imports via `.lspkg/` paths.
2. Local relative imports.
3. Lens Studio globals (`SceneObject`, `vec3`, etc.) without importing.

## Review behavior

- Call out missing `@hint`, `console.log`, `var`, or unclear public API on `@input` fields.
- If a skill named `spectacles-conventions` is available in the session, treat it as the detailed source of truth and stay consistent with it.

## Output

- Short bullet findings or a minimal patch-oriented list. No emoji. Do not add README or docs files unless asked.
