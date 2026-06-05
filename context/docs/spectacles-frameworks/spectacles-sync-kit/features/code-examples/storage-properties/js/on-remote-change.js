var StorageProperty =
  require('SpectaclesSyncKit.lspkg/Core/StorageProperty').StorageProperty;

var scoreProp = StorageProperty.manualInt('score', 0);

script.createEvent('OnStartEvent').bind(function () {
  scoreProp.onRemoteChange.add(function (newValue, oldValue) {
    print(
      'Someone else changed the current value changed from ' +
        oldValue +
        ' to ' +
        newValue
    );
  });
});
