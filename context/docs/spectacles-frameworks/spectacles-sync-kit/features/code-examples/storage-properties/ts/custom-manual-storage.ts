import { StorageProperty } from 'SpectaclesSyncKit.lspkg/Core/StorageProperty';
import { StorageTypes } from 'SpectaclesSyncKit.lspkg/Core/StorageTypes';

@component
export class CustomManualStorageExample extends BaseScriptComponent {
  private matrixProp = StorageProperty.manual(
    'matrix',
    StorageTypes.mat4,
    mat4.identity()
  );
}
