import { InteractableManipulation } from 'SpectaclesInteractionKit.lspkg/Components/Interaction/InteractableManipulation/InteractableManipulation';
import { SyncEntity } from 'SpectaclesSyncKit.lspkg/Core/SyncEntity';
import { Controller } from './Controller';

@component
export class Piece extends BaseScriptComponent {
  @input()
  controller: Controller;
  @input()
  manipulatable: InteractableManipulation;

  private syncEntity: SyncEntity;

  private finishTurn() {
    // Piece was moved, tell controller that my turn is complete
    this.controller.finishTurn();
    // Prevent the piece from being moved again
    this.manipulatable.setCanTranslate(false);
  }

  private onReady() {
    // Prefab has been instantiated by the local user
    if (this.syncEntity.networkRoot.locallyCreated) {
      // Piece belongs to me, I can move it
      this.manipulatable.setCanTranslate(true);
      this.manipulatable.onManipulationEnd.add(() => this.finishTurn());
    } else {
      // Piece belongs to other player, I can't move it
      this.manipulatable.setCanTranslate(false);
    }
  }

  onAwake() {
    const sceneObj = this.getSceneObject();

    // Get sync entity for SyncTransform script
    this.syncEntity = SyncEntity.getSyncEntityOnSceneObject(sceneObj);

    // Check sync entity is ready before using it
    this.syncEntity.notifyOnReady(() => this.onReady());
  }
}
