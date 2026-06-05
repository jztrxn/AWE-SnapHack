var StorageProperty =
  require('SpectaclesSyncKit.lspkg/Core/StorageProperty').StorageProperty;
var PropertyType =
  require('SpectaclesSyncKit.lspkg/Core/PropertyType').PropertyType;

script.createEvent('OnStartEvent').bind(function () {
  var transform = script.getTransform();

  var prop = StorageProperty.forPosition(transform, PropertyType.Local, {
    interpolationTarget: -0.25,
  });

  var otherProp = StorageProperty.manualFloat('myFloat', 0, {
    interpolationTarget: -0.25,
  });
});
