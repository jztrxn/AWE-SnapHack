---
name: sik-interaction
description: Use SpectaclesInteractionKit (SIK) for hand tracking, pinch gestures, interactable objects, UI buttons, and world camera access in Spectacles. Load when implementing any hand/gesture/UI interaction.
user-invocable: false
---

# SpectaclesInteractionKit (SIK) Interaction Guide

Reference implementation: `Essentials/`, `AI Playground/`, `Sync Kit Laser Pointer/`

## Core Imports

```typescript
// Interactables
import {Interactable} from "SpectaclesInteractionKit.lspkg/Components/Interaction/Interactable/Interactable"
import {InteractableManipulation} from "SpectaclesInteractionKit.lspkg/Components/Interaction/InteractableManipulation/InteractableManipulation"

// Interactor (pointer/ray from hand)
import {Interactor, InteractorTriggerType} from "SpectaclesInteractionKit.lspkg/Core/Interactor/Interactor"

// Hand data provider
import {HandInputData} from "SpectaclesInteractionKit.lspkg/Providers/HandInputData/HandInputData"

// World camera
import WorldCameraFinderProvider from "SpectaclesInteractionKit.lspkg/Providers/CameraProvider/WorldCameraFinderProvider"

// Buttons
import {PinchButton} from "SpectaclesInteractionKit.lspkg/Components/UI/PinchButton/PinchButton"

// Animation
import animate from "SpectaclesInteractionKit.lspkg/Utils/animate"
import MathUtils from "SpectaclesInteractionKit.lspkg/Utils/MathUtils"

// Events
import Event from "SpectaclesInteractionKit.lspkg/Utils/Event"
```

## Hand Tracking

```typescript
private handProvider: HandInputData = HandInputData.getInstance()
private leftHand = this.handProvider.getHand("left")
private rightHand = this.handProvider.getHand("right")

// Access hand position
const wristPos: vec3 = this.leftHand.wrist.position

// Check if hand is tracked
if (this.leftHand.isTracked()) {
  // hand is visible
}

// World camera transform
private camera = WorldCameraFinderProvider.getInstance()
const camTransform = this.camera.getComponent("Component.Camera").getTransform()
```

## Interactable Objects

Attach to any scene object to make it pinch/grab-able:

```typescript
onAwake(): void {
  const interactable = this.getSceneObject()
    .getComponent(Interactable.getTypeName()) as Interactable

  // Pinch trigger events
  interactable.onTriggerStart.add((event) => {
    this.logger.info("Pinch started")
  })
  interactable.onTriggerEnd.add((event) => {
    this.logger.info("Pinch ended")
  })
  interactable.onHoverEnter.add((event) => {
    this.logger.info("Hover started")
  })
  interactable.onHoverExit.add((event) => {
    this.logger.info("Hover ended")
  })
}
```

## InteractableManipulation (grab & move)

```typescript
const manipulate = this.orbObject
  .getComponent(InteractableManipulation.getTypeName()) as InteractableManipulation

// Enable/disable manipulation
manipulate.enabled = true

// Events
manipulate.onManipulationStart.add(() => {
  this.logger.info("User grabbed object")
})
manipulate.onManipulationEnd.add(() => {
  this.logger.info("User released object")
})
```

## PinchButton

```typescript
@input
@hint("The PinchButton component on the button object")
private myButton: PinchButton

onAwake(): void {
  this.myButton.onButtonPinched.add(() => {
    this.logger.info("Button pinched!")
    this.doSomething()
  })
}
```

## UIKit BaseButton

```typescript
import {BaseButton} from "SpectaclesUIKit.lspkg/Scripts/Components/Button/BaseButton"

@input
private actionButton: BaseButton

onAwake(): void {
  this.actionButton.onInitialized.add(() => {
    this.actionButton.onTriggerUp.add(() => {
      this.handleButtonPress()
    })
  })
}
```

## Animate Utility (smooth transitions)

```typescript
// Smooth scale animation
animate({
  duration: 0.3,
  easing: "ease-out-quad",
  update: (t: number) => {
    const tr = this.myObject.getTransform()
    tr.setLocalScale(new vec3(
      MathUtils.lerp(startScale.x, endScale.x, t),
      MathUtils.lerp(startScale.y, endScale.y, t),
      MathUtils.lerp(startScale.z, endScale.z, t)
    ))
  },
  ended: () => {
    this.logger.info("Animation complete")
  }
})
```

Available easings: `"linear"`, `"ease-in-quad"`, `"ease-out-quad"`, `"ease-in-out-quad"`, `"ease-out-back"`, `"ease-in-back"`, `"ease-in-out-back"`

## Event Pattern

```typescript
// Declare a typed event on a component
public onActionComplete: Event<{result: string}> = new Event<{result: string}>()

// Invoke
this.onActionComplete.invoke({result: "success"})

// Subscribe from another component
this.otherComp.onActionComplete.add((data) => {
  this.logger.info("Action result: " + data.result)
})
```

## Interactor Trigger State

```typescript
import {InteractorTriggerType} from "SpectaclesInteractionKit.lspkg/Core/Interactor/Interactor"

// Check trigger state
if (this.interactor.currentTrigger === InteractorTriggerType.None) {
  // not pinching
} else if (this.interactor.currentTrigger === InteractorTriggerType.Select) {
  // pinching
}
```

## Common Patterns in This Repo

- **SphereController** (`AI Playground/Assets/Scripts/SphereController.ts`) — complex SIK integration with hand menus
- **PointerCreation** (`Sync Kit Laser Pointer/Assets/Scripts/PointerCreation.ts`) — interactor-based pointer spawning
- **Essentials** (`Essentials/Assets/Scripts/`) — 20+ minimal examples: gestures, buttons, raycasting, solvers
