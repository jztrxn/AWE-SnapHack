import { StorageProperty } from 'SpectaclesSyncKit.lspkg/Core/StorageProperty';

@component
export class OnLocalChangeExample extends BaseScriptComponent {
  private scoreProp = StorageProperty.manualInt('score', 0);

  onAwake() {
    this.scoreProp.onLocalChange.add((newValue: number, oldValue: number) => {
      print(
        'I changed the current value changed from ' +
          oldValue +
          ' to ' +
          newValue
      );
    });
  }
}
