var Interactable =
  require('SpectaclesInteractionKit.lspkg/Components/Interaction/Interactable/Interactable').Interactable;

function launchRocket() {
  // rocket launch logic
}

var interactable = script.sceneObject.getComponent(Interactable.getTypeName());
interactable.onTriggerEnd.add(launchRocket);
interactable.onSyncTriggerEnd.add(launchRocket);
