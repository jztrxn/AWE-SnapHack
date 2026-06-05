const SyncEntity =
  require('SpectaclesSyncKit.lspkg/Core/SyncEntity').SyncEntity;

const syncEntity = new SyncEntity(script);

function onReady() {
  print('The session has started and this entity is ready!');
  // Start your entity's behavior here!
}

syncEntity.notifyOnReady(onReady);
