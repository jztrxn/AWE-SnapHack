var StorageProperty =
  require('SpectaclesSyncKit.lspkg/Core/StorageProperty').StorageProperty;
var StorageTypes =
  require('SpectaclesSyncKit.lspkg/Core/StorageTypes').StorageTypes;

var matrixProp = StorageProperty.manual(
  'matrix',
  StorageTypes.mat4,
  mat4.identity()
);
