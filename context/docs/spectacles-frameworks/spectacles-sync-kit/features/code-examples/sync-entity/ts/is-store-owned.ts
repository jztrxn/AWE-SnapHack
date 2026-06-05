import { SyncEntity } from 'SpectaclesSyncKit.lspkg/Core/SyncEntity';

@component
export class IsStoreOwnedExample extends BaseScriptComponent {
  @input
  syncEntity: SyncEntity;

  onAwake() {
    if (this.syncEntity.isStoreOwned()) {
      print('Store is owned');
    }
  }
}
