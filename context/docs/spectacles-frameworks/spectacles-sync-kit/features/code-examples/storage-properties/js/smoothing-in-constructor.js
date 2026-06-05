var StorageProperty =
  require('SpectaclesSyncKit.lspkg/Core/StorageProperty').StorageProperty;
var StorageTypes =
  require('SpectaclesSyncKit.lspkg/Core/StorageTypes').StorageTypes;
var SnapshotBufferOptions =
  require('SpectaclesSyncKit.lspkg/Core/SyncSnapshot').SnapshotBufferOptions;

// Create a StorageProperty with smoothing options
var prop = new StorageProperty(
  'prop',
  StorageTypes.float,
  new SnapshotBufferOptions({ interpolationTarget: -0.25 })
);
