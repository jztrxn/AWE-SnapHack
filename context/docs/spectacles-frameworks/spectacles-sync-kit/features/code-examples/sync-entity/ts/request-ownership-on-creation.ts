import { SyncEntity } from 'SpectaclesSyncKit.lspkg/Core/SyncEntity';

@component
export class RequestOwnershipOnCreationExample extends BaseScriptComponent {
  private syncEntity: SyncEntity;

  onAwake() {
    this.syncEntity = new SyncEntity(this, null, true);
  }
}
