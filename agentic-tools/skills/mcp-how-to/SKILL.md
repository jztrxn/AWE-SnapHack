---
name: mcp-how-to
description: Lens Studio Developer Mode and MCP—start the HTTP MCP server, wire Cursor or Claude Code, extend ChatTools, and wire editor rules from agentic-tools. Use when the user asks how to connect Lens Studio to an IDE, fix MCP auth, or what tools the server exposes.
argument-hint: [cursor|claude|tools|troubleshooting]
---

# Lens Studio MCP and Developer Mode

Lens Studio **Developer Mode** uses **ChatTools** (Lens Studio plugins extending `ChatTool`) so an AI can inspect and modify the project, scene, and assets. The same capabilities can be exposed over **MCP** (HTTP) so **Cursor**, **Claude Code**, or other MCP clients can drive Lens Studio while you edit in the scripting editor.

Prerequisites users typically need:

- Lens Studio with **AI Assistant** and the **Chat Tool** support from the Asset Library (see Lens Studio docs for the current package name).
- For external MCP: the MCP server **running in Lens Studio** whenever the IDE agent should call tools.

## Start MCP server in Lens Studio

1. Menu: **AI Assistant** > **AI Model Context Protocol (MCP)** > **Configure Server** (wording may vary slightly by version).
2. In the dialog: **Start Server**.
3. **Copy MCP Config**. Clipboard JSON looks like:

```json
{
  "servers": {
    "lens-studio": {
      "headers": {
        "Authorization": "Bearer [your-auth-token]"
      },
      "type": "http",
      "url": "http://localhost:[port]/mcp"
    }
  }
}
```

Keep **URL** and **Bearer token** for the client. Tokens can change when the server restarts.

## Claude Code

1. Start the server and copy config from Lens Studio (above).
2. Add the server (replace placeholders):

```bash
claude mcp add --transport http lens-studio http://localhost:[port]/mcp \
  --header "Authorization: Bearer [your-auth-token]"
```

Scopes: `--scope local` (default), `--scope project` (`.mcp.json`), `--scope user`.

3. Verify: `claude mcp list` or `/mcp` in session.
4. If the token changes: `claude mcp remove lens-studio`, copy fresh config, add again.

You can also paste the copied JSON into chat and ask Claude Code to add the server.

Optional: project agent file `.claude/agents/lens-studio-agent.md` with Lens Studio TypeScript and MCP workflow hints (see official Lens Studio “Example Prompt” for full system-style guidance).

## Cursor

1. Open MCP settings (Command Palette: MCP / Tools and MCP / Add Custom MCP—depends on Cursor version).
2. Edit the MCP JSON (e.g. `mcp.json` / `mcp_config.json` per Cursor docs).
3. Merge under `mcpServers`:

```json
{
  "mcpServers": {
    "lens-studio": {
      "headers": {
        "Authorization": "Bearer [your-auth-token]"
      },
      "type": "http",
      "url": "http://localhost:[port]/mcp"
    }
  }
}
```

4. Enable the server in **Tools and MCP**, restart Cursor if needed, start a new chat with Lens Studio still running.

Use **Cursor Rules** (`.cursor/rules`) to steer behavior: prefer introspection tools before edits, Lens Studio TS conventions, and rules from **agentic-tools** `public/` (plus any project **`.context/`** policy you use).

## Developer Mode in the panel

- Toggle **Developer mode** from the chat panel mode dropdown.
- Example prompts can call tools (scene graph, debug, asset library, music, etc.).
- Long threads lose focus; start a new chat when needed.
- Ask for fixes or “double check” when errors appear.

## Extending tools (ChatTools)

- Additional tools are **Lens Studio plugins** extending `ChatTool`.
- Install from **Asset Library** or **Add New Tool** in the tool configurator; manage under **Lens Studio Preferences**.
- Teams can share a folder of tools.

## Context engineering (brief)

