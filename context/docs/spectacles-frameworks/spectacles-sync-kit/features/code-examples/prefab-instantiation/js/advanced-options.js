var Instantiator =
  require('SpectaclesSyncKit.lspkg/Components/Instantiator').Instantiator;
var InstantiationOptions =
  require('SpectaclesSyncKit.lspkg/Components/Instantiator').InstantiationOptions;

// @input Component.ScriptComponent instantiator
// @input Asset.ObjectPrefab prefab

/** @type {Instantiator} */
var instantiator = script.instantiator;
var prefab = script.prefab;
var sessionController = global.sessionController;

instantiator.notifyOnReady(function () {
  var customDataStore = GeneralDataStore.create();
  customDataStore.putString(
    'displayName',
    sessionController.getLocalUserName()
  );

  var options = new InstantiationOptions();
  options.claimOwnership = true;
  options.localPosition = new vec3(0, 0, 0);
  options.localRotation = quat.quatIdentity();
  options.localScale = new vec3(0, 0, 0);
  options.persistence = 'Session';
  options.onSuccess = function (networkRootInfo) {
    print('Success!');
  };
  options.onError = function (error) {
    print('Error!');
  };
  options.customDataStore = customDataStore;

  instantiator.instantiate(prefab, options);
});
