import { SyncEntity } from 'SpectaclesSyncKit.lspkg/Core/SyncEntity';

@component
export class OnOwnerUpdatedExample extends BaseScriptComponent {
  @input
  syncEntity: SyncEntity;

  onAwake() {
    this.syncEntity.onOwnerUpdated.add(() => {
      print('Owner updated to ' + this.syncEntity.ownerInfo.userId);
    });
  }
}
