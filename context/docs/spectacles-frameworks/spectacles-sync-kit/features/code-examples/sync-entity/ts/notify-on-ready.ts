import { SyncEntity } from 'SpectaclesSyncKit.lspkg/Core/SyncEntity';

@component
export class NotifyOnReadyExample extends BaseScriptComponent {
  @input
  syncEntity: SyncEntity;

  onReady() {
    print('The session has started and this entity is ready!');
    // Start your entity's behavior here!
  }

  onAwake() {
    this.syncEntity.notifyOnReady(() => this.onReady());
  }
}
