import { SyncEntity } from 'SpectaclesSyncKit.lspkg/Core/SyncEntity';
import { StorageProperty } from 'SpectaclesSyncKit.lspkg/Core/StorageProperty';
import { Instantiator } from 'SpectaclesSyncKit.lspkg/Components/Instantiator';
import { InstantiationOptions } from 'SpectaclesSyncKit.lspkg/Components/Instantiator';
import { SessionController } from 'SpectaclesSyncKit.lspkg/Core/SessionController';

@component
export class Controller extends BaseScriptComponent {
  @input()
  instantiator: Instantiator;
  @input()
  xPrefab: ObjectPrefab;
  @input()
  oPrefab: ObjectPrefab;

  // This will sync our game state across all players
  private syncEntity: SyncEntity;
  // This tracks across the network how many turns have been played (starts at 0)
  private turnsCountStorageProperty = StorageProperty.manualInt(
    'turnsCount',
    0
  );

  private player: 'X' | 'O' | null = null;
  private MAX_TURNS: number = 9; // 3x3 grid
  private isGameOver: boolean = false;

  // Call this function to inform the controller that a turn has been finished
  public finishTurn() {
    const turnsCount: number = this.turnsCountStorageProperty.currentValue + 1;
    this.turnsCountStorageProperty.setPendingValue(turnsCount);
  }

  private setTurn(newCount: number) {
    // No player has completed a turn yet, don't do anything
    if (newCount === 0) return;

    // The maximum number of turns have been played, the game is over
    if (newCount === this.MAX_TURNS) {
      this.isGameOver = true;
      return;
    }

    // Check whose turn it is and spawn their piece
    if (newCount % 2 === 0 && this.player === 'X') {
      this.spawn(this.xPrefab);
    } else if (newCount % 2 === 1 && this.player === 'O') {
      this.spawn(this.oPrefab);
    }
  }

  onReady() {
    const playerCount: number =
      SessionController.getInstance().getUsers().length;

    // Assign pieces to users
    // The first player is X, the second is O, everyone else is a spectator
    if (playerCount === 1) {
      this.player = 'X';
    } else if (playerCount === 2) {
      this.player = 'O';
    }

    // If O is assigned, send event to start the game
    if (this.player === 'O') {
      this.syncEntity.sendEvent('start');
    }
  }

  private start() {
    // Player X spawns first piece to start the game
    if (this.player === 'X') {
      this.spawn(this.xPrefab);
    }
  }

  private spawn(prefab: ObjectPrefab) {
    if (this.instantiator.isReady()) {
      // Spawn piece using the SpectaclesSyncKit instantiator, set local start position
      const options = new InstantiationOptions();
      options.localPosition = new vec3(0, -25, 0);
      this.instantiator.instantiate(prefab, options);
    }
  }

  onAwake() {
    // Create new sync entity for the controller
    this.syncEntity = new SyncEntity(this);
    // Use storage property to keep track of turns, used to figure out whose turn it is
    this.syncEntity.addStorageProperty(this.turnsCountStorageProperty);

    // Add networked event to start the game
    this.syncEntity.onEventReceived.add('start', () => this.start());

    this.turnsCountStorageProperty.onAnyChange.add((newVal: number) =>
      this.setTurn(newVal)
    );

    // Set up the sync entity notify on ready callback
    // Note: Only update the sync entity once it is ready
    this.syncEntity.notifyOnReady(() => this.onReady());
  }
}
