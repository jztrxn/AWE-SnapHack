import { SyncEntity } from 'SpectaclesSyncKit.lspkg/Core/SyncEntity';

@component
export class DoIOwnStoreExample extends BaseScriptComponent {
  @input
  syncEntity: SyncEntity;

  onAwake() {
    if (this.syncEntity.doIOwnStore()) {
      print('I own the store');
    }
  }
}
