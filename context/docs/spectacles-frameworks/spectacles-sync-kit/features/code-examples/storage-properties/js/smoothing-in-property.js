var StorageProperty =
  require('SpectaclesSyncKit.lspkg/Core/StorageProperty').StorageProperty;

// Pass smoothing options directly when creating the property
var scoreProp = StorageProperty.manualFloat('score', 0, {
  interpolationTarget: -0.25,
});
