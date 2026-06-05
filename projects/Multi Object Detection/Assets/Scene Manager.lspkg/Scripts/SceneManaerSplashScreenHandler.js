//@ts-check
/**
 * @filename SceneManagerSplashScreenHandler.js
 * @description This is an extension to the SceneManager Custom Component
 * This module handles the instantiation of loading screen.
 * @author Snap Inc
 * @version 1.1.2
 */

const { CoroutineManager, waitTill, waitForSeconds } = require("Coroutine");
// eslint-disable-next-line no-unused-vars
const { SceneManager, SceneManagerExtension } = require("SceneManagerModule");

// @ui {"widget": "label", "label": "IMPORTANT:"}
// @ui {"widget": "label", "label": "Scene Registration Required"}
// @ui {"widget": "label", "label": "Please ensure that the scene is registered"}
// @ui {"widget": "label", "label": "in the Scene Manager registry!"}
// @ui {"widget": "label"}

// @input string splashScreenSceneName {"hint":"the name of the scene that will be treated as the splash screen"}
// @input float minimalDuration = 1 {"widget":"slider", "min":0.0, "max":5.0, "step":0.01, "hint":"The minimum time the loading screen should be displayed, in seconds"}

class SplashScreenHandler extends SceneManagerExtension {

    /**
     * @param {SceneManager} sceneManager
     * @param {ScriptComponent} scriptHost
     * @param {ObjectPrefab} prefab
     * @param {number} minimalDuration in seconds
     */
    constructor(sceneManager, scriptHost, prefab, minimalDuration) {
        super(sceneManager, scriptHost, true);
        this.prefab = prefab;
        this.minimalDuration = minimalDuration;
    }

    start() {
        // prepare for registering       
        // immediately load the scene at the first frame.        
        this.loadedScene = this.mySceneManager.loadSceneSync(script.splashScreenSceneName, { additive: true, enabled: true });
        //check if StartSceneLoader is used        
        this.startSceneLoader = this.mySceneManager.extensions.find(ext => ext.extensionType === "StartSceneLoader");
        //start the coroutine
        this.coroutineManager = new CoroutineManager(this.scriptHost);
        this.coroutineManager.startCoroutine(this._timedUnload.bind(this));
    }

    *_timedUnload() {
        //wait till passes minimalDuration        
        yield* waitForSeconds(this.minimalDuration);
        if (this.startSceneLoader) {
            //@ts-expect-error
            yield* waitTill(() => this.startSceneLoader.loadCompleted === true);
        }
        this.mySceneManager.unloadScene(this.loadedScene);
    }
}

// runs on script component awake
(function _onAwake() {
    const splashScreen = new SplashScreenHandler(global.sceneManager, script, script.prefab, script.minimalDuration);
    script.createEvent("OnStartEvent").bind(() => {
        splashScreen.start();
    });
})();