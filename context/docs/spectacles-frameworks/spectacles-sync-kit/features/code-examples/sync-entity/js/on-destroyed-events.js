const SyncEntity =
  require('SpectaclesSyncKit.lspkg/Core/SyncEntity').SyncEntity;

const syncEntity = new SyncEntity(script);

syncEntity.onDestroyed.add(function () {
  print('Sync entity was destroyed');
});

syncEntity.onLocalDestroyed.add(function () {
  print('Sync entity was destroyed by me');
});

syncEntity.onRemoteDestroyed.add(function () {
  print('Sync entity was destroyed by another user');
});
