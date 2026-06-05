//@ts-check
/**
 * @filename SceneManaerStartSceneLoader.js
 * @description This is an extension to the Scene Manager
 * this script handles loading start scene including platform specific settings
 * @author Snap Inc
 * @version 1.0.12
 */

// typedef
/**
@typedef platformSceneInitConfig
@property {string} platform {"widget":"combobox","values":[{"label":"Desktop","value":"Desktop"},{"label":"Mobile","value":"Mobile"},{"label":"Editor","value":"Editor"},{"label":"Spectacles","value":"Spectacles"}]}
@property {string} sceneName
*/

// serialized properties
// @ui {"widget": "label", "label": "IMPORTANT:"}
// @ui {"widget": "label", "label": "Scene Registration Required"}
// @ui {"widget": "label", "label": "Please ensure that the scene is registered"}
// @ui {"widget": "label", "label": "in the Scene Manager registry!"}
// @ui {"widget": "label"}

// @input string defaultStartSceneName
// @input bool usePlatformSpecificStartScene = false
// @input platformSceneInitConfig[] platformSceneInitConfigs {"showIf":"usePlatformSpecificStartScene"}

// imports
// eslint-disable-next-line no-unused-vars
const { SceneManager, SceneManagerExtension } = require("SceneManagerModule");

/**
@typedef {("Desktop"|"Mobile"|"Editor"|"Spectacles")} PlatformType
*/

class StartSceneLoader extends SceneManagerExtension {
    /**
     * @param {SceneManager} sceneManager
     * @param {ScriptComponent} scriptHost
     * @param {string} defaultStartSceneName
     * @param {boolean} usePlatformSpecificStartScene
     * @param {platformSceneInitConfig[]} platformSceneInitConfigs
     */
    constructor(sceneManager, scriptHost, defaultStartSceneName, usePlatformSpecificStartScene, platformSceneInitConfigs) {

        const found = sceneManager.findScenePrefabByName(defaultStartSceneName);
        if (!found) throw new Error(`Can't find scene by name ${defaultStartSceneName}! Make sure the name matches.`);
        super(sceneManager, scriptHost, true);
        /** @private */
        this._defaultStartSceneName = defaultStartSceneName;
        /** @private */
        this._usePlatformSpecificStartScene = usePlatformSpecificStartScene;
        /** @private */
        this._platformSceneInitConfigs = platformSceneInitConfigs;
        /** @private */
        this._updateFrameCount = 0;

        // private flag
        /** @private */
        this._loadCompleted = false;
    }

    /**
     * @public
     */
    get loadCompleted() {
        return this._loadCompleted;
    }

    /**
     * @public
     */
    start() {
        //make sure the instantiation happens on the 2nd frame. 
        //giving splash screen enough time to load and display a static image
        const updateEvent = this.scriptHost.createEvent("UpdateEvent");
        updateEvent.bind(() => {
            this._shortLifeUpdate(updateEvent);
        });
    }

    /**
     * Returns the platform on which the script is currently running.
     * @private
     * @returns {PlatformType}
     */
    getPlatform() {
        if (global.deviceInfoSystem.isEditor()) return "Editor";
        if (global.deviceInfoSystem.isDesktop()) return "Desktop";
        if (global.deviceInfoSystem.isMobile()) return "Mobile";
        if (global.deviceInfoSystem.isSpectacles()) return "Spectacles";
        Studio.log("Warning: Unknown deviceInfoSystem type! Defaulting to 'Editor'.");
        return "Editor";
    }

    /**
     * @private
     * @param {platformSceneInitConfig[]} pltfrmSpeciStrtScn 
     * @returns {Map<PlatformType,string>}
     */
    _getPlatformSpecificSceneMap(pltfrmSpeciStrtScn) {
        const platformSceneMap = new Map();
        pltfrmSpeciStrtScn.forEach(({ platform, sceneName }) => {
            if (!["Editor", "Mobile", "Desktop", "Spectacles"].includes(platform)) {
                throw new Error("Invalid platform value. Platform must be one of: 'Editor', 'Mobile', 'Desktop', 'Spectacles'.");
            }
            if (sceneName.trim() === "") {
                Studio.log(`Skipping ${platform} scene due to empty scene name.`);
                return;
            }
            platformSceneMap.set(platform, sceneName);
        });
        return platformSceneMap;
    }
    /**
     * @private
     * @param {string} sceneToUse 
     */
    _loadScene(sceneToUse) {
        global.sceneManager.loadSceneAsync(sceneToUse,
            {
                additive: false,
                loadAsActive: true
            })
            .then(() => {
                this._loadCompleted = true;
            })
            .catch((rej) => {
                throw new Error(rej.toString());
            });
    }

    /**
     * @private
     * @returns {string}
     */
    _getSceneToLoad() {
        const platformSceneMap = this._getPlatformSpecificSceneMap(this._platformSceneInitConfigs);
        let sceneToUse = this._defaultStartSceneName;
        if (this._usePlatformSpecificStartScene) {
            const platform = this.getPlatform();
            Studio.log("platform is " + platform);
            const platformScene = platformSceneMap.get(platform);
            if (platformScene != undefined) {
                sceneToUse = platformScene;
            }
        }
        return sceneToUse;
    }

    /**
     * @private
     * @param {UpdateEvent} updateEvent 
     */
    _shortLifeUpdate(updateEvent) {
        this._updateFrameCount++;
        if (this._updateFrameCount > 1) {
            // run the loading on 2nd frame so it doesn't block the render of the splash screen
            const sceneToUse = this._getSceneToLoad();
            this._loadScene(sceneToUse);
            this.scriptHost.removeEvent(updateEvent);
        }
    }
}

function _checkInputParameters() {
    // Check if [at]inputs added parameters are present
    if (!script.defaultStartSceneName || typeof script.defaultStartSceneName !== "string") {
        throw new Error("defaultStartSceneName must be provided through [at]input and should be a string.");
    }
    // Check if usePlatformSpecificStartScene is provided and is a boolean
    if (typeof script.usePlatformSpecificStartScene !== "boolean") {
        throw new Error("usePlatformSpecificStartScene must be provided through [at]input and should be a boolean.");
    }
    // Check if platformSceneInitConfigs is provided and is an array
    if (!Array.isArray(script.platformSceneInitConfigs)) {
        throw new Error("platformSceneInitConfigs must be provided through [at]input and should be an array.");
    }
    // Additional check to make sure platformSceneInitConfigs array has valid objects
    script.platformSceneInitConfigs.forEach((config) => {
        if (typeof config !== "object" || typeof config.platform !== "string" || typeof config.sceneName !== "string") {
            throw new Error("platformSceneInitConfigs must be an array of objects with properties 'platform' and 'sceneName' of type string.");
        }
    });

    if (script.defaultStartSceneName.trim() == "") {
        throw new Error("defaultStartSceneName is invalid, the name can't be empty.");
    }
}

// runs on script component awake
(function _onAwake() {
    _checkInputParameters();
    // Instantiate and start the scene loader
    const startSceneLoader = new StartSceneLoader(global.sceneManager, script, script.defaultStartSceneName, script.usePlatformSpecificStartScene, script.platformSceneInitConfigs);
    script.createEvent("OnStartEvent").bind(() => {
        startSceneLoader.start();
    });
})();

