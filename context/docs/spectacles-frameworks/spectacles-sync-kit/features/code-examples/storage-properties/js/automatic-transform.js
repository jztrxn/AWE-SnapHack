var StorageProperty =
  require('SpectaclesSyncKit.lspkg/Core/StorageProperty').StorageProperty;
var PropertyType =
  require('SpectaclesSyncKit.lspkg/Core/PropertyType').PropertyType;

script.createEvent('OnStartEvent').bind(function () {
  var transform = script.getTransform();
  var positionType = PropertyType.Local;
  var rotationType = PropertyType.Local;
  var scaleType = PropertyType.Local;

  var transformProp = StorageProperty.forTransform(
    transform,
    positionType,
    rotationType,
    scaleType
  );
  var positionProp = StorageProperty.forPosition(transform, PropertyType.Local);
  var rotationProp = StorageProperty.forRotation(transform, PropertyType.Local);
  var scaleProp = StorageProperty.forScale(transform, PropertyType.Local);
});
