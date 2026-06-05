import { SessionController } from 'SpectaclesSyncKit.lspkg/Core/SessionController';

@component
export class GetSnapchatUserInfo extends BaseScriptComponent {
  private sessionController: SessionController =
    SessionController.getInstance();
  onAwake() {
    this.sessionController.notifyOnReady(() => this.onReady());
  }

  private onReady(): void {
    const session = this.sessionController.getSession();
    if (!session) {
      print('No session available');
      return;
    }

    const localUserInfo = SessionController.getInstance().getLocalUserInfo();
    if (!localUserInfo) {
      print('No local user info available');
      return;
    } else {
      print('Local user info available: ' + JSON.stringify(localUserInfo));
    }

    // Get Snapchat user info for the local user
    session.getSnapchatUser(localUserInfo, (snapchatUser: SnapchatUser) => {
      if (!snapchatUser) {
        print(
          'getSnapchatUser returned null (expected in singleplayer/offline mode)'
        );
        return;
      }

      const name =
        snapchatUser.displayName || snapchatUser.userName || '<unknown>';
      print(
        'Got SnapchatUser: ' + name + ', hasBitmoji=' + snapchatUser.hasBitmoji
      );
    });
  }
}
