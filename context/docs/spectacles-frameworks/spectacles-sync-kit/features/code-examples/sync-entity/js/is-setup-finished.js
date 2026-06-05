const SyncEntity =
  require('SpectaclesSyncKit.lspkg/Core/SyncEntity').SyncEntity;

const syncEntity = new SyncEntity(script);

if (syncEntity.isSetupFinished) {
  // Setup is finished
}
