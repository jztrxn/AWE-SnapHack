import { StorageProperty } from 'SpectaclesSyncKit.lspkg/Core/StorageProperty';
import { StorageTypes } from 'SpectaclesSyncKit.lspkg/Core/StorageTypes';

@component
export class AutomaticMeshVisualPropertyExample extends BaseScriptComponent {
  @input
  visual: MaterialMeshVisual;

  onAwake() {
    const meshProp = StorageProperty.forMeshVisualProperty(
      this.visual,
      'propName',
      StorageTypes.float,
      true
    );
  }
}
