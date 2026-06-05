import { SyncEntity } from 'SpectaclesSyncKit.lspkg/Core/SyncEntity';
import { StorageProperty } from 'SpectaclesSyncKit.lspkg/Core/StorageProperty';
import { StoragePropertySet } from 'SpectaclesSyncKit.lspkg/Core/StoragePropertySet';
import { PropertyType } from 'SpectaclesSyncKit.lspkg/Core/PropertyType';

@component
export class StoragePropertySetExample extends BaseScriptComponent {
  onAwake() {
    const syncEntity = new SyncEntity(
      this,
      new StoragePropertySet([
        StorageProperty.manualString('myString', 'hello'),
        StorageProperty.forPosition(this.getTransform(), PropertyType.Local),
      ]),
      true
    );
  }
}
