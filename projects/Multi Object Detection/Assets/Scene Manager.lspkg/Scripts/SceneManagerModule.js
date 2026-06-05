//@ts-check
/**
 * @filename SceneManagerModule.js
 * @description This file contains the SceneManager class.
 * @author Snap Inc
 * @version 1.2.0
 */

//---------------------------------------------
// class

const Event = require("Event Module").EventWrapper;

const Constant = Object.freeze({
    hook: {
        PREUNLOAD: "preUnloadHook",
    },
    loadedSceneState: {
        NEW: "NEW",
        LOADING: "LOADING",
        LOADED: "LOADED",
        UNLOADING: "UNLOADING",
        UNLOADED: "UNLOADED"
    }
});

const ASSET_TYPE = Object.freeze({
    PREFAB:"Asset.ObjectPrefab",
    REMOTE_ASSET:"Asset.RemoteReferenceAsset"
});

class SceneRegistryItem {

    /**
     * @param {string} sceneName
     * @param {ObjectPrefab | RemoteReferenceAsset} sceneAsset
     */
    constructor(sceneName, sceneAsset) {
        this.type = this._validate(sceneName, sceneAsset);
        /** @readonly */
        this.sceneName = sceneName;
        /** @readonly */
        this.sceneAsset = sceneAsset;
        /** @type {ObjectPrefab | undefined} */
        //@ts-expect-error
        this.objectPrefab = this.type === ASSET_TYPE.PREFAB ? this.sceneAsset : undefined;
    }

    /**
     * 
     * @param {string} sceneName
     * @param {Asset} sceneAsset
     * @returns {"Asset.ObjectPrefab" | "Asset.RemoteReferenceAsset"} typeString
     */
    _validate(sceneName, sceneAsset) {
        if (!sceneName || sceneName.trim() === "") {
            throw new Error(`sceneName cannot be empty or just whitespace.
            Invalid item: ${sceneName}`);
        }
        if (!sceneAsset) {
            throw new Error(`Asset cannot be null or undefined.
            Invalid item from scene ${sceneName}`);
        }
        if (!sceneAsset.isOfType("Asset")) {
            throw new Error(`scene asset has to be of type Asset.
            Invalid item from scene ${sceneName}`);
        }

        const validTypes = Object.values(ASSET_TYPE);
        const t = sceneAsset.getTypeName();

        if (!validTypes.includes(t)) {
            throw new Error(`Type must be one of the following: ${validTypes.join(", ")}`);
        }

        if (sceneAsset.isOfType(t) === false) {
            throw new Error(`${sceneName}'s asset ${sceneAsset.name} is registered as ${t} but its type doesn't match`);
        }
        //@ts-expect-error
        return t;
    }

    /**
     * Fetches a remote asset and returns a Promise that resolves to an ObjectPrefab.
     * The obtained prefab will be saved to this.objectPrefab for future use.
     * @returns {Promise<ObjectPrefab>} A Promise resolving to an ObjectPrefab if successful, otherwise rejects with an error message.
     * @throws {Error} If the instance type is not REGISTRY_ITEM_TYPE.REMOTE_ASSET.
     */
    fetchRemoteAsset() {
        if (this.type !== ASSET_TYPE.REMOTE_ASSET) {
            _logError("Only remote asset based scene needs fetching.");
            return null;
        }
        // Create and return a new Promise
        return new Promise((resolve, reject) => {
            this.sceneAsset.downloadAsset((asset) => {
                if (!asset.isOfType(ASSET_TYPE.PREFAB)) {
                    reject(`Remote asset has to be of type Asset.ObjectPrefab!\
                            but the asset of ${this.sceneName} is ${asset.getTypeName()}!\
                            Aborting...`);
                } else {
                    this.objectPrefab = asset;
                    resolve(asset);
                }
            },
            () => {
                // Reject the Promise with an error message if the download fails
                reject(`Failed to download the remote asset for ${this.sceneName}!`);
            });
        });
    }
}

