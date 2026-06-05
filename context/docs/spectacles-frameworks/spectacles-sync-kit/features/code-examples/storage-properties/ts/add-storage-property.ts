import { SyncEntity } from 'SpectaclesSyncKit.lspkg/Core/SyncEntity';
import { StorageProperty } from 'SpectaclesSyncKit.lspkg/Core/StorageProperty';

@component
export class AddStoragePropertyExample extends BaseScriptComponent {
  private exampleProp = StorageProperty.manualInt('exampleProp', 0);

  onAwake() {
    const syncEntity = new SyncEntity(this);
    syncEntity.addStorageProperty(this.exampleProp);
  }
}
