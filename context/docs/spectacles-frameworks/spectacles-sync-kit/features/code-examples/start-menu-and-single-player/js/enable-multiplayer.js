const PinchButton = require('SpectaclesInteractionKit.lspkg/Components/UI/PinchButton/PinchButton');

/** @typedef {PinchButton} */
//@input PinchButton multiplayerButton

var sessionController = global.sessionController;

function onAwake() {
  script.createEvent('OnStartEvent').bind(function () {
    onStart();
  });
}

function onStart() {
  // Skip the start menu if the lens was launched directly as multiplayer
  checkIfStartedAsMultiplayer();
  // Pinch multiplayer button to start multiplayer session
  script.multiplayerButton.onButtonPinched.add(function () {
    startMultiplayerSession();
  });
}

function startMultiplayerSession() {
  print('Start multiplayer session');
  sessionController.init();
}

/**
 * If the systemUI has requested that the lens launch directly into multiplayer mode,
 * immediately dismiss this menu and initialize the Spectacles Sync Kit.
 */
function checkIfStartedAsMultiplayer() {
  var shouldStartMultiplayer = global.launchParams.getBool('StartMultiplayer');
  print('Lens started as multiplayer: ' + shouldStartMultiplayer);
  if (shouldStartMultiplayer) {
    startMultiplayerSession();
  }
}

onAwake();
