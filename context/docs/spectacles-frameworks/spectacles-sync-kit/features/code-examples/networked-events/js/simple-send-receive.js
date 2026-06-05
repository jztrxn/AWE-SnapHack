var SyncEntity = require('SpectaclesSyncKit.lspkg/Core/SyncEntity').SyncEntity;

var syncEntity = new SyncEntity(script);

function sayHi() {
  print('Hi!');
}

syncEntity.onEventReceived.add('sayHi', sayHi);
