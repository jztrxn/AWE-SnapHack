import { SyncEntity } from 'SpectaclesSyncKit.lspkg/Core/SyncEntity';

@component
export class NetworkRootExample extends BaseScriptComponent {
  @input
  syncEntity: SyncEntity;

  onAwake() {
    if (this.syncEntity.networkRoot) {
      print("Looks like I've been instantiated");

      if (this.syncEntity.networkRoot.locallyCreated) {
        print('I was created by the local user.');
      } else {
        print('I was created by another user.');
      }
    }
  }
}