/**
 * Represents an object pushed into the asyncLoadPromiseQueue.
 * @typedef {Object} AsyncLoadPromiseQueueItem
 * @property {SceneRegistryItem} registryItem
 * @property {boolean} additive
 * @property {boolean} enabled
 * @property {SceneObject} parent
 * @property {function(number):void} onProgressCallback
 * @property {function(LoadedScene):void} resolve - The promise to be pushed into the queue.
 * @property {function(string):void} reject - The resolver function associated with the promise.
 */

/**
 * @public
 * @typedef {Object} SceneManagerConfig
 * @property {ScriptComponent} script - The script that instantiates the SceneManager
 * @property {{sceneName: string, sceneAsset: ObjectPrefab}[]} localRegistry - Scene as prefabs
 * @property {{sceneName: string, sceneAsset: RemoteReferenceAsset}[]} remoteRegistry - Scene as prefabs
 * @property {SceneObject} root - The root scene object to load scenes into
 */

/**
 * @private
 * @param {string | number} message 
 */
function _logError(message) {
    const concat = "❌ - " + message.toString();
    Studio.log(concat);
}

/**
 * object for storing information about loaded scenes
 */
/**
 * @private
 */
class LoadedScene {
    /**
     * @param {SceneManager} manager - the scene manager that loads the scene
     * @param {number} loadedTime - the timestamp when the scene is loaded
     * @param {SceneObject} sceneRoot - root scene object of the scene
     * @param {SceneRegistryItem} source - the registryItem of the scene
     * @param {boolean} isAdditive - whether the scene is loaded as additive
     */
    constructor(manager, loadedTime, sceneRoot, source, isAdditive) {
        /** @readonly */
        this.manager = manager;
        /** @readonly */
        this.loadedTime = loadedTime;
        /** @readonly */
        this.sceneRoot = sceneRoot;
        /** @readonly */
        this.source = source;
        /** @readonly */
        this.isAdditive = isAdditive;
        /**
         * @package
         */
        this.state = Constant.loadedSceneState.NEW;
    }
}

/**
 * @public
 */
class SceneManager {
    /**
     * constructor
     * @param {SceneManagerConfig} config - The configuration object for SceneManager
     */
    constructor(config) {

        //PRIVATE
        /** @private */
        this._script = config.script;
        /** @private @type {LoadedScene[]} */
        this._loadedSceneArray = [];
        /** @private @type {Map<string, SceneRegistryItem>} */
        this._registry = new Map();
        /** @private @type {Map<LoadedScene, SceneObject[]>} */
        this._dontDestroyOnUnloadList = new Map();
        /** @private @type {Array<AsyncLoadPromiseQueueItem>} */
        this._asyncLoadPromiseQueue = [];
        /**
         * @private
         * @type {UpdateEvent}
         */
        this._asyncLoadCallWatcher = config.script.createEvent("UpdateEvent");
        this._asyncLoadCallWatcher.bind(this._processAsyncLoadQueue.bind(this));
        /** @package @type {boolean} */
        this.isAsyncLoading = false;
        //READONLY
        /** @readonly */
        this.root = config.root;
        //event listeners
        /**
         * fired whenever a scene is loaded
         * @readonly @type {Event<LoadedScene>} */
        this.onSceneLoaded = new Event();
        /** 
         * fired whenever a scene is unloaded
         * @readonly @type {Event<LoadedScene>} */
        this.onSceneUnloaded = new Event();

        //PUBLIC
        /** @public */
        this.verbose = false;
        /** @public @type {Array<SceneManagerExtension>} */
        this.extensions = [];

        //verify registries

        /**
        * Concatenates both the local and remote scene registry into a universal registry.
        */

        // Map over the local scene registry and return a new array
        const localRegistry =  config.localRegistry.map(item => ({
            sceneName: item.sceneName,
            sceneAsset: item.sceneAsset,
            type: ASSET_TYPE.PREFAB
        }));

        // Map over the remote scene registry and return a new array
        const remoteRegistry = config.remoteRegistry.map(item => ({
            sceneName: item.sceneName,
            sceneAsset: item.sceneAsset,
            type: ASSET_TYPE.REMOTE_ASSET
        }));

        // Concatenate localRegistry and remoteRegistry arrays
        const registryArray = [...localRegistry, ...remoteRegistry];

        // Create a new Map
        /** @type {Map<string, SceneRegistryItem>} */
        const universalRegistry = new Map();

        // Iterate over the registryArray
        for (const item of registryArray) {
            // Check if the sceneName already exists in the Map
            if (universalRegistry.has(item.sceneName)) {
                _logError(`Duplicate sceneName found: ${item.sceneName}. Please use unique name for each scene!`);
                continue;
            }
            try {
                const newRegistryItem =  new SceneRegistryItem(item.sceneName, item.sceneAsset);
                // Add item to the Map
                universalRegistry.set(item.sceneName, newRegistryItem);
            } catch (e) {
                _logError(`Creating ${item.sceneName} failed. Message: ${e}`);
                continue;
            }
        }
        /** @private */
        this._registry = universalRegistry;
        Studio.log("Scene Manager initialization completed.");
    }

