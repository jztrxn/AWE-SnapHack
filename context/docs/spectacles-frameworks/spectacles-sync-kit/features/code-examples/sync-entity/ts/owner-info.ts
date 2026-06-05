import { SyncEntity } from 'SpectaclesSyncKit.lspkg/Core/SyncEntity';

@component
export class OwnerInfoExample extends BaseScriptComponent {
  @input
  syncEntity: SyncEntity;

  onAwake() {
    const owner = this.syncEntity.ownerInfo.displayName;
    print('Store is owned by ' + owner);
  }
}
