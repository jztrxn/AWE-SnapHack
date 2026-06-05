---
name: snap-cloud
description: Connect Spectacles Lenses to a cloud backend using Snap Cloud (powered by Supabase) — database tables, realtime channels, file storage, and edge functions. Load when implementing persistent data, multiplayer state sync, remote assets, or serverless logic.
user-invocable: false
paths: "**/*.ts"
---

# Snap Cloud — Backend for Spectacles

**Status:** Alpha — [Apply for access](https://snap-ar.com/SnapCloudApplication)

**Requirements:** Lens Studio v5.7+. Install **SupabaseClient** and **Supabase Plugin** from the Asset Library.

> Reference: `SnapCloudExamples/` package — 6 working examples (Auth, Tables, Realtime, Storage, Media, Leaderboard)

---

## Setup

### 1. Install packages
From Asset Library: **SupabaseClient** (client library) + **Supabase Plugin** (project management).

### 2. Create a Supabase Project
`Window → Supabase` → Login → Create/select project → **Import Credentials** → creates a `SupabaseProject` asset.

### 3. Connect to your script

```typescript
import { createClient, SupabaseClient } from 'SupabaseClient.lspkg/supabase-snapcloud'

@component
export class MyComponent extends BaseScriptComponent {
  @input
  supabaseProject: SupabaseProject  // drag SupabaseProject asset here

  private client: SupabaseClient

  onAwake(): void {
    this.createEvent('OnStartEvent').bind(() => this.init())
    this.createEvent('OnDestroyEvent').bind(() => this.client?.removeAllChannels())
  }

  private async init(): Promise<void> {
    this.client = createClient(
      this.supabaseProject.url,
      this.supabaseProject.publicToken,
      {
        realtime: {
          heartbeatIntervalMs: 2500  // required workaround for alpha
        }
      }
    )
    await this.signIn()
  }

  private async signIn(): Promise<void> {
    const { data, error } = await this.client.auth.signInWithIdToken({
      provider: 'snapchat',
      token: ''  // empty — Snapchat handles auth automatically
    })
    if (error) {
      print('[SnapCloud] Sign in error: ' + JSON.stringify(error))
      return
    }
    const userId = data.user.id
    print('[SnapCloud] Signed in: ' + userId)
  }
}
```

### Centralized Requirements (recommended pattern)

Use `SnapCloudRequirements` (from the example package) as a shared config component:

```typescript
import { SnapCloudRequirements } from './SnapCloudExamples.lspkg/SnapCloudRequirements'

@input snapCloudRequirements: SnapCloudRequirements

// In init():
if (!this.snapCloudRequirements.isConfigured()) return
const project = this.snapCloudRequirements.getSupabaseProject()
this.client = createClient(project.url, project.publicToken, options)
```

`SnapCloudRequirements` exposes convenience methods:
- `getSupabaseProject(): SupabaseProject`
- `getRestApiUrl(): string` — `projectUrl/rest/v1/`
- `getStorageApiUrl(): string` — `projectUrl/storage/v1/object/public/`
- `getFunctionsApiUrl(): string` — `projectUrl/functions/v1/`
- `getSupabaseHeaders(): { [key: string]: string }`

---

## Database (Tables)

Standard Supabase JS query builder — all operations require sign-in first.

```typescript
// SELECT
const { data, error } = await this.client
  .from('my_table')
  .select('*')
  .limit(10)

// SELECT with filter
const { data } = await this.client
  .from('my_table')
  .select('id, message, timestamp')
  .eq('user_id', userId)
  .order('timestamp', { ascending: false })
  .limit(5)

// INSERT
const { data, error } = await this.client
  .from('my_table')
  .insert({
    message: 'Hello from Spectacles!',
    user_id: userId,
    timestamp: new Date().toISOString()
  })
  .select()  // returns the inserted row

// UPDATE
const { data, error } = await this.client
  .from('my_table')
  .update({ message: 'Updated' })
  .eq('id', rowId)
  .select()

// DELETE
const { error } = await this.client
  .from('my_table')
  .delete()
  .eq('id', rowId)
```

> **Row Level Security (RLS):** Tables have RLS enabled by default. Add policies in the Snap Cloud Dashboard so users can only read/write their own rows.

---

## Realtime

Low-latency broadcast channels — works like a WebSocket room.

```typescript
import { RealtimeChannel, SupabaseClient } from 'SupabaseClient.lspkg/supabase-snapcloud'

private channel: RealtimeChannel

private setupRealtime(): void {
  this.channel = this.client.channel('my-channel', {
    config: {
      broadcast: { self: false }  // don't receive own messages
    }
  })

  // Subscribe to events
  this.channel
    .on('broadcast', { event: 'position-update' }, (msg) => {
      const { x, y, userId } = msg.payload
      print('[RT] Position from ' + userId + ': ' + x + ', ' + y)
      this.handleRemoteUpdate(x, y)
    })
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        print('[RT] Connected to channel')
      } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
        print('[RT] Channel closed: ' + status)
      }
    })
}

// Send a broadcast message
public sendPosition(x: number, y: number): void {
  if (!this.channel) return
  this.channel.send({
    type: 'broadcast',
    event: 'position-update',
    payload: { x, y, userId: this.userId, timestamp: Date.now() }
  })
}

// Cleanup
public cleanup(): void {
  this.client?.removeAllChannels()
}
```

> **Use case**: Realtime is ideal for cursor sync, multiplayer object positions, live notifications. For persistent state, combine with Database writes.

---

## Storage

Download files (images, 3D models, audio) from Supabase Storage buckets.

```typescript
private internetModule: InternetModule = require('LensStudio:InternetModule')

// Build the public URL for a file
private getStorageUrl(bucket: string, path: string): string {
  const base = this.supabaseProject.url.replace(/\/$/, '')
  return `${base}/storage/v1/object/public/${bucket}/${path}`
}

// Download and apply an image texture
public async loadImage(bucket: string, imagePath: string, visual: MeshVisual): Promise<void> {
  const url = this.getStorageUrl(bucket, imagePath)
  const resource = this.internetModule.makeResourceFromUrl(url)
  const remoteMedia = RemoteMediaModule.loadResourceAsImageTexture(resource)
  remoteMedia.onReady.add((texture: Texture) => {
    visual.mainMaterial.mainPass.baseTex = texture
    print('[Storage] Image loaded: ' + imagePath)
  })
}

// Download a glTF 3D model
public async loadModel(bucket: string, modelPath: string, parent: SceneObject): Promise<void> {
  const url = this.getStorageUrl(bucket, modelPath)
  const resource = this.internetModule.makeResourceFromUrl(url)
  const gltf = RemoteMediaModule.loadResourceAsGltfAsset(resource)
  gltf.onReady.add((asset: GltfAsset) => {
    const obj = asset.tryInstantiate(parent, null)
    print('[Storage] Model loaded: ' + modelPath)
  })
}
```

**Bucket setup** (Snap Cloud Dashboard):
1. Storage → New Bucket → make it Public
2. Policies → `Give authenticated users access` (SELECT/INSERT/UPDATE/DELETE)
3. Organize files by type: `images/`, `models/`, `audio/`

---

## Edge Functions

Serverless TypeScript functions deployed at the edge (Deno runtime).

**Dashboard:** Edge Functions → Deploy a new function → Via Editor

```typescript
// Edge function code (runs on Snap Cloud, not in Lens):
import 'jsr:@supabase/functions-js/edge-runtime.d.ts'

Deno.serve(async (req) => {
  const { num1, num2 } = await req.json()
  return new Response(JSON.stringify({ sum: num1 + num2 }), {
    headers: { 'Content-Type': 'application/json' }
  })
})
```

**Calling from Spectacles:**

```typescript
// Invoke via Supabase client
const { data, error } = await this.client.functions.invoke('sum', {
  body: { num1: 3, num2: 7 }
})
if (!error) {
  print('[Edge] Sum: ' + data.sum)  // 10
}

// Or via InternetModule.fetch directly
const { data: session } = await this.client.auth.getSession()
const token = session?.session?.access_token ?? this.supabaseProject.publicToken

const response = await this.internetModule.fetch(
  this.snapCloudRequirements.getFunctionsApiUrl() + 'my-function',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
      'apikey': this.supabaseProject.publicToken
    },
    body: JSON.stringify({ input: 'data' })
  }
)
const result = await response.json()
```

---

## Examples in the Package

| Example | What it shows |
|---------|---------------|
| `Example1-AuthAndTables` | Auth + full CRUD (select, insert, update, delete) |
| `Example2-RealTime` | Bidirectional realtime cursor sync between Spectacles and web |
| `Example3-Storage` | Load 3D models, images, audio from a storage bucket |
| `Example4-EdgeFunctions` | Call an edge function for server-side image processing |
| `Example5-Media` | Capture and upload photos/video/audio from Spectacles camera |
| `Example6-GlobalLeaderboard` | Supabase-powered global score leaderboard |

---

## Key Patterns

```typescript
// Always sign in before any database/storage/function call
// Error shape: { message: string, code?: string, details?: string }
// Destroy: client.removeAllChannels() cleans up all realtime subscriptions
// Alpha workaround: always include heartbeatIntervalMs: 2500 in options

const options = {
  realtime: { heartbeatIntervalMs: 2500 }
}
```

---

## Limitations

- **Alpha** — apply for access, APIs may change
- Authentication requires a logged-in Snapchat account paired to device
- Camera/microphone NOT available to edge functions
- `heartbeatIntervalMs: 2500` required in options (known alpha limitation)
- Not available on Snapchat mobile — Spectacles device only