    /**
     * Loads a new scene synchronously.
     * NOTE: remote scene can only be loaded through `loadSceneAsync`
     * @public
     * @param {string} localSceneName - The name of the scene to load.
     * @param {Object} [options={}] - An object containing optional parameters.
     * @param {boolean} [options.additive=true] - Whether the scene should be loaded additively.
     * @param {boolean} [options.enabled=true] - Whether the scene should be loaded as the active scene.
     * @param {SceneObject} [options.parent=null] - the root where the scene will be spawned into
     * @returns {LoadedScene} newlyLoadedScene
     */
    loadSceneSync(localSceneName, { additive = true, enabled = true, parent = null } = {}) {
        this._logVerbose(`--------------loadSceneSync: ${localSceneName}-----------------`);
        const registryItem = this._retrieveSourceByName(localSceneName);

        if (registryItem == null) {
            _logError(`scene ${localSceneName} is not in the registry.`);
            return;
        }

        if (registryItem.type == ASSET_TYPE.REMOTE_ASSET) {
            _logError("Remote scene can only be loaded through async loading. Aborting...");
            return;
        }

        // @ts-expect-error
        // instantiate the scene
        const sceneRoot = registryItem.sceneAsset.instantiate(this.root);
        if (sceneRoot == null) {
            return;
        }
        this._logVerbose(`scene loaded with scene root object: ${sceneRoot.name}`);
        const newScene = this._postInstantiation(sceneRoot, parent, registryItem, additive, enabled);
        this._logVerbose("-------------------------------");
        return newScene;
    }

    /**
     * Loads a scene from the registry by name and returns a promise that resolves to the instantiated scene object.
     * @param {string} name - The name of the scene to load.
     * @param {object} [options] - An optional object with the following properties:
     * @param {boolean} [options.additive=true] - Whether to load the scene additively or not. If false, all non-additive scenes will be unloaded first.
     * @param {boolean} [options.enabled=true] - Whether to set the loaded scene as the active scene or not.
     * @param {(percentage:number)=>void} [options.onProgress=null] - A callback function that takes a progress value between 0 and 1 as an argument and is called during the loading process.
     * @param {SceneObject} [options.parent=null] - the root where the scene will be spawned into
     * @returns {Promise<LoadedScene>} A promise that resolves to the instantiated scene object or rejects with an error message if the scene is not found in the registry or the loading fails.
     */
    async loadSceneAsync(name, { additive = true, enabled = true, parent = null, onProgress = null } = {}) {

        this._logVerbose(`====================== loadSceneAsync:${name} =====================`);

        const registryItem = this._retrieveSourceByName(name);

        if (registryItem == null) {
            _logError("scene " + name + " is not in the registry.");
            return;
        }

        let prefab = registryItem.objectPrefab;

        if (!prefab && registryItem.type === ASSET_TYPE.PREFAB) {
            _logError(`Can't find object prefab on ${registryItem.sceneName}`);
            return;
        }
        // retrieve the remote asset
        if (!prefab) {
            // remote asset downloading
            prefab = await registryItem.fetchRemoteAsset();
        }
        const onProgressCallback = onProgress != null ? onProgress : (/** @type {any} */ percentage) => { };

        if (!prefab.instantiateAsync) {
            throw new Error("instantiateAsync function doesn't exist. make sure your Lens Studio version is 4.49 or higher.");
        }

        const promise = new Promise((resolve, reject) => {
            this._asyncLoadPromiseQueue.push({
                registryItem,
                additive,
                enabled,
                parent,
                onProgressCallback,
                resolve,
                reject
            });
        });

        return promise;
    }