- **agentic-tools** (rules, skills, agents) and **specs-ai-context** (org repo with docs, frameworks, packages, samples) are **different repositories**. Using MCP or this repo does **not** require cloning specs-ai-context.
- **specs-ai-context** exists in the org for teams that want that material available; it is optional and separate from agentic-tools.
- For editor behavior, point **Cursor Rules** or Claude project instructions at **`public/`** from agentic-tools (and any project **`.context/`** folder you maintain locally).
- Optional: editor screenshots or Lens panel capture tools if your stack supports them.

This skill does not duplicate full “Example Prompt” text; send users to official Lens Studio AI / Spectacles documentation for the latest prompts.

## MCP tool identifiers (ChatTools)

The HTTP MCP server advertises tools whose IDs come from each ChatTool schema `name`. A typical set (aligned with Lens Studio AI Assistant ChatTools) includes the following. **Your build may register a subset**; use the client’s tool list as source of truth.

| Tool ID | Role (summary) |
|---------|----------------|
| `GetLensStudioSceneGraph` | Scene hierarchy; use depth and include flags to limit payload |
| `GetLensStudioSceneObjectById` / `GetLensStudioSceneObjectByName` | Resolve scene objects |
| `SetLensStudioProperty` | Set component / object properties |
| `SetLensStudioParent` | Reparent scene objects |
| `SetLensStudioSelection` | Editor selection |
| `CreateLensStudioSceneObject` / `CreateSceneObjectFromPresetTool` | Create objects (preset or generic) |
| `DeleteLensStudioSceneObject` / `DuplicateLensStudioSceneObject` / `RenameLensStudioSceneObject` | Scene object lifecycle |
| `CreateLensStudioComponent` / `CreateComponentFromPresetTool` / `DeleteLensStudioComponent` | Components |
| `GetLensStudioAssetById` / `GetLensStudioAssetByPath` / `GetLensStudioAssetsByName` | Asset lookup |
| `ListLensStudioAssets` | List assets |
| `CreateLensStudioAsset` / `CreateAssetFromPresetTool` / `DeleteLensStudioAsset` / `DuplicateLensStudioAsset` / `MoveLensStudioAsset` / `RenameAsset` | Asset lifecycle |
| `InstantiateLensStudioPrefab` | Instantiate prefab |
| `CreatePrefabFromSceneObject` | Prefab from scene object |
| `GetPresetRegistryTool` | Preset registry |
| `SearchLensStudioAssetLibrary` / `InstallLensStudioPackage` | Asset Library |
| `SearchLensStudioMusicLibrary` / `InstallLicensedMusic` | Licensed music |
| `ListInstalledPackagesTool` | Installed packages |
| `RecompileTypeScriptTool` | TS compile |
| `FileReadTool` / `FileGrepTool` / `FileEditTool` | Project files |
| `ExecuteEditorCode` | Run editor-side code |
| `QueryLensStudioKnowledgeBase` | RAG / knowledge |
| `GenerateFast3DAssets` | Fast3D generation |
| `GetBoundingBox` | Bounds |
| `ListAllPanels` | UI panels |
| `CapturePanelScreenshotTool` | Panel screenshot |
| `RunAndCollectLogsTool` | Run and collect logs |
| `GetLensStudioLogsTool` | Logs (may be absent in some builds) |
| `scene-graphql` / `asset-graphql` | GraphQL-style scene/asset queries |

Workflow hint for agents: **introspect** (scene graph, assets, presets) before **mutating** (create, set property, delete). Prefer shallow scene graph queries, then drill into UUIDs.

## Troubleshooting

- **No tools / connection failed**: Lens Studio MCP server must be **started**; URL and port must match the client.
- **401 / auth errors**: Copy **new** config after restart; update Bearer header in Cursor JSON or `claude mcp add` again.
- **Tools missing after plugin changes**: Restart MCP server; in Claude Code use `/mcp` or re-add config.
- **Cursor**: confirm server enabled under Tools and MCP after editing JSON.

## Related

- Official Lens Studio docs: Developer Mode, MCP, Claude Code, Cursor, VS Code, context engineering.
- Official MCP docs for **Cursor** and **Claude Code** for file locations and flags.
- **specs-ai-context** is a separate org repository from **agentic-tools**; use it only if your workspace or workflow already includes it. Optional project **`.context/`** for local notes.
