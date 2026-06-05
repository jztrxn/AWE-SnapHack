var SyncEntity = require('SpectaclesSyncKit.lspkg/Core/SyncEntity').SyncEntity;
var StorageProperty =
  require('SpectaclesSyncKit.lspkg/Core/StorageProperty').StorageProperty;

var exampleProp = StorageProperty.manualInt('exampleProp', 0);

script.createEvent('OnStartEvent').bind(function () {
  var syncEntity = new SyncEntity(script);
  syncEntity.addStorageProperty(exampleProp);
});
