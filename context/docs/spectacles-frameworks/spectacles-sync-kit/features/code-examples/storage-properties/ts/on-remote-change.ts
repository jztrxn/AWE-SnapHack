import { StorageProperty } from 'SpectaclesSyncKit.lspkg/Core/StorageProperty';

@component
export class OnRemoteChangeExample extends BaseScriptComponent {
  private scoreProp = StorageProperty.manualInt('score', 0);

  onAwake() {
    this.scoreProp.onRemoteChange.add((newValue: number, oldValue: number) => {
      print(
        'Someone else changed the current value changed from ' +
          oldValue +
          ' to ' +
          newValue
      );
    });
  }
}
