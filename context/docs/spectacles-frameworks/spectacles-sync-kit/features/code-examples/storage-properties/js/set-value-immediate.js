var SyncEntity = require('SpectaclesSyncKit.lspkg/Core/SyncEntity').SyncEntity;
var StorageProperty =
  require('SpectaclesSyncKit.lspkg/Core/StorageProperty').StorageProperty;

/** @type {SyncEntity} */
var syncEntity; // initialized elsewhere
var scoreProp = StorageProperty.manualInt('score', 0);

scoreProp.setValueImmediate(syncEntity.currentStore, -1);
