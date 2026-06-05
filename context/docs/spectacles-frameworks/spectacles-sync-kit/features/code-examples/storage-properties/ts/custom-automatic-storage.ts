import { StorageProperty } from 'SpectaclesSyncKit.lspkg/Core/StorageProperty';
import { StorageTypes } from 'SpectaclesSyncKit.lspkg/Core/StorageTypes';

@component
export class CustomAutomaticStorageExample extends BaseScriptComponent {
  onAwake() {
    const transform = this.getTransform();

    const scaleProp = StorageProperty.auto(
      'localScale',
      StorageTypes.vec3,
      () => {
        // getter
        return transform.getLocalScale();
      },
      (val) => {
        // setter
        transform.setLocalScale(val);
      },
      { interpolationTarget: -0.25 }
    );
  }
}
