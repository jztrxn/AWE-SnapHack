import { SnapshotBufferOptions } from 'SpectaclesSyncKit.lspkg/Core/SyncSnapshot';

@component
export class SnapshotBufferOptionsExample extends BaseScriptComponent {
  // Create SnapshotBufferOptions with configuration object
  private options = new SnapshotBufferOptions({
    interpolationTarget: -0.25,
  });
}
