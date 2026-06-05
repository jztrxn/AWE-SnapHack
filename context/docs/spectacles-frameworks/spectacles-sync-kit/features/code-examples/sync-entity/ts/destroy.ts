import { SyncEntity } from 'SpectaclesSyncKit.lspkg/Core/SyncEntity';

@component
export class DestroyExample extends BaseScriptComponent {
  @input
  syncEntity: SyncEntity;

  onAwake() {
    this.syncEntity.destroy();
  }
}
