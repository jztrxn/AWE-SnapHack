import { SyncEntity } from 'SpectaclesSyncKit.lspkg/Core/SyncEntity';

@component
export class TryRevokeOwnershipExample extends BaseScriptComponent {
  @input
  syncEntity: SyncEntity;

  onAwake() {
    this.syncEntity.tryRevokeOwnership(() => {
      print('Ownership revoked');
    });
  }
}
