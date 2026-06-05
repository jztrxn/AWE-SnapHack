var Instantiator =
  require('SpectaclesSyncKit.lspkg/Components/Instantiator').Instantiator;

// @input Component.ScriptComponent instantiator
// @input Asset.ObjectPrefab prefab

/** @type {Instantiator} */
var instantiator = script.instantiator;
var prefab = script.prefab;

instantiator.notifyOnReady(function () {
  instantiator.instantiate(prefab, {}, function (networkRootInfo) {
    var newObj = networkRootInfo.instantiatedObject;
    print('instantiated new object: ' + newObj);
  });
});
