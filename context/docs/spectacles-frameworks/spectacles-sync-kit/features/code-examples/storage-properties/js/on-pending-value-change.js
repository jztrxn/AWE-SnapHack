var StorageProperty =
  require('SpectaclesSyncKit.lspkg/Core/StorageProperty').StorageProperty;

var scoreProp = StorageProperty.manualInt('score', 0);

script.createEvent('OnStartEvent').bind(function () {
  scoreProp.onPendingValueChange.add(function (newValue, oldValue) {
    print('Pending value changed from ' + oldValue + ' to ' + newValue);
  });
});
