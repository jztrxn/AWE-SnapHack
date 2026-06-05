import { StorageProperty } from 'SpectaclesSyncKit.lspkg/Core/StorageProperty';

@component
export class AutomaticTextExample extends BaseScriptComponent {
  @input
  textComponent: Text;

  onAwake() {
    const textProp = StorageProperty.forTextText(this.textComponent);
  }
}
