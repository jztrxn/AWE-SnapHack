var SyncEntity = require('SpectaclesSyncKit.lspkg/Core/SyncEntity').SyncEntity;

var syncEntity = new SyncEntity(script);

var soundData = {
  clipName: 'bounce',
  volume: 0.5,
  loops: 1,
  position: new vec3(1, 2, 3),
};

syncEntity.sendEvent('playSound', soundData);

syncEntity.onEventReceived.add('playSound', function (messageInfo) {
  let soundData = /** @type {typeof soundData} */ (messageInfo.data);
  print('clipName: ' + soundData.clipName);
  print('volume: ' + soundData.volume);
  print('loops: ' + soundData.loops);
  print('position: ' + soundData.position);
});
