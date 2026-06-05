import { Instantiator } from 'SpectaclesSyncKit.lspkg/Components/Instantiator';

@component
export class SimpleInstantiationExample extends BaseScriptComponent {
  @input
  instantiator: Instantiator;

  @input
  prefab: ObjectPrefab;

  onReady() {
    this.instantiator.instantiate(this.prefab);
  }

  onAwake() {
    this.instantiator.notifyOnReady(() => {
      this.onReady();
    });
  }
}
