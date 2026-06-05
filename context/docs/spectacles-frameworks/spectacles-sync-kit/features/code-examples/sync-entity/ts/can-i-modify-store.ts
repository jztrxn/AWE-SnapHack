import { SyncEntity } from 'SpectaclesSyncKit.lspkg/Core/SyncEntity';

@component
export class CanIModifyStoreExample extends BaseScriptComponent {
  @input
  syncEntity: SyncEntity;

  onAwake() {
    if (this.syncEntity.canIModifyStore()) {
      this.syncEntity.requestOwnership();
    }
  }
}
