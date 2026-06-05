var StorageProperty =
  require('SpectaclesSyncKit.lspkg/Core/StorageProperty').StorageProperty;

var scoreProp = StorageProperty.manualInt('score', 0);

script.createEvent('OnStartEvent').bind(function () {
  scoreProp.onAnyChange.add(function (newValue, oldValue) {
    print('Current value changed from ' + oldValue + ' to ' + newValue);
  });
});
