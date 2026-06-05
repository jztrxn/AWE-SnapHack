var SyncEntity = require('SpectaclesSyncKit.lspkg/Core/SyncEntity').SyncEntity;
var StorageProperty =
  require('SpectaclesSyncKit.lspkg/Core/StorageProperty').StorageProperty;
var StoragePropertySet =
  require('SpectaclesSyncKit.lspkg/Core/StoragePropertySet').StoragePropertySet;
var PropertyType =
  require('SpectaclesSyncKit.lspkg/Core/PropertyType').PropertyType;

script.createEvent('OnStartEvent').bind(function () {
  var syncEntity = new SyncEntity(
    script,
    new StoragePropertySet([
      StorageProperty.manualString('myString', 'hello'),
      StorageProperty.forPosition(script.getTransform(), PropertyType.Local),
    ]),
    true
  );
});
