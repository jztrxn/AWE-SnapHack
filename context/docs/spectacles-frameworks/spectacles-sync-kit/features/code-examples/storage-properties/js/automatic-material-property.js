var StorageProperty =
  require('SpectaclesSyncKit.lspkg/Core/StorageProperty').StorageProperty;
var StorageTypes =
  require('SpectaclesSyncKit.lspkg/Core/StorageTypes').StorageTypes;

// @input
/** @type {Material} */
var material = script.material;

script.createEvent('OnStartEvent').bind(function () {
  var materialProp = StorageProperty.forMaterialProperty(
    material,
    'propName',
    StorageTypes.float
  );
});
