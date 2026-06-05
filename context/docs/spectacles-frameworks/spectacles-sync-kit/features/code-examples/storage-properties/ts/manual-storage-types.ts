import { StorageProperty } from 'SpectaclesSyncKit.lspkg/Core/StorageProperty';

@component
export class ManualStorageTypesExample extends BaseScriptComponent {
  // Integer storage property (no smoothing available)
  private scoreProp = StorageProperty.manualInt('score', 0);

  // String storage property (no smoothing available)
  private nameProp = StorageProperty.manualString('name', 'hello');

  // Vec3 storage property with smoothing
  private scaleProp = StorageProperty.manualVec3(
    'scale',
    this.getTransform().getLocalScale(),
    { interpolationTarget: -0.25 }
  );
}
