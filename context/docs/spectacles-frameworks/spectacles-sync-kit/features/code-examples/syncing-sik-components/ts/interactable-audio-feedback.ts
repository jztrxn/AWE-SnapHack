import { Interactable } from 'SpectaclesInteractionKit.lspkg/Components/Interaction/Interactable/Interactable';

@component
export class InteractableAudioFeedbackExample extends BaseScriptComponent {
  @input
  interactable: Interactable;

  @input
  playAudioOnTriggerStart: boolean;

  private _triggerStartAudioComponent: AudioComponent;

  onAwake() {
    this.interactable.onTriggerStart.add(() => {
      try {
        if (this.playAudioOnTriggerStart && this._triggerStartAudioComponent) {
          this._triggerStartAudioComponent.play(1);
        }
      } catch (e) {
        print('Error playing trigger start audio: ' + e);
      }
    });

    this.interactable.onSyncTriggerStart.add(() => {
      try {
        if (this.playAudioOnTriggerStart && this._triggerStartAudioComponent) {
          this._triggerStartAudioComponent.play(1);
        }
      } catch (e) {
        print('Error playing trigger start audio: ' + e);
      }
    });
  }
}
