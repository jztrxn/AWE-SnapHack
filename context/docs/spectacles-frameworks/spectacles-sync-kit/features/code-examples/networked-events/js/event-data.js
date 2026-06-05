var SyncEntity = require('SpectaclesSyncKit.lspkg/Core/SyncEntity').SyncEntity;

var syncEntity = new SyncEntity(script);

syncEntity.sendEvent('printMessage', 'this is my event data!');

syncEntity.onEventReceived.add('printMessage', function (messageInfo) {
  print(messageInfo.data);
});
