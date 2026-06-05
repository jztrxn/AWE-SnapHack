---
name: api-internet
description: Make HTTP/HTTPS requests, download remote media (images, video, audio, glTF), and check internet availability in Spectacles using the InternetModule and Fetch API. Load when implementing network requests, REST API calls, or remote asset loading.
user-invocable: false
---

# Internet Access — Fetch, HTTP, Remote Media

**Requirements:** Lens Studio v5.3+. Add `InternetModule` to project assets.

> **Privacy:** Internet access disables camera frame / location / audio. Use Extended Permissions for combined access.
> Preview only works with **Device Type Override = Spectacles**.

Reference: `Fetch/`, `Snap Cloud World Kindness Day/`

---

## Fetch API (recommended)

### GET request

```typescript
@component
export class FetchExample extends BaseScriptComponent {
  @input internetModule: InternetModule

  async onAwake(): Promise<void> {
    this.createEvent('OnStartEvent').bind(() => this.fetchData())
  }

  private async fetchData(): Promise<void> {
    try {
      const request = new Request('https://api.example.com/data', {
        method: 'GET',
      })
      const response = await this.internetModule.fetch(request)

      if (response.status !== 200) {
        print('[Fetch] Error: ' + response.status)
        return
      }
      const text = await response.text()
      print('[Fetch] Response: ' + text)
    } catch (err) {
      print('[Fetch] Failed: ' + err)
    }
  }
}
```

### POST with JSON

```typescript
private async postJson(url: string, body: object): Promise<any> {
  const request = new Request(url, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {'Content-Type': 'application/json'},
  })

  const response = await this.internetModule.fetch(request)
  if (response.status !== 200) throw new Error('HTTP ' + response.status)

  const contentType = response.headers.get('Content-Type')
  if (!contentType?.includes('application/json')) throw new Error('Not JSON')

  const json = await response.json()
  return json
}
```

### Supported body readers

| Method | Returns |
|--------|---------|
| `response.text()` | string |
| `response.json()` | parsed object |
| `response.bytes()` | Uint8Array |

> `blob()`, `arrayBuffer()`, `body` are **not supported**.

---

## PerformHttpRequest (simpler, legacy)

```typescript
private performGet(url: string): void {
  const req = RemoteServiceHttpRequest.create()
  req.url = url
  req.method = RemoteServiceHttpRequest.HttpRequestMethod.Get

  this.internetModule.performHttpRequest(req, (response) => {
    if (response.statusCode === 200) {
      print('[HTTP] Body: ' + response.body)
    }
  })
}

private performPost(url: string, body: string, token: string): void {
  const req = RemoteServiceHttpRequest.create()
  req.url = url
  req.method = RemoteServiceHttpRequest.HttpRequestMethod.Post
  req.setHeader('Content-Type', 'application/json')
  req.setHeader('Authorization', 'Bearer ' + token)
  req.body = body

  this.internetModule.performHttpRequest(req, (response) => {
    print('[HTTP] Status: ' + response.statusCode)
    print('[HTTP] Content-Type: ' + response.contentType)
    print('[HTTP] Body: ' + response.body)
  })
}
```

---

## Download Remote Media

```typescript
private internetModule: InternetModule = require('LensStudio:InternetModule')
private remoteMediaModule: RemoteMediaModule = require('LensStudio:RemoteMediaModule')

// --- Image ---
private async loadRemoteImage(url: string): Promise<Texture> {
  const resource = this.internetModule.makeResourceFromUrl(url)
  return new Promise((resolve, reject) => {
    this.remoteMediaModule.loadResourceAsImageTexture(
      resource,
      (texture) => resolve(texture),
      (err) => reject(err)
    )
  })
}

// --- Audio ---
private loadRemoteAudio(url: string): void {
  const resource = this.internetModule.makeResourceFromUrl(url)
  this.remoteMediaModule.loadResourceAsAudioTrackAsset(
    resource,
    (audioTrack) => {
      // Use audioTrack with AudioComponent
    },
    (err) => print('[Media] Audio error: ' + err)
  )
}

// --- glTF model ---
private loadRemoteGltf(url: string): void {
  const resource = this.internetModule.makeResourceFromUrl(url)
  this.remoteMediaModule.loadResourceAsGltfAsset(
    resource,
    (gltfAsset) => {
      const settings = GltfSettings.create()
      settings.convertMetersToCentimeters = true
      gltfAsset.tryInstantiateAsync(
        this.sceneObject, this.material,
        (sceneObj) => print('[GLTF] Loaded: ' + sceneObj.name),
        (err) => print('[GLTF] Error: ' + err),
        (progress) => print('[GLTF] Progress: ' + progress),
        settings
      )
    },
    (err) => print('[GLTF] Load error: ' + err)
  )
}
```

| Media type | Method | Returns |
|------------|--------|---------|
| Image | `loadResourceAsImageTexture` | `Asset.Texture` |
| Video | `loadResourceAsVideoTexture` | `Asset.Texture` |
| glTF | `loadResourceAsGltfAsset` | `Asset.GltfAsset` |
| Audio | `loadResourceAsAudioTrackAsset` | `Asset.AudioTrackAsset` |

---

## Internet Availability Check

```typescript
onAwake(): void {
  // Check current status
  const isOnline = global.deviceInfoSystem.isInternetAvailable()
  print('[Net] Online: ' + isOnline)

  // React to changes
  global.deviceInfoSystem.onInternetStatusChanged.add((args) => {
    if (args.isInternetAvailable) {
      print('[Net] Internet restored')
    } else {
      print('[Net] Internet lost')
    }
  })
}
```

---

## InternetModule Setup in Inspector

Add `InternetModule` asset to your project, then expose it:

```typescript
@input internetModule: InternetModule
// OR require directly (no inspector needed):
private internetModule: InternetModule = require('LensStudio:InternetModule')
private remoteMediaModule: RemoteMediaModule = require('LensStudio:RemoteMediaModule')
```
