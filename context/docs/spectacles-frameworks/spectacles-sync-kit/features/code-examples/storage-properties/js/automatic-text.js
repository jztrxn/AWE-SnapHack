var StorageProperty =
  require('SpectaclesSyncKit.lspkg/Core/StorageProperty').StorageProperty;

// @input
/** @type {Text} */
var textComponent = script.textComponent;

script.createEvent('OnStartEvent').bind(function () {
  var textProp = StorageProperty.forTextText(textComponent);
});
