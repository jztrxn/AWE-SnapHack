import { SyncEntity } from 'SpectaclesSyncKit.lspkg/Core/SyncEntity';
import { NetworkMessage } from 'SpectaclesSyncKit.lspkg/Core/NetworkMessage';

@component
export class EventDataObjectExample extends BaseScriptComponent {
  @input
  syncEntity: SyncEntity;

  onAwake() {
    const soundData = {
      clipName: 'bounce',
      volume: 0.5,
      loops: 1,
      position: new vec3(1, 2, 3),
    };

    this.syncEntity.sendEvent('playSound', soundData);

    this.syncEntity.onEventReceived.add(
      'playSound',
      (messageInfo: NetworkMessage<typeof soundData>) => {
        let soundData = messageInfo.data;
        print('clipName: ' + soundData.clipName);
        print('volume: ' + soundData.volume);
        print('loops: ' + soundData.loops);
        print('position: ' + soundData.position);
      }
    );
  }
}
