//@ts-check
/**
 * @filename SceneManager.js
 * @description This script utilizes `SceneManagerModule`, it creates a singleton global `SceneManager` instance
 * allowing the instance of the SceneManger to be accessed through `global.sceneManager`
 * @author Snap Inc
 * @version 1.0.7
 */

/**
@typedef localSceneRegistryItem
@property {string} sceneName
@property {Asset.ObjectPrefab} sceneAsset
*/

/**
@typedef remoteSceneRegistryItem
@property {string} sceneName
@property {Asset.RemoteReferenceAsset} sceneAsset
*/

// @input localSceneRegistryItem[] localSceneRegistry
// @input remoteSceneRegistryItem[] remoteSceneRegistry
// @input bool customizeSceneManagerRoot
// @input SceneObject managerRoot {"showIf":"customizeSceneManagerRoot"}
// @ui {"widget":"separator"}
// @input bool verbose = false

const { SceneManager } = require("SceneManagerModule");

script.isOfType = (type) => {
    return type === "Component.SceneManager" || type === "Component.ScriptComponent" || type === "Component";
};

script.getTypeName = () => {
    return "Component.SceneManager";
};

//check if this is attached to a scene object
if (!script) {
    Studio.log("❌ - SceneManager.js must be attached to a scene object.");
}
if (!global.sceneManager) {
    // set root
    const root = script.managerRoot == null ? script.getSceneObject() : script.managerRoot;
    /** @type {import("./SceneManagerModule").SceneManagerConfig} */
    const sceneManagerConfig = {
        script: script,
        localRegistry: script.localSceneRegistry,
        remoteRegistry: script.remoteSceneRegistry,
        root: root
    };
    global.sceneManager = new SceneManager(sceneManagerConfig);
    global.sceneManager.verbose = script.verbose;
} else {
    Studio.log("❌ - There could be only one SceneManager instance. To utilize multiple scene managers, please use the SceneManagerModule.js directly and implement your own SceneManager");
}
