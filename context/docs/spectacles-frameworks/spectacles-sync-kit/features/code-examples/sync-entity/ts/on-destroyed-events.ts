import { SyncEntity } from 'SpectaclesSyncKit.lspkg/Core/SyncEntity';

@component
export class OnDestroyedEventsExample extends BaseScriptComponent {
  @input
  syncEntity: SyncEntity;

  onAwake() {
    this.syncEntity.onDestroyed.add(() => {
      print('Sync entity was destroyed');
    });

    this.syncEntity.onLocalDestroyed.add(() => {
      print('Sync entity was destroyed by me');
    });

    this.syncEntity.onRemoteDestroyed.add(() => {
      print('Sync entity was destroyed by another user');
    });
  }
}
