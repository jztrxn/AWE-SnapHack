import { SyncEntity } from 'SpectaclesSyncKit.lspkg/Core/SyncEntity';

@component
export class RequestOwnershipExample extends BaseScriptComponent {
  @input
  syncEntity: SyncEntity;

  onSuccess() {
    print('Ownership claimed');
  }

  onError() {
    print('Error, ownership not claimed');
  }

  onAwake() {
    this.syncEntity.requestOwnership(this.onSuccess, this.onError);
  }
}
