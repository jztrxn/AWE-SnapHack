/**
 * Specs Inc. 2026
 * Main scene controller for game controller demo. Manages surface placement, character control via
 * game controller input, and coordinates between animation system, character controller, and camera.
 */

import { PlacementMode, PlacementSettings } from "SurfacePlacement.lspkg/Scripts/PlacementSettings";
import { GameController } from "GameController.lspkg/GameController";
import { ButtonStateKey } from "GameController.lspkg/Scripts/ButtonState";
import { CharacterController } from "SpecsCharacterController.lspkg/Character Controller/Character Controller";
import { SurfacePlacementController } from "SurfacePlacement.lspkg/Scripts/SurfacePlacementController";
import { AnimationController } from "./AnimationController";
import { bindStartEvent, bindUpdateEvent } from "SnapDecorators.lspkg/decorators";
import { assert } from "SnapDecorators.lspkg/assert";

@component
export class SceneController extends BaseScriptComponent {
  @ui.separator
  @ui.label('<span style="color: #60A5FA;">Scene Objects</span>')
  @ui.label('<span style="color: #94A3B8; font-size: 11px;">Configure scene objects and controllers</span>')

  @input
  @allowUndefined
  @hint("Visual object to show after placement")
  objectVisuals: SceneObject;

  @input
  @hint("Character controller component")
  characterController: CharacterController;

  @input
  @hint("Animation controller component")
  animationController: AnimationController;

  @input
  @hint("Camera object for orientation calculations")
  cameraObj: SceneObject;

  @ui.separator
  @ui.label('<span style="color: #60A5FA;">Placement Settings</span>')
  @ui.label('<span style="color: #94A3B8; font-size: 11px;">Configure surface placement mode</span>')

  @input("int")
  @widget(new ComboBoxWidget([new ComboBoxItem("Near Surface", 0), new ComboBoxItem("Horizontal", 1)]))
  @hint("Surface placement mode: Near Surface or Horizontal")
  placementSettingMode: number = 0;

  @ui.separator
  @ui.label('<span style="color: #60A5FA;">Logging Configuration</span>')
  @ui.label('<span style="color: #94A3B8; font-size: 11px;">Control logging output for this script instance</span>')

  @input
  @hint("Enable general logging (animation cycles, events, etc.)")
  enableLogging: boolean = false;

  @input
  @hint("Enable lifecycle logging (onAwake, onStart, onUpdate, onDestroy, etc.)")
  enableLoggingLifecycle: boolean = false;

  private transform: Transform = null;
  private camTrans: Transform = null;

  private surfacePlacement: SurfacePlacementController;
  private gameController: GameController;

  /**
   * Called when component wakes up - initialize transforms and validate inputs
   */
  onAwake(): void {
    if (this.enableLoggingLifecycle) {
      print("SceneController: LIFECYCLE: onAwake() - Component waking up");
    }

    assert(this.characterController !== null, "Character controller must be assigned");
    assert(this.animationController !== null, "Animation controller must be assigned");
    assert(this.cameraObj !== null, "Camera object must be assigned");

    this.camTrans = this.cameraObj.getTransform();
    this.transform = this.getSceneObject().getTransform();
    this.objectVisuals.enabled = false;

    // Editor test: Tap to trigger jump animation
    this.createEvent("TapEvent").bind(() => {
      this.handleJumpButton(true);
    });

    if (this.enableLogging) {
      print("SceneController: Scene controller initialized");
    }
  }

  /**
   * Called on the first frame when the scene starts
   * Automatically bound to OnStartEvent via SnapDecorators
   */
  @bindStartEvent
  initialize(): void {
    if (this.enableLoggingLifecycle) {
      print("SceneController: LIFECYCLE: initialize() - Scene started");
    }

    // Initialize singleton instances after component is fully awake
    this.surfacePlacement = SurfacePlacementController.getInstance();
    this.gameController = GameController.getInstance();

    this.startPlacement();
    this.gameController.scanForControllers();

    // Register button presses
    this.gameController.onButtonStateChanged(ButtonStateKey.a, this.handleJumpButton.bind(this));
    this.gameController.onButtonStateChanged(ButtonStateKey.x, this.handlePunchButton.bind(this));
    this.gameController.onButtonStateChanged(ButtonStateKey.b, this.handleKickButton.bind(this));
    this.gameController.onButtonStateChanged(ButtonStateKey.y, this.handleRumbleButton.bind(this));

    if (this.enableLogging) {
      print("SceneController: Game controller button handlers registered");
    }
  }

