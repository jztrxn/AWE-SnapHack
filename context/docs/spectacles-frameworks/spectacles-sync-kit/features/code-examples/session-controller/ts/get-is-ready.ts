import { SessionController } from 'SpectaclesSyncKit.lspkg/Core/SessionController';

@component
export class GetIsReadyExample extends BaseScriptComponent {
  onAwake() {
    if (SessionController.getInstance().getIsReady()) {
      // Session is ready
    }
  }
}
