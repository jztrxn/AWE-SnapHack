---
description: Multi-root workspaces with a context folder and Spectacles project layout. Scan available context and docs paths before answering questions about conventions or tooling.
alwaysApply: true
---

# Workspace and context

## Layout

Many workspaces use:

- A top-level **context** (or similarly named) folder: curated docs or reference material.
- A separate **project** tree: a **sample or template** Lens Studio experience (`.esproj`, `Assets/`, `Packages/` as consumed `.lspkg` deps).

Treat these as distinct roots. Prefer project-local paths when editing code or assets.

Default mental model for public use: the user is editing an **openable sample**, not maintaining a closed package product repo.

## Context and docs

If a `context/` directory exists in the workspace (or static docs under `docs/`, `specs-agentic-tools/docs/`, etc.), proactively list or read relevant files before answering questions about tooling, Cursor/Claude behavior, or conventions documented there. Do not assume content you have not inspected.

## Creating or moving files

Before creating new files or large refactors:

1. Ask the user **where** the file should live (exact folder or workspace root).
2. Default expectation for Spectacles content: under the active project’s **`Assets/<ProjectName>/...`** (Scripts, Prefabs, etc.), not at the repository root unless the user says otherwise.
3. Do not scatter files into `context/` unless the user asks to store reference material there.

## Scope

These rules are for discovery and formatting workflows. Prefer official Spectacles and Lens Studio documentation when explaining platform behavior.
