import { SyncEntity } from 'SpectaclesSyncKit.lspkg/Core/SyncEntity';

@component
export class PersistenceExample extends BaseScriptComponent {
  private syncEntity: SyncEntity;

  onAwake() {
    this.syncEntity = new SyncEntity(this, null, false, 'Session');
  }
}
