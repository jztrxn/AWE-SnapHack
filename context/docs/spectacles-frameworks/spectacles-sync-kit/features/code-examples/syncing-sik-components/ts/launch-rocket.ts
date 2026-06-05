import { Interactable } from 'SpectaclesInteractionKit.lspkg/Components/Interaction/Interactable/Interactable';

@component
export class LaunchRocketExample extends BaseScriptComponent {
  launchRocket() {
    // rocket launch logic
  }

  onAwake() {
    const interactable = this.sceneObject.getComponent(
      Interactable.getTypeName()
    );
    interactable.onTriggerEnd.add(this.launchRocket);
    interactable.onSyncTriggerEnd.add(this.launchRocket);
  }
}
