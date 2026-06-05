import { StorageProperty } from 'SpectaclesSyncKit.lspkg/Core/StorageProperty';

@component
export class AutomaticBaseColorExample extends BaseScriptComponent {
  @input
  visual: MaterialMeshVisual;

  onAwake() {
    const colorProp = StorageProperty.forMeshVisualBaseColor(
      this.visual,
      false
    );
  }
}
