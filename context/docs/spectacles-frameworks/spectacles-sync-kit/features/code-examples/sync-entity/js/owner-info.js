const SyncEntity =
  require('SpectaclesSyncKit.lspkg/Core/SyncEntity').SyncEntity;

const syncEntity = new SyncEntity(script);

const owner = syncEntity.ownerInfo.displayName;
print('Store is owned by ' + owner);
