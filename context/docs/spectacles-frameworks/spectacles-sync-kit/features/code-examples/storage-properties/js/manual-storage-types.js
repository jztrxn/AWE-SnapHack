var StorageProperty =
  require('SpectaclesSyncKit.lspkg/Core/StorageProperty').StorageProperty;

// Integer storage property (no smoothing available)
var scoreProp = StorageProperty.manualInt('score', 0);

// String storage property (no smoothing available)
var nameProp = StorageProperty.manualString('name', 'hello');

// Vec3 storage property with smoothing
var scaleProp = StorageProperty.manualVec3(
  'scale',
  script.getTransform().getLocalScale(),
  { interpolationTarget: -0.25 }
);