    /**
     * a frame to frame update function used to resolve the async load queue
     * @private
     * */
    _processAsyncLoadQueue() {
        // If the queue is empty or we're currently loading, exit early.
        if (!this._asyncLoadPromiseQueue.length || this.isAsyncLoading) {
            return;
        }
        //resolv async load in queue
        const params = this._asyncLoadPromiseQueue.shift();
        // Instantiate and resolve the promise
        this.isAsyncLoading = true;
        if (params) {
            //instantiate and resolve the promise
            this.isAsyncLoading = true;
            params.registryItem.objectPrefab.instantiateAsync(this.root,
                (newSceneObject) => {
                    this._logVerbose("obtaining new scene object:" + newSceneObject.name);
                    this._logVerbose("Instantiating prefab successfully.");
                    const newScene = this._postInstantiation(newSceneObject,
                        params.parent,
                        params.registryItem,
                        params.additive,
                        params.enabled);
                    params.resolve(newScene);
                    this.isAsyncLoading = false;
                },
                (msg) => {
                    params.reject(msg);
                    this.isAsyncLoading = false;
                },
                params.onProgressCallback);
        }
    }

    /**
     * @public
     * add a new item to the scenes list
     * @param {SceneRegistryItem} registryItem
     * @param {boolean} override whether to override exsting scene with the same name
     * @returns {SceneRegistryItem} the scene registry item that was added
     */
    registerScene(registryItem, override = false) {
        if (!override) {
            if (this._registry.has(registryItem.sceneName)) {
                _logError(`Scene with name ${registryItem.sceneName} already exists.\
                Registering failed.`);
                return;
            }
        }
        if (!this._verifySceneRegistryItemType(registryItem)) return;
        this._registry.set(registryItem.sceneName, registryItem);
        return this._registry.get(registryItem.sceneName);
    }

    /**
    * @public
    * @param {string} sceneName
    */
    unregisterScene(sceneName) {
        if (!this._registry.has(sceneName)) {
            throw new Error(`trying to unregister ${sceneName} but can't find it in the registry.`);
        }

        //check if there are any instance of the scene running
        if (this._loadedSceneArray.find(s => s.source.sceneName === sceneName)) {
            _logError("before unregister a scene, you must unload all the instances of the scene.\
            Aborting unregistering.");
            return;
        }
        this._registry.delete(sceneName);
    }

    /**
     * find scene registry item based on a given object prefab
     * @public
     * @param {ObjectPrefab} prefab 
     * @returns {SceneRegistryItem | undefined}
     */
    findSceneByPrefab(prefab) {
        let item;
        for (const i of this._registry.values()) {
            if (prefab === i.sceneAsset) {
                item = i;
                break;
            }
        }
        return item;
    }

    /**
     * find scene registry item based on scene name
     * @public
     * @param {string} sceneName 
     * @returns {SceneRegistryItem | null} 
     */
    findScenePrefabByName(sceneName) {
        if (this._registry.has(sceneName)) {
            return this._registry.get(sceneName);
        } else {
            return null;
        }
    }

    /**
     * Searches for a scene that matches the requester starting from the requester itself and then climbing up its parents.
     * Returns an object with the found scene and the number of climbs needed to find the scene.
     * If no scene is found, the returned object's `myScene` property is null and `climbCount` is -1.
     *
     * @public
     * @param {SceneObject} requester - The initial scene object to start the search from.
     * @returns {{myScene: LoadedScene, climbCount: number}} An object containing the found scene and the number of climbs.
     * */
    getCurrentScene(requester) {
        if (!requester) {
            _logError("`❌ - getCurrentScene` method is getting a null/undefined parameter as requester.");
            return;
        }
        if (!requester.isOfType("SceneObject")) {
            _logError("❌ - requester needs to be a Scene Object.");
            return;
        }
        let climbCount = 0;
        /** 
         * @param {SceneObject} so
         * @returns {LoadedScene}
         */
        const findMatchUpwards = (so) => {
            const m = this._loadedSceneArray.find(ls => ls.sceneRoot === so);
            climbCount++;
            if (m != null) {
                return m;
            } else if (so.hasParent()) {
                return findMatchUpwards(so.getParent());
            } else {
                return null;
            }
        };
        const myScene = findMatchUpwards(requester);
        if (!myScene) {
            climbCount = -1;
        }
        return {
            myScene,
            climbCount
        };
    }

