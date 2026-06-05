import { SessionController } from 'SpectaclesSyncKit.lspkg/Core/SessionController';

@component
export class SessionNotifyOnReadyExample extends BaseScriptComponent {
  onAwake() {
    const sessionController: SessionController =
      SessionController.getInstance();

    sessionController.notifyOnReady(() => {
      // SessionController is ready to use
    });
  }
}
