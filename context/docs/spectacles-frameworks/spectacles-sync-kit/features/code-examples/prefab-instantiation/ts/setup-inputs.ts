import { Instantiator } from 'SpectaclesSyncKit.lspkg/Components/Instantiator';

@component
export class SetupInputsExample extends BaseScriptComponent {
  @input()
  instantiator: Instantiator;

  @input()
  prefab: ObjectPrefab;
}