    /**
     * unload all instances of the given scene by name
     * @public
     * @param {string} registryName
     */
    unloadSceneByName(registryName) {
        const registryItem = this._registry.get(registryName);
        if (registryItem == null) {
            _logError("Cannot find registry item with name " + registryName);
            return;
        }

        const scenes = this._loadedSceneArray.filter(s => s.source.sceneName === registryName);

        this._loadedSceneArray.forEach(i => {
            this._logVerbose(`Scene Name: ${i.source.sceneName}, Scene Source: ${JSON.stringify(i.source)}`);
        });
        this._logVerbose(`Registry Name: ${registryName}`);

        //list the registryName

        if (scenes.length === 0) {
            _logError(`Found 0 loaded scene from ${registryName}`);
            return;
        }
        this.unloadScenes(scenes);
    }

    /**
     * @public
     * unload an array of scenes
     * @param {LoadedScene[]} scenes
     * @param {((scene:LoadedScene)=>void)[] | undefined} onUnloadCompleteCallbacks
     */
    unloadScenes(scenes, onUnloadCompleteCallbacks = undefined) {
        if (!this._isNonEmptyArray(scenes)) {
            return;
        }
        let callbacks = undefined;
        if (onUnloadCompleteCallbacks) {
            if (Array.isArray(onUnloadCompleteCallbacks) && onUnloadCompleteCallbacks.length === scenes.length) {
                callbacks = onUnloadCompleteCallbacks;
            } else {
                Studio.log("Warning: `onUnloadCompleteCallbacks` either needs to be undefined\
                or the same length as the scenes param!\
                ignoring `onUnloadCompleteCallbacks`");
            }
        }
        scenes.forEach((scene, i) => {
            this.unloadScene(scene, callbacks ? callbacks[i] : undefined);
        });
    }

    /**
     * @public
     * @param {LoadedScene} scene 
     * @param {(scene:LoadedScene)=>void} onUnloadCompleteCallback callback after unload completes, useful when there exists preUnloadHook
     */
    unloadScene(scene, onUnloadCompleteCallback = undefined) {
        /**     
         * @param {LoadedScene} scene 
         */
        const postHook = (scene) => {
            const name = scene.sceneRoot.name;
            const prefabName = scene.source.sceneName;
            //check if there are don't destroy onunload items
            const dontDestroyItems = this._dontDestroyOnUnloadList.get(scene);
            if (dontDestroyItems) {
                dontDestroyItems.forEach(i => {
                    //pull it out from the scene parent and put it in the main scene
                    i.setParentPreserveWorldTransform(null);
                });
            }
            //destroy the root object
            scene.sceneRoot.destroy();
            this._logVerbose(`scene ${name} (prefab is ${prefabName}) is destroyed`);
            //remove it from the loadedSceneArray
            this._loadedSceneArray.splice(this._loadedSceneArray.indexOf(scene), 1);
            //adjust state
            scene.state = Constant.loadedSceneState.UNLOADED;
            //callbacks
            if (onUnloadCompleteCallback) {
                onUnloadCompleteCallback(scene);
            }
            //global callback
            this.onSceneUnloaded.trigger(scene);
        };
        if (!scene) {
            _logError("Trying to unload scene that is null, aborting...");
            return;
        }
        if (scene.state === Constant.loadedSceneState.UNLOADING) {
            this._logVerbose("Warning: Scene is already being unloaded");
            return;
        }
        if (scene.state === Constant.loadedSceneState.UNLOADED) {
            this._logVerbose("Warning: scene is already unloaded.");
            return;
        }
        this._logVerbose("unloading scene " + scene.source.sceneName);
        scene.state = Constant.loadedSceneState.UNLOADING;
        const preUnloadHook = this._findHook(scene.sceneRoot, Constant.hook.PREUNLOAD);
        if (preUnloadHook) {
            const hookPromise = preUnloadHook();
            if (hookPromise instanceof Promise) {
                hookPromise.then(() => {
                    postHook(scene);
                });
            } else {
                _logError(`preUnloadHook from ${scene.sceneRoot.name} needs to return a Promise!`);
                //skip the hook and do postHook
                postHook(scene);
            }
        } else {
            this._logVerbose("no hook found, unloading directly");
            postHook(scene);
        }
    }

