---
name: sync-kit
description: Build multiplayer/shared experiences using SpectaclesSyncKit — shared state, networked object instantiation, ownership, and real-time synchronization between Spectacles devices. Load when implementing multiplayer, shared AR, or networked object features.
user-invocable: false
---

# SpectaclesSyncKit — Multiplayer Guide

Reference implementations: `Sync Kit Basic Example/`, `Sync Kit Air Hockey/`, `Sync Kit Laser Pointer/`, `Sync Kit High Five/`, `Sync Kit Tic Tac Toe/`

Package path: `SpectaclesSyncKit.lspkg/`

---

## Core Concepts

| Concept | Description |
|---------|-------------|
| `SyncEntity` | Marks a SceneObject as network-aware; gives access to `networkRoot` |
| `StorageProperty` | A single synced value (string, number, vec3, bool, etc.) |
| `Instantiator` | Creates networked objects for all connected users |
| `networkRoot.doIOwnStore()` | True only on the device that owns this entity |
| `SessionController` | Global session management (join/leave, local player info) |

---

## SyncEntity — Basic Networked Object

```typescript
import {SyncEntity} from "SpectaclesSyncKit.lspkg/Core/SyncEntity"
import {StorageProperty} from "SpectaclesSyncKit.lspkg/Core/StorageProperty"
import {StoragePropertySet} from "SpectaclesSyncKit.lspkg/Core/StoragePropertySet"

@component
export class MyNetworkedComponent extends BaseScriptComponent {
  private syncEntity: SyncEntity
  private positionProp: StorageProperty<vec3>

  onAwake(): void {
    this.syncEntity = new SyncEntity(this)

    // Declare a synced property with a default value
    this.positionProp = StorageProperty.manualVec3("position", vec3.zero())

    // Add to the sync entity
    this.syncEntity.addStorageProperty(this.positionProp)

    // Listen for remote changes
    this.positionProp.onRemoteChange.add((newValue: vec3) => {
      this.getSceneObject().getTransform().setWorldPosition(newValue)
    })
  }

  // Only the owner should call this
  public updatePosition(pos: vec3): void {
    if (!this.syncEntity.networkRoot.doIOwnStore()) return
    this.positionProp.setPendingValue(pos)
  }
}
```

---

## StorageProperty Types

```typescript
// Primitives
StorageProperty.manualBool("isActive", false)
StorageProperty.manualNumber("score", 0)
StorageProperty.manualString("playerName", "")

// Vectors / Transforms
StorageProperty.manualVec3("position", vec3.zero())
StorageProperty.manualQuat("rotation", quat.quatIdentity())

// Auto-synced transform (updates every frame for owner)
StorageProperty.autoOrWorldPosition("position", vec3.zero())
StorageProperty.autoOrWorldRotation("rotation", quat.quatIdentity())
```

---

## Instantiator — Spawn Objects for All Players

```typescript
import {Instantiator} from "SpectaclesSyncKit.lspkg/Components/Instantiator"
import {NetworkRootInfo} from "SpectaclesSyncKit.lspkg/Core/NetworkRootInfo"

@component
export class ObjectSpawner extends BaseScriptComponent {
  @input
  @hint("The Instantiator component in the scene")
  private instantiator: Instantiator

  @input
  @hint("Prefab to spawn for all users")
  private objectPrefab: ObjectPrefab

  public spawnObject(): void {
    this.instantiator.instantiate(
      this.objectPrefab,
      {},  // optional initial data
      (networkRootInfo: NetworkRootInfo) => {
        const spawnedObj = networkRootInfo.instantiatedObject
        const myComp = spawnedObj.getComponent(MyNetworkedComponent.getTypeName())
        // Configure the spawned object
      }
    )
  }

  public despawnAll(): void {
    this.instantiator.destroyAll()
  }
}
```

---

## Ownership Check Pattern

```typescript
onAwake(): void {
  this.syncEntity = new SyncEntity(this)

  // Owner-only update loop
  if (this.syncEntity.networkRoot.doIOwnStore()) {
    this.createEvent("UpdateEvent").bind(() => {
      this.syncPositionToNetwork()
    })
  }

  // All devices listen for remote changes
  this.positionProp.onRemoteChange.add((newValue) => {
    this.applyRemotePosition(newValue)
  })
}
```

---

## Session Controller — Player Info

```typescript
import {SessionController} from "SpectaclesSyncKit.lspkg/Core/SessionController"

const session = SessionController.getInstance()

// Get local user's connection ID
const myId = session.getLocalConnectionId()

// Listen for new users joining
session.onUserJoinedSession.add((userInfo) => {
  this.logger.info("User joined: " + userInfo.connectionId)
})

// Listen for users leaving
session.onUserLeftSession.add((userInfo) => {
  this.logger.info("User left: " + userInfo.connectionId)
})

// Get all connected users
const users = session.getUsers()
```

---

## Sync Kit Patterns in This Repo

### Pointer (Sync Kit Laser Pointer)
```typescript
// Owner: update pointer position every frame
if (this.syncEntity.networkRoot.doIOwnStore()) {
  this.createEvent("UpdateEvent").bind(() => {
    const tipPos = this.interactor.endPoint
    this.positionProp.setPendingValue(tipPos)
  })
}
```

### Game State (Tic Tac Toe, Air Hockey)
```typescript
// Store game board as a string property
private boardProp = StorageProperty.manualString("board", "")

// Detect whose turn it is
private turnProp = StorageProperty.manualString("currentTurn", "")
```

### Gesture Events (High Five)
```typescript
// Broadcast an event to all users via a boolean toggle
private highFiveProp = StorageProperty.manualBool("highFive", false)

public triggerHighFive(): void {
  if (!this.syncEntity.networkRoot.doIOwnStore()) return
  this.highFiveProp.setPendingValue(!this.highFiveProp.currentValue)
}
```

---

## Common Mistakes

- **Do NOT call `setPendingValue` from non-owners** — always check `doIOwnStore()` first
- **Do NOT read `currentValue` before sync entity is initialized** — wait for `onReady`
- **Auto properties update every frame** — only use `autoOr*` for transforms that change constantly
- **Instantiator must be placed in the scene** — it's a scene component, not created in code
