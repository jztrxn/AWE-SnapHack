import { SessionController } from 'SpectaclesSyncKit.lspkg/Core/SessionController';
import { PinchButton } from 'SpectaclesInteractionKit.lspkg/Components/UI/PinchButton/PinchButton';
import {
  StartModeController,
  StartMode,
} from 'SpectaclesSyncKit.lspkg/StartMenu/Scripts/StartModeController';
import {
  ErrorMessageController,
  ErrorType,
} from 'SpectaclesSyncKit.lspkg/StartMenu/Scripts/ErrorMessageController';

const ERROR_DURATION_SECONDS = 5;

@component
export class EnableMultiplayer extends BaseScriptComponent {
  @input
  multiplayerButton: PinchButton;

  @input
  worldCamera: SceneObject;

  @input
  startMenuDistanceFromUser: number;

  @input
  startMenuTransform: Transform;

  onAwake() {
    this.createEvent('OnStartEvent').bind(() => this.onStart());
  }

  onStart() {
    // Skip the start menu if the lens was launched directly as multiplayer
    this.checkIfStartedAsMultiplayer();

    // Pinch multiplayer button to start multiplayer session
    this.multiplayerButton.onButtonPinched.add(() =>
      this.startMultiplayerSession()
    );

    // Re-enable the start menu if the connection fails
    SessionController.getInstance().onConnectionFailed.add(
      (code: string, description: string) => {
        // Intentional cancellation and errors use the same callback, so we need to check the code
        if (code !== 'CancelledByUser') {
          print(
            `Connection failed (${code}): ${description}, showing error alert`
          );
          ErrorMessageController.getInstance().showError(
            ErrorType.ConnectionFailed,
            this.getSceneObject(),
            ERROR_DURATION_SECONDS
          );
        } else {
          print('Connection cancelled by user, not showing error alert');
        }

        // Only re-enable the start menu if we're in Menu mode
        // Auto-start mode handles failures with retries, not by showing the menu
        const controller = StartModeController.getInstance();
        if (controller.getAutoStartMode() === StartMode.Menu) {
          this.getSceneObject().enabled = true;
          this.setStartMenuInFrontOfUser();
        }
      }
    );
  }

  startMultiplayerSession() {
    print('Start multiplayer session');
    SessionController.getInstance().init();
  }

  /**
   * If the systemUI has requested that the lens launch directly into multiplayer mode,
   * immediately dismiss this menu and initialize the Spectacles Sync Kit.
   */
  private checkIfStartedAsMultiplayer() {
    const shouldStartMultiplayer =
      global.launchParams.getBool('StartMultiplayer');
    print(`Lens started as multiplayer: ${shouldStartMultiplayer}`);
    if (shouldStartMultiplayer) {
      this.startMultiplayerSession();
    }
  }

  private setStartMenuInFrontOfUser() {
    const head = this.worldCamera.getTransform().getWorldPosition();
    const forward = this.worldCamera.getTransform().forward;
    forward.y = 0;
    const pos = forward
      .normalize()
      .uniformScale(-this.startMenuDistanceFromUser);
    this.startMenuTransform.setWorldPosition(head.add(pos));

    this.startMenuTransform.setWorldRotation(
      quat.lookAt(pos.uniformScale(-1), vec3.up())
    );
  }
}
