import { Instantiator } from 'SpectaclesSyncKit.lspkg/Components/Instantiator';

@component
export class SimpleObjectOptionsExample extends BaseScriptComponent {
  @input
  instantiator: Instantiator;

  @input
  prefab: ObjectPrefab;

  onAwake() {
    this.instantiator.notifyOnReady(() => {
      this.onReady();
    });
  }

  onReady() {
    this.instantiator.instantiate(this.prefab, {
      claimOwnership: true,
      persistence: 'Session',
      localPosition: new vec3(0, 0, -100),
    });
  }
}
