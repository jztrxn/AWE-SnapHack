import { StorageProperty } from 'SpectaclesSyncKit.lspkg/Core/StorageProperty';

@component
export class SmoothingExample extends BaseScriptComponent {
  // Pass smoothing options directly when creating the property
  private scoreProp = StorageProperty.manualFloat('score', 0, {
    interpolationTarget: -0.25,
  });
}
