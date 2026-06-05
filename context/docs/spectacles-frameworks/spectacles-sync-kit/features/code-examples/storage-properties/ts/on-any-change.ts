import { StorageProperty } from 'SpectaclesSyncKit.lspkg/Core/StorageProperty';

@component
export class OnAnyChangeExample extends BaseScriptComponent {
  private scoreProp = StorageProperty.manualInt('score', 0);

  onAwake() {
    this.scoreProp.onAnyChange.add((newValue: number, oldValue: number) => {
      print('Current value changed from ' + oldValue + ' to ' + newValue);
    });
  }
}
