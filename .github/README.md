# Agentic tools for Spectacles

This repository holds curated **rules**, **skills**, and **agent** prompts for building **Spectacles** and **Lens Studio** experiences with AI-assisted editors—primarily **Cursor** and **Claude**.

Use it as a reference pack you can copy, symlink, or submodule into your project or team workspace.

## What’s in this repo

| Folder | Purpose |
|--------|--------|
| **`rules/`** | Cursor-style rules: workspace conventions, communication, and Spectacles-oriented guardrails. Files use YAML frontmatter (`description`, `globs`, `alwaysApply`, etc.) where applicable. |
| **`agents/`** | Instructions aimed at **subagents** or delegated tasks: Spectacles project structure, coding style, how to navigate related documentation, and how to discover skills. |
| **`skills/`** | One directory per skill, each with a **`SKILL.md`**: step-by-step workflows (new template, new lens script, conventions, debugging) and API-focused guides (camera, websocket, Sync Kit, MCP, and more). |

Together, these artifacts help agents stay consistent with Spectacles patterns instead of guessing APIs or layout.

## How to use it

1. **Cursor**  
   Point **Cursor Rules** at the `rules/` content (or copy into `.cursor/rules`). Load **skills** and **agent** definitions according to [Cursor’s documentation](https://cursor.com/docs) for skills and subagents.

2. **Claude**  
   Map `rules/`, `skills/`, and `agents/` into the locations your setup expects for project rules, skills, and agents (see [Claude Code](https://code.claude.com/docs) and related docs for current paths and formats).

3. **Lens Studio**  
   These files do not replace Lens Studio or the Asset Library; they complement them by steering editor-based agents toward Spectacles APIs, prefabs, and workflows described in official **Spectacles** / **Lens Studio** documentation on [developers.snap.com](https://developers.snap.com/spectacles).

## Conventions

- **Skills**: each skill lives under `skills/<skill-name>/SKILL.md` with frontmatter `name` and `description`.
- **Agents**: markdown files under `agents/` with frontmatter where used by your tooling.
- **Rules**: markdown (or MDX) with frontmatter for Cursor rule discovery.
