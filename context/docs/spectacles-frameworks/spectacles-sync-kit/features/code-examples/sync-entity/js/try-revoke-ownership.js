const SyncEntity =
  require('SpectaclesSyncKit.lspkg/Core/SyncEntity').SyncEntity;

const syncEntity = new SyncEntity(script);

syncEntity.tryRevokeOwnership(function () {
  print('Ownership revoked');
});
