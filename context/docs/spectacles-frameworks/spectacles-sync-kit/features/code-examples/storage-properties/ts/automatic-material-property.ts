import { StorageProperty } from 'SpectaclesSyncKit.lspkg/Core/StorageProperty';
import { StorageTypes } from 'SpectaclesSyncKit.lspkg/Core/StorageTypes';

@component
export class AutomaticMaterialPropertyExample extends BaseScriptComponent {
  @input
  material: Material;

  onAwake() {
    const materialProp = StorageProperty.forMaterialProperty(
      this.material,
      'propName',
      StorageTypes.float
    );
  }
}
