---
name: api-web-view
description: Embed live web content (HTTPS websites, web apps, YouTube) inside a Lens using WebView. Integrates with SIK for hand interaction and keyboard input. Experimental API. Load when embedding web pages, help docs, videos, or web-based UI into a Spectacles experience.
user-invocable: false
---

# Web View — Embed Web Content in AR

**Requirements:** Lens Studio v5.3+, Spectacles OS v5.58+. Experimental API (enable in Project Settings). Install **WebView** package from Asset Library. Spectacles device only.

> Only `https://` URLs supported. Camera and microphone NOT available to web content.

Reference: `Spectacles Mobile Kit/`

---

## Setup Steps

1. Enable **Experimental APIs** in Project Settings
2. Install **WebView** from Asset Library and import it
3. Create a Scene Object under SpectaclesInteractionKit hierarchy
4. Drag the WebView script from Asset Browser to the Scene Object
5. Configure in Inspector:
   - **URL**: starting URL (or set at runtime)
   - **Resolution**: e.g. `600x800` (max `2048x2048`, cannot change after init)
   - **Include Poke**: enable for direct finger targeting (in addition to ray targeting)

---

## Scale Setup

WebView renders to a texture then displays via RenderMeshVisual. Scale must match resolution aspect ratio:

```
Resolution: 600 × 800  →  ratio = 0.75
Transform Scale XY: 60 × 80  (60cm × 80cm in AR space)
```

---

## Script API

```typescript
// The WebView component exposes these key methods:
webView.setUrl('https://example.com')     // navigate to URL
webView.reload()                           // reload current page
webView.goBack()                           // browser back
webView.goForward()                        // browser forward
webView.setUserAgent('custom-agent/1.0')  // set user-agent

// Get current state
const url = webView.currentUrl
const isLoading = webView.isLoading
```

---

## Controlling WebView from Script

```typescript
@component
export class WebViewController extends BaseScriptComponent {
  @input
  @hint("The WebView script component")
  webView: SceneObject  // drag the WebView scene object here

  @input
  @hint("URL to load on start")
  initialUrl: string = "https://example.com"

  private webViewScript  // reference to WebView component

  onAwake(): void {
    this.createEvent('OnStartEvent').bind(() => this.init())
  }

  private init(): void {
    // Access the WebView component script
    this.webViewScript = this.webView.getComponent('Component.ScriptComponent')
    if (this.initialUrl) {
      this.navigate(this.initialUrl)
    }
  }

  public navigate(url: string): void {
    // WebView.setUrl is the main navigation method
    print("[WebView] Navigating to: " + url)
    // Set via the component directly if WebView script exposes it
  }
}
```

---

## Lifecycle Events

```typescript
// WebView can be suspended to free resources — handle resume:
webView.onSuspended.add(() => {
  print("[WebView] Suspended — showing snapshot")
})

webView.onResumed.add(() => {
  print("[WebView] Resumed — page will reload")
})
```

> A suspended WebView shows the last rendered snapshot. User interaction forces a resume + reload.

---

## Interaction Modes

| Mode | How it works |
|------|-------------|
| **Indirect (default)** | Hand targeting ray + cursor (from SIK) |
| **Direct (poke)** | Finger touch directly on the WebView surface (enable `Include Poke`) |

Both modes can be active simultaneously when `Include Poke` is enabled.

---

## Use Cases

- Help docs / "What's New" pages
- Embedded YouTube videos
- Web apps that communicate with the Lens via URL params
- Contact / feedback forms
- HTML-based UI panels

---

## Limitations

- No camera/microphone in web content
- Only `https://` — no local HTML
- Multiple WebViews possible, but platform may suspend some
- Not available in Lens Studio Preview — device only
- Not available on Snapchat mobile
