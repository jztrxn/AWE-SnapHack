var StorageProperty =
  require('SpectaclesSyncKit.lspkg/Core/StorageProperty').StorageProperty;
var StorageTypes =
  require('SpectaclesSyncKit.lspkg/Core/StorageTypes').StorageTypes;

// @input
/** @type {MaterialMeshVisual} */
var visual = script.visual;

script.createEvent('OnStartEvent').bind(function () {
  var meshProp = StorageProperty.forMeshVisualProperty(
    visual,
    'propName',
    StorageTypes.float,
    true
  );
});
