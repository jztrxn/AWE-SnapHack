import { SyncEntity } from 'SpectaclesSyncKit.lspkg/Core/SyncEntity';

@component
export class GetOnComponentExample extends BaseScriptComponent {
  private syncEntity: SyncEntity;

  someMethod(scriptComponent: ScriptComponent) {
    this.syncEntity = SyncEntity.getSyncEntityOnComponent(scriptComponent);
  }
}
