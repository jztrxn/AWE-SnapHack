var Interactable =
  require('SpectaclesInteractionKit.lspkg/Components/Interaction/Interactable/Interactable').Interactable;

/** @type {Interactable} */
var interactable = script.interactable;
/** @type {boolean} */
var playAudioOnTriggerStart = script.playAudioOnTriggerStart;
/** @type {AudioComponent} */
var _triggerStartAudioComponent = script._triggerStartAudioComponent;

interactable.onTriggerStart.add(function () {
  try {
    if (playAudioOnTriggerStart && _triggerStartAudioComponent) {
      _triggerStartAudioComponent.play(1);
    }
  } catch (e) {
    print('Error playing trigger start audio: ' + e);
  }
});

interactable.onSyncTriggerStart.add(function () {
  try {
    if (playAudioOnTriggerStart && _triggerStartAudioComponent) {
      _triggerStartAudioComponent.play(1);
    }
  } catch (e) {
    print('Error playing trigger start audio: ' + e);
  }
});
