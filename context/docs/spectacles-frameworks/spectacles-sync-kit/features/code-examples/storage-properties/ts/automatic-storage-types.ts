import { StorageProperty } from 'SpectaclesSyncKit.lspkg/Core/StorageProperty';

@component
export class AutomaticStorageTypesExample extends BaseScriptComponent {
  onAwake() {
    const transform = this.getTransform();

    const scaleProp = StorageProperty.autoVec3(
      'localScale',
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
