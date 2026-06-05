import { StorageProperty } from 'SpectaclesSyncKit.lspkg/Core/StorageProperty';
import { PropertyType } from 'SpectaclesSyncKit.lspkg/Core/PropertyType';

@component
export class AutomaticTransformExample extends BaseScriptComponent {
  onAwake() {
    const transform = this.getTransform();
    const positionType = PropertyType.Local;
    const rotationType = PropertyType.Local;
    const scaleType = PropertyType.Local;

    const transformProp = StorageProperty.forTransform(
      transform,
      positionType,
      rotationType,
      scaleType
    );
    const positionProp = StorageProperty.forPosition(
      transform,
      PropertyType.Local
    );
    const rotationProp = StorageProperty.forRotation(
      transform,
      PropertyType.Local
    );
    const scaleProp = StorageProperty.forScale(transform, PropertyType.Local);
  }
}