    /**
     * decouple this scene object from its current parent scene.
     * when the previous parent scene gets unloaded, this object doesn't get affected.
     * @param {SceneObject} sceneObject 
     */
    dontDestroyOnUnload(sceneObject) {
        if (!sceneObject.isOfType("SceneObject")) {
            throw new Error("dontDestroyOnUnload needs to take a scene object as parameter!");
        }
        const parentScene = this.getCurrentScene(sceneObject).myScene;
        if (parentScene == null) {
            _logError(`scene object ${sceneObject.name} has no parent scene. aborting dontDestroyOnUnload.`);
            return;
        }

        if (this._dontDestroyOnUnloadList.has(parentScene)) {
            this._dontDestroyOnUnloadList.get(parentScene).push(sceneObject);
        } else {
            this._dontDestroyOnUnloadList.set(parentScene, [sceneObject]);
        }
    }

    ////////////////////////////////////////////////////
    //////////////// private members ///////////////////
    ////////////////////////////////////////////////////

    /**
     * @private
     * @param {string} registryItemName
     * @returns {SceneRegistryItem}
     */
    _retrieveSourceByName(registryItemName) {
        if (!registryItemName) {
            _logError("in retrieveSourceByName(): name can't be null.\
            Aborting _retrieveSourceByName");
            return;
        }
        const source = this._registry.get(registryItemName);
        if (source == null) {
            _logError(`in retrieveSourceByName(): source ${registryItemName} is not in the registry.`);
            return;
        }
        if (source.sceneAsset == null) {
            _logError(`in retrieveSourceByName(): source ${registryItemName} is missing object prefab.`);
            return;
        }
        return source;
    }

    /**
     * @private
     * Search for hooks from the script components on the scene root
     * @param {SceneObject} sceneRoot - The root object of the scene.
     * @param {string} hookName 
     * @returns {function}
     */
    _findHook(sceneRoot, hookName) {
        const scriptComponents = sceneRoot.getComponents("ScriptComponent");
        let foundHook = null;
        let foundMultiple = false;
        // Find the first hook that satisfies the condition
        for (const sc of scriptComponents) {
            if (typeof sc[hookName] === "function") {
                if (!foundHook) {
                    foundHook = sc[hookName];
                } else {
                    foundMultiple = true;
                    break;
                }
            }
        }
        // Warning and verbose logging
        if (foundMultiple) {
            Studio.log(`Warning: detected more than one ${hookName} on ${sceneRoot.name}. Only the first one will be used.`);
        } else if (!foundHook) {
            this._logVerbose(`Didn't find any ${hookName} on ${sceneRoot.name}.`);
        }
        return foundHook;
    }

    /**
     * @private
     * add the newly instantiated object to `loadedSceneArray` and emit the onSceneLoaded event
     * @param {SceneObject} sceneRoot 
     * @param {SceneObject} parent
     * @param {SceneRegistryItem} source
     * @param {boolean} isAdditive 
     * @param {boolean} enabled
     * @returns {LoadedScene}
     */
    _postInstantiation(sceneRoot, parent, source, isAdditive, enabled) {
        if (parent != null) {
            sceneRoot.setParentPreserveWorldTransform(parent);
        }
        sceneRoot.enabled = enabled;
        //add item to loadedScene
        const loadedScene = new LoadedScene(this, Date.now(), sceneRoot, source, isAdditive);
        this._loadedSceneArray.push(loadedScene);
        //trigger events
        this.onSceneLoaded.trigger(loadedScene);
        if (!isAdditive) {
            //unload all non-additive except myself
            let candidates = this._loadedSceneArray.filter(scene => scene.isAdditive === false);
            candidates = candidates.filter(can => can.sceneRoot !== sceneRoot);
            candidates.forEach(s => {
                Studio.log("about to delete scene " + s.sceneRoot.name);
            });
            this.unloadScenes(candidates);
        }
        loadedScene.state = Constant.loadedSceneState.LOADED;
        return loadedScene;
    }

