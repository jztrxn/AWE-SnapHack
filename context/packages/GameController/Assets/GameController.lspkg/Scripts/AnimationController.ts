/**
 * Specs Inc. 2026
 * Animation controller for character animations. Manages animation clips for idle, walking, running,
 * jumping, kicking, and punching with smooth blending between states based on character movement speed.
 */

import { CharacterController } from "SpecsCharacterController.lspkg/Character Controller/Character Controller";
import { bindStartEvent, bindUpdateEvent } from "SnapDecorators.lspkg/decorators";
import { assert } from "SnapDecorators.lspkg/assert";

@component
export class AnimationController extends BaseScriptComponent {
  @ui.separator
  @ui.label('<span style="color: #60A5FA;">Animation Assets</span>')
  @ui.label('<span style="color: #94A3B8; font-size: 11px;">Assign animation assets for character actions</span>')

  @input
  @hint("Kick animation asset")
  kick: AnimationAsset;

  @input
  @hint("Punch animation asset")
  punch: AnimationAsset;

  @input
  @hint("Jump animation asset")
  jump: AnimationAsset;

  @input
  @hint("Walk animation asset")
  walk: AnimationAsset;

  @input
  @hint("Run animation asset")
  run: AnimationAsset;

  @input
  @hint("Idle animation asset")
  idle: AnimationAsset;

  @ui.separator
  @ui.label('<span style="color: #60A5FA;">Character Controller</span>')
  @ui.label('<span style="color: #94A3B8; font-size: 11px;">Reference to the character controller component</span>')

  @input
  @hint("Character controller to sync animations with movement")
  characterController: CharacterController;

  @ui.separator
  @ui.label('<span style="color: #60A5FA;">Logging Configuration</span>')
  @ui.label('<span style="color: #94A3B8; font-size: 11px;">Control logging output for this script instance</span>')

  @input
  @hint("Enable general logging (animation cycles, events, etc.)")
  enableLogging: boolean = false;

  @input
  @hint("Enable lifecycle logging (onAwake, onStart, onUpdate, onDestroy, etc.)")
  enableLoggingLifecycle: boolean = false;

  private animationPlayer: AnimationPlayer;

  private idleClip: AnimationClip = null;
  private jumpClip: AnimationClip = null;
  private kickClip: AnimationClip = null;
  private punchClip: AnimationClip = null;
  private walkClip: AnimationClip = null;
  private runClip: AnimationClip = null;

  private clips: AnimationClip[] = [];

  private currClip: AnimationClip = null;

  /**
   * Called when component wakes up - validate inputs
   */
  onAwake(): void {
    if (this.enableLoggingLifecycle) {
      print("AnimationController: LIFECYCLE: onAwake() - Component waking up");
    }

    assert(this.kick !== null, "Kick animation must be assigned");
    assert(this.punch !== null, "Punch animation must be assigned");
    assert(this.jump !== null, "Jump animation must be assigned");
    assert(this.walk !== null, "Walk animation must be assigned");
    assert(this.run !== null, "Run animation must be assigned");
    assert(this.idle !== null, "Idle animation must be assigned");
    assert(this.characterController !== null, "Character controller must be assigned");
  }

  /**
   * Called on the first frame when the scene starts
   * Automatically bound to OnStartEvent via SnapDecorators
   */
  @bindStartEvent
  initialize(): void {
    if (this.enableLoggingLifecycle) {
      print("AnimationController: LIFECYCLE: initialize() - Scene started");
    }

    this.animationPlayer = this.getSceneObject().createComponent("AnimationPlayer");
    this.createAllAnimationClips();

    // Set idle clip as the default animation
    this.currClip = this.idleClip;

    if (this.enableLogging) {
      print("AnimationController: Animation system initialized with idle as default");
    }
  }

