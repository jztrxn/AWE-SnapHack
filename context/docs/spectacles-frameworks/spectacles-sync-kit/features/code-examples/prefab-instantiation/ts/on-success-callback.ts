import { Instantiator } from 'SpectaclesSyncKit.lspkg/Components/Instantiator';
import { NetworkRootInfo } from 'SpectaclesSyncKit.lspkg/Core/NetworkRootInfo';

@component
export class OnSuccessCallbackExample extends BaseScriptComponent {
  @input
  instantiator: Instantiator;

  @input
  prefab: ObjectPrefab;

  onAwake() {
    this.instantiator.notifyOnReady(() => {
      this.instantiator.instantiate(
        this.prefab,
        {},
        (networkRootInfo: NetworkRootInfo) => {
          const newObj = networkRootInfo.instantiatedObject;
          print('instantiated new object: ' + newObj);
        }
      );
    });
  }
}
