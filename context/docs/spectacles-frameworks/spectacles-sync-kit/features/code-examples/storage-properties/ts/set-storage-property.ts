import { StorageProperty } from 'SpectaclesSyncKit.lspkg/Core/StorageProperty';

@component
export class SetStoragePropertyExample extends BaseScriptComponent {
  private scoreProp = StorageProperty.manualInt('score', 0);
  private textProp = StorageProperty.manualString('myText', '');

  updateScore() {
    this.scoreProp.setPendingValue(3);
  }

  updateText() {
    this.textProp.setPendingValue('new text!');
  }
}
