import { SyncEntity } from 'SpectaclesSyncKit.lspkg/Core/SyncEntity';

@component
export class IsSetupFinishedExample extends BaseScriptComponent {
  @input
  syncEntity: SyncEntity;

  onAwake() {
    if (this.syncEntity.isSetupFinished) {
      // Setup is finished
    }
  }
}