    /**
     * @private
     * @param {SceneRegistryItem} item
     * @returns {boolean}
     */
    _verifySceneRegistryItemType(item) {
        if (item.sceneName.trim() === "") {
            _logError("The scene registry item's name can't be empty or whitespace");
            return false;
        }
        if (item.sceneAsset == null) {
            _logError(`The scene registry item ${item.sceneName} is missing the object prefab`);
            return false;
        }
        return true;
    }

    /**
     * 
     * @returns {boolean}
     * @param {string | any[]} para
     */
    _isNonEmptyArray(para) {
        return (Array.isArray(para) && para.length > 0);
    }

    /**
     * @private
     * @param {string | number} message 
     */
    _logVerbose(message) {
        if (this.verbose) {
            const msg = "🗣️ " + message;
            if (Studio.log && !global.deviceInfoSystem.isEditor) {
                Studio.log(msg);
            } else {
                Studio.log(msg);
            }
        }
    }
}

/**
 * This class is intended to be utilized by a script component that resides at the root of a Scene
 * It offers a simple and consistent mechanism for adding hooks to the scene
 * However, employing this class is not a prerequisite for adding hooks
 * As an abstract class, it must be extended before it can be used
 * @public
 * @abstract
 */
class SceneHandler {
    /**
     * 
     * @param {ScriptComponent} scriptHost 
     * @param {function():Promise<void> | null} preUnloadHook 
     */
    constructor(scriptHost, preUnloadHook) {
        if (this.constructor === SceneHandler) {
            throw new Error("Abstract class `SceneHandler` cannot be instantiated directly.");
        }
        if (!scriptHost) {
            throw new Error("scriptHost is undefined or null!");
        }
        if (!scriptHost.isOfType("Component.ScriptComponent")) {
            throw new Error("scriptHost must be a ScriptComponent!");
        }
        this.scriptHost = scriptHost;
        // verify and assign hooks
        this._hookVerifyAssign(Constant.hook.PREUNLOAD, preUnloadHook, scriptHost);
    }
    /**
     * 
     * @param {string} hookName
     * @param {function():Promise<void> | null | undefined} hook 
     * @param {ScriptComponent} scriptHost 
     */
    _hookVerifyAssign(hookName, hook, scriptHost) {
        // Check if the hook is undefined
        if (hook === undefined) {
            throw new Error(`${hookName} is undefined! If you intend it to be empty, it should be [null].`);
        }

        // Register the hook to scriptHost
        scriptHost[hookName] = hook;

    }
}

/**
 * @abstract
 * @public
 */
class SceneManagerExtension {
    /**
     * @param {SceneManager} sceneManager 
     * @param {ScriptComponent} scriptHost - The script component that instantiates this extension.
     * @param {boolean} unique - Specifies whether this extension can only have one instance.
     */
    constructor(sceneManager, scriptHost, unique) {
        // Validation checks
        if (new.target === SceneManagerExtension) {
            throw new Error("Cannot instantiate abstract class SceneManagerExtension.");
        }
        if (!sceneManager) {
            throw new Error("Can't find global.sceneManager. Please make sure the scene manager custom component is placed at the top of your Objects panel.");
        } else if (!(sceneManager instanceof SceneManager)) {
            throw new Error("Scene manager has to be an instance of SceneManager!");
        }
        /** @readonly @type {SceneManager} */
        this.mySceneManager = sceneManager;
        /** @readonly @type {ScriptComponent} */
        this.scriptHost = scriptHost;
        if (unique && (this.mySceneManager.extensions.filter(ext => ext instanceof this.constructor).length > 0)) {
            throw new Error("An instance of this class already exists. Only one instance of this extension is allowed!");
        }
        this.mySceneManager.extensions.push(this);
        this.extensionType = this.constructor.name;
    }

}

module.exports = {
    SceneManager,
    SceneManagerExtension,
    SceneHandler,
    Constant
};

