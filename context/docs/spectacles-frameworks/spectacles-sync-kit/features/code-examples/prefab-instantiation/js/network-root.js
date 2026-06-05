var SyncEntity = require('SpectaclesSyncKit.lspkg/Core/SyncEntity').SyncEntity;

var syncEntity = new SyncEntity(script);

if (syncEntity.networkRoot) {
  print("Looks like I've been instantiated");

  if (syncEntity.networkRoot.locallyCreated) {
    print('I was created by the local user.');
  } else {
    print('I was created by another user.');
  }
}