  /**
   * Called every frame
   * Automatically bound to UpdateEvent via SnapDecorators
   */
  @bindUpdateEvent
  updateAnimation(): void {
    if (this.enableLoggingLifecycle) {
      print("AnimationController: LIFECYCLE: updateAnimation() - Update event");
    }

    this.blendClips();

    // Return to idle after single clip is done
    if (this.currClip.playbackMode === PlaybackMode.Single) {
      // Block movement unless jumping
      if (this.currClip.name !== this.jumpClip.name) {
        this.characterController.stopMovement();
      }
      if (this.isClipAlmostDone(this.currClip)) {
        this.setNewClip(this.idleClip);
      }
      return;
    }

    const maxSpeed = this.characterController.getMoveSpeed();
    const currSpeed = this.characterController.getVelocity().length;

    // Check for idle
    if (currSpeed < 5) {
      this.setNewClip(this.idleClip);
    }
    // Check for walk
    if (currSpeed > 5 && currSpeed < maxSpeed / 2) {
      this.setNewClip(this.walkClip);
    }
    // Check for run
    if (currSpeed > maxSpeed / 2 && this.runClip.weight < 0.5) {
      this.setNewClip(this.runClip);
    }
  }

  /**
   * Public API: Play jump animation
   */
  public playJumpAnimation(): void {
    if (!this.animationPlayer) {
      if (this.enableLogging) {
        print("AnimationController: Animation player not initialized yet");
      }
      return;
    }
    this.playSingleAnimation(this.jumpClip);
  }

  /**
   * Public API: Play kick animation
   */
  public playKickAnimation(): void {
    if (!this.animationPlayer) {
      if (this.enableLogging) {
        print("AnimationController: Animation player not initialized yet");
      }
      return;
    }
    this.playSingleAnimation(this.kickClip);
  }

  /**
   * Public API: Play punch animation
   */
  public playPunchAnimation(): void {
    if (!this.animationPlayer) {
      if (this.enableLogging) {
        print("AnimationController: Animation player not initialized yet");
      }
      return;
    }
    this.playSingleAnimation(this.punchClip);
  }

  /**
   * Plays a one-shot animation clip
   * @param clip - The animation clip to play
   */
  private playSingleAnimation(clip: AnimationClip): void {
    if (this.enableLogging) {
      print("AnimationController: Playing animation: " + clip.name);
    }
    this.setNewClip(clip);
    this.animationPlayer.playClip(clip.name);
  }

  /**
   * Creates all animation clips (looping and one-shot)
   */
  private createAllAnimationClips(): void {
    // Looping animations
    this.idleClip = this.createLoopedClip("Idle", this.idle);
    this.walkClip = this.createLoopedClip("Walk", this.walk);
    this.runClip = this.createLoopedClip("Run", this.run);

    // One shot animations
    this.jumpClip = this.createSingleClip("Jump", this.jump);
    this.kickClip = this.createSingleClip("Kick", this.kick);
    this.punchClip = this.createSingleClip("Punch", this.punch);
  }

  /**
   * Creates a looping animation clip
   * @param name - Name of the clip
   * @param animAsset - Animation asset
   * @returns The created animation clip
   */
  private createLoopedClip(name: string, animAsset: AnimationAsset): AnimationClip {
    const clip = AnimationClip.createFromAnimation(name, animAsset);
    clip.weight = 0;
    this.animationPlayer.addClip(clip);
    this.animationPlayer.playClip(clip.name);
    this.clips.push(clip);
    return clip;
  }

  /**
   * Creates a one-shot animation clip
   * @param name - Name of the clip
   * @param animAsset - Animation asset
   * @returns The created animation clip
   */
  private createSingleClip(name: string, animAsset: AnimationAsset): AnimationClip {
    const clip = AnimationClip.createFromAnimation(name, animAsset);
    clip.playbackMode = PlaybackMode.Single;
    this.animationPlayer.addClip(clip);
    this.clips.push(clip);
    return clip;
  }

  /**
   * Sets the current active animation clip
   * @param clip - The clip to set as current
   */
  private setNewClip(clip: AnimationClip): void {
    this.currClip = clip;
  }

  /**
   * Blends between animation clips smoothly
   */
  private blendClips(): void {
    for (const clip of this.clips) {
      const weight = clip.name !== this.currClip.name ? 0 : 1;
      clip.weight = MathUtils.lerp(clip.weight, weight, getDeltaTime() * 7);
    }
    // Make sure idle is always weight 1 for proper blending
    this.idleClip.weight = 1;
  }

  /**
   * Checks if an animation clip is almost finished
   * @param clip - The clip to check
   * @returns True if the clip is within 0.4 seconds of completion
   */
  private isClipAlmostDone(clip: AnimationClip): boolean {
    return this.animationPlayer.getClipCurrentTime(clip.name) > clip.duration - 0.4;
  }
}
