const SyncEntity =
  require('SpectaclesSyncKit.lspkg/Core/SyncEntity').SyncEntity;

const syncEntity = new SyncEntity(script);

syncEntity.onOwnerUpdated.add(function () {
  print('Owner updated to ' + syncEntity.ownerInfo.userId);
});
