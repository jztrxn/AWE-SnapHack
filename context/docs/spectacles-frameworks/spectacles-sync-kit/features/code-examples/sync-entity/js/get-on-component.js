const SyncEntity =
  require('SpectaclesSyncKit.lspkg/Core/SyncEntity').SyncEntity;

// @input Component.ScriptComponent scriptComponent

/** @type {ScriptComponent} */
const scriptComponent = script.scriptComponent;

const syncEntity = SyncEntity.getSyncEntityOnComponent(scriptComponent);
