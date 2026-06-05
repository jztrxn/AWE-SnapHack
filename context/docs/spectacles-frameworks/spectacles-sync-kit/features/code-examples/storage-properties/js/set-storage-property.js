var StorageProperty =
  require('SpectaclesSyncKit.lspkg/Core/StorageProperty').StorageProperty;

var scoreProp = StorageProperty.manualInt('score', 0);
var textProp = StorageProperty.manualString('myText', '');

scoreProp.setPendingValue(3);

textProp.setPendingValue('new text!');
