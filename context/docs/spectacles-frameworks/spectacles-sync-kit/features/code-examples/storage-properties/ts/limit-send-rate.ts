import { StorageProperty } from 'SpectaclesSyncKit.lspkg/Core/StorageProperty';

@component
export class LimitSendRateExample extends BaseScriptComponent {
  private scoreProp = StorageProperty.manualInt('score', 0);

  onAwake() {
    this.scoreProp.sendsPerSecondLimit = 10;
  }
}
