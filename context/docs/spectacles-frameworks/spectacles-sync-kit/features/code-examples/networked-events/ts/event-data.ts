import { SyncEntity } from 'SpectaclesSyncKit.lspkg/Core/SyncEntity';

@component
export class EventDataExample extends BaseScriptComponent {
  @input
  syncEntity: SyncEntity;

  onAwake() {
    this.syncEntity.sendEvent('printMessage', 'this is my event data!');

    this.syncEntity.onEventReceived.add('printMessage', (messageInfo) => {
      print(messageInfo.data);
    });
  }
}
