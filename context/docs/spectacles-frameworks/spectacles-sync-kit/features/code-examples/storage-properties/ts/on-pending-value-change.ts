import { StorageProperty } from 'SpectaclesSyncKit.lspkg/Core/StorageProperty';

@component
export class OnPendingValueChangeExample extends BaseScriptComponent {
  private scoreProp = StorageProperty.manualInt('score', 0);

  onAwake() {
    this.scoreProp.onPendingValueChange.add(
      (newValue: number, oldValue: number) => {
        print('Pending value changed from ' + oldValue + ' to ' + newValue);
      }
    );
  }
}
