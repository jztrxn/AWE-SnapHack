import { SyncEntity } from 'SpectaclesSyncKit.lspkg/Core/SyncEntity';

@component
export class GetOnSceneObjectExample extends BaseScriptComponent {
  private syncEntity: SyncEntity;

  onAwake() {
    this.syncEntity = SyncEntity.getSyncEntityOnSceneObject(
      this.getSceneObject()
    );
  }
}
