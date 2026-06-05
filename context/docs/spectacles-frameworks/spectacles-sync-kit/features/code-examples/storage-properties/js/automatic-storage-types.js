var StorageProperty =
  require('SpectaclesSyncKit.lspkg/Core/StorageProperty').StorageProperty;

script.createEvent('OnStartEvent').bind(function () {
  var transform = script.getTransform();

  var scaleProp = StorageProperty.autoVec3(
    'localScale',
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
