var SyncEntity = require('SpectaclesSyncKit.lspkg/Core/SyncEntity').SyncEntity;

var syncEntity = new SyncEntity(script);

syncEntity.onEventReceived.add('myEventName', function (messageInfo) {
  print('event sender userId: ' + messageInfo.senderUserId);
  print('event sender connectionId: ' + messageInfo.senderConnectionId);
  print('event name: ' + messageInfo.message);
  print('event data: ' + messageInfo.data);
});
