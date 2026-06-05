import { SyncEntity } from 'SpectaclesSyncKit.lspkg/Core/SyncEntity';

@component
export class CreateSyncEntityExample extends BaseScriptComponent {
  onAwake() {
    const syncEntity: SyncEntity = new SyncEntity(this);
  }
}
