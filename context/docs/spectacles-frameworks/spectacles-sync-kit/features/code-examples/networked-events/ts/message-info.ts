import { SyncEntity } from 'SpectaclesSyncKit.lspkg/Core/SyncEntity';
import { NetworkMessage } from 'SpectaclesSyncKit.lspkg/Core/NetworkMessage';

@component
export class MessageInfoExample extends BaseScriptComponent {
  @input
  syncEntity: SyncEntity;

  onAwake() {
    this.syncEntity.onEventReceived.add(
      'myEventName',
      (messageInfo: NetworkMessage<string>) => {
        print('event sender: ' + messageInfo.senderUserId);
        print('event sender connectionId: ' + messageInfo.senderConnectionId);
        print('event name: ' + messageInfo.message);
        print('event data: ' + messageInfo.data);
      }
    );
  }
}
