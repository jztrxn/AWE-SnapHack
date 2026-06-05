const SyncEntity =
  require('SpectaclesSyncKit.lspkg/Core/SyncEntity').SyncEntity;

const syncEntity = new SyncEntity(script);

function onSuccess() {
  print('Ownership claimed');
}

function onError() {
  print('Error, ownership not claimed');
}

syncEntity.tryClaimOwnership(onSuccess, onError);
