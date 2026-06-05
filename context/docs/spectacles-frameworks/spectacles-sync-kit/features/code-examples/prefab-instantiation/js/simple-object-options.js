var Instantiator =
  require('SpectaclesSyncKit.lspkg/Components/Instantiator').Instantiator;

// @input Component.ScriptComponent instantiator
// @input Asset.ObjectPrefab prefab

/** @type {Instantiator} */
var instantiator = script.instantiator;
var prefab = script.prefab;

instantiator.notifyOnReady(function () {
  instantiator.instantiate(prefab, {
    claimOwnership: true,
    persistence: 'Session',
    localPosition: new vec3(0, 0, -100),
  });
});
