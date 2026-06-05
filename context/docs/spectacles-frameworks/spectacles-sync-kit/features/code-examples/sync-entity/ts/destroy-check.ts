import { SyncEntity } from 'SpectaclesSyncKit.lspkg/Core/SyncEntity';

@component
export class DestroyCheckExample extends BaseScriptComponent {
  @input
  syncEntity: SyncEntity;

  onAwake() {
    if (!this.syncEntity.destroyed) {
      this.syncEntity.destroy();
    }
  }
}
