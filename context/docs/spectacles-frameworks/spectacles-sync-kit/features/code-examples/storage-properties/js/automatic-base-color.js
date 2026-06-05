var StorageProperty =
  require('SpectaclesSyncKit.lspkg/Core/StorageProperty').StorageProperty;

// @input
/** @type {MaterialMeshVisual} */
var visual = script.visual;

script.createEvent('OnStartEvent').bind(function () {
  var colorProp = StorageProperty.forMeshVisualBaseColor(visual, false);
});
