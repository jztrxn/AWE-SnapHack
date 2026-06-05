var StorageProperty =
  require('SpectaclesSyncKit.lspkg/Core/StorageProperty').StorageProperty;
var StorageTypes =
  require('SpectaclesSyncKit.lspkg/Core/StorageTypes').StorageTypes;

script.createEvent('OnStartEvent').bind(function () {
  var transform = script.getTransform();

  var scaleProp = StorageProperty.auto(
    'localScale',
    StorageTypes.vec3,
    function () {
      // getter
      return transform.getLocalScale();
    },
    function (val) {
      // setter
      transform.setLocalScale(val);
    },
    { interpolationTarget: -0.25 }
  );
});
