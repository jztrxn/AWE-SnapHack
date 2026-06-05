import { StorageProperty } from 'SpectaclesSyncKit.lspkg/Core/StorageProperty';
import { PropertyType } from 'SpectaclesSyncKit.lspkg/Core/PropertyType';

@component
export class SmoothingWithConstructorsExample extends BaseScriptComponent {
  onAwake() {
    const transform = this.getTransform();

    const prop = StorageProperty.forPosition(transform, PropertyType.Local, {
      interpolationTarget: -0.25,
    });

    const otherProp = StorageProperty.manualFloat('myFloat', 0, {
      interpolationTarget: -0.25,
    });
  }
}
