import { SyncEntity } from 'SpectaclesSyncKit.lspkg/Core/SyncEntity';
import { StorageProperty } from 'SpectaclesSyncKit.lspkg/Core/StorageProperty';

@component
export class SetValueImmediateExample extends BaseScriptComponent {
  private syncEntity: SyncEntity;
  private scoreProp = StorageProperty.manualInt('score', 0);

  setScoreImmediate() {
    this.scoreProp.setValueImmediate(this.syncEntity.currentStore, -1);
  }
}
