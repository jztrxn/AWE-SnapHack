import { SessionController } from 'SpectaclesSyncKit.lspkg/Core/SessionController';

@component
export class ReferencingSessionControllerExample extends BaseScriptComponent {
  onAwake() {
    const sessionController: SessionController =
      SessionController.getInstance();
  }
}
