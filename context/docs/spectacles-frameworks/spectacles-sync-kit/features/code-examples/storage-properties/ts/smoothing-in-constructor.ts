import { StorageProperty } from 'SpectaclesSyncKit.lspkg/Core/StorageProperty';
import { StorageTypes } from 'SpectaclesSyncKit.lspkg/Core/StorageTypes';
import { SnapshotBufferOptions } from 'SpectaclesSyncKit.lspkg/Core/SyncSnapshot';

@component
export class SmoothingInConstructorExample extends BaseScriptComponent {
  // Create a StorageProperty with smoothing options
  private prop = new StorageProperty(
    'prop',
    StorageTypes.float,
    new SnapshotBufferOptions({ interpolationTarget: -0.25 })
  );
}
