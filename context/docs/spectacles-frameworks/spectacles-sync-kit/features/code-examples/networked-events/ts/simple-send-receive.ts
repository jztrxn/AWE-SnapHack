import { SyncEntity } from 'SpectaclesSyncKit.lspkg/Core/SyncEntity';

@component
export class SimpleSendReceiveExample extends BaseScriptComponent {
  @input
  syncEntity: SyncEntity;

  onAwake() {
    function sayHi() {
      print('Hi!');
    }

    this.syncEntity.onEventReceived.add('sayHi', sayHi);
  }
}