  /**
   * Called every frame
   * Automatically bound to UpdateEvent via SnapDecorators
   */
  @bindUpdateEvent
  updateMovement(): void {
    if (this.enableLoggingLifecycle) {
      print("SceneController: LIFECYCLE: updateMovement() - Update event");
    }

    const buttonState = this.gameController.getButtonState();
    if (!buttonState) {
      return;
    }

    // Calculate move speed from joystick magnitude (0 - 1)
    let moveSpeed = new vec2(Math.abs(buttonState.lx), Math.abs(buttonState.ly)).distance(vec2.zero());

    const joystickMoveDirection = new vec3(buttonState.lx, 0, buttonState.ly).normalize();

    // Convert joystick input into world space relative to camera's facing direction
    let moveDir = this.camTrans.getWorldTransform().multiplyDirection(joystickMoveDirection).normalize();

    // Apply dead zone
    if (moveSpeed < 0.15) {
      moveSpeed = 0;
      moveDir = vec3.zero();
    }

    this.characterController.move(moveDir);
    this.characterController.setTargetSpeedModifier(moveSpeed);
  }

  /**
   * Starts surface placement for character positioning
   */
  public startPlacement(): void {
    this.objectVisuals.enabled = false;
    let placementSettings = new PlacementSettings(PlacementMode.HORIZONTAL);

    if (this.placementSettingMode === 0) {
      placementSettings = new PlacementSettings(
        PlacementMode.NEAR_SURFACE,
        true, // Use surface adjustment widget
        vec3.zero(), // Offset in cm of widget from surface center
        this.onSliderUpdated.bind(this) // Callback from widget height changes
      );
    }

    this.surfacePlacement.startSurfacePlacement(placementSettings, (pos, rot) => {
      this.onSurfaceDetected(pos, rot);
    });

    if (this.enableLogging) {
      print("SceneController: Surface placement started");
    }
  }

  /**
   * Public API: Reset surface placement
   */
  public resetPlacement(): void {
    this.surfacePlacement.stopSurfacePlacement();
    this.startPlacement();

    if (this.enableLogging) {
      print("SceneController: Surface placement reset");
    }
  }

  /**
   * Handles rumble button press
   * @param pressed - True if button is pressed, false if released
   */
  private handleRumbleButton(pressed: boolean): void {
    if (pressed) {
      this.gameController.sendRumble(20, 10);

      if (this.enableLogging) {
        print("SceneController: Rumble triggered");
      }
    }
  }

  /**
   * Handles jump button press
   * @param pressed - True if button is pressed, false if released
   */
  private handleJumpButton(pressed: boolean): void {
    if (pressed) {
      this.animationController.playJumpAnimation();

      if (this.enableLogging) {
        print("SceneController: Jump animation triggered");
      }
    }
  }

  /**
   * Handles punch button press
   * @param pressed - True if button is pressed, false if released
   */
  private handlePunchButton(pressed: boolean): void {
    if (pressed) {
      this.animationController.playPunchAnimation();

      if (this.enableLogging) {
        print("SceneController: Punch animation triggered");
      }
    }
  }

  /**
   * Handles kick button press
   * @param pressed - True if button is pressed, false if released
   */
  private handleKickButton(pressed: boolean): void {
    if (pressed) {
      this.animationController.playKickAnimation();

      if (this.enableLogging) {
        print("SceneController: Kick animation triggered");
      }
    }
  }

  /**
   * Callback when surface placement slider is updated
   * @param pos - New position from slider
   */
  private onSliderUpdated(pos: vec3): void {
    this.transform.setWorldPosition(pos);
  }

  /**
   * Callback when surface is detected and placement is complete
   * @param pos - World position of detected surface
   * @param rot - World rotation of detected surface
   */
  private onSurfaceDetected(pos: vec3, rot: quat): void {
    this.objectVisuals.enabled = true;
    this.transform.setWorldPosition(pos);
    this.transform.setWorldRotation(rot);
    this.characterController.setPosition(pos);
    this.characterController.setInputType(global.deviceInfoSystem.isEditor() ? 1 : 0);

    if (this.enableLogging) {
      print("SceneController: Surface detected and character placed at position: " + pos.toString());
    }
  }
}
