import { SyncEntity } from 'SpectaclesSyncKit.lspkg/Core/SyncEntity';

@component
export class TryClaimOwnershipExample extends BaseScriptComponent {
  @input
  syncEntity: SyncEntity;

  onSuccess() {
    print('Ownership claimed');
  }

  onError() {
    print('Error, ownership not claimed');
  }

  onAwake() {
    this.syncEntity.tryClaimOwnership(this.onSuccess, this.onError);
  }
}
