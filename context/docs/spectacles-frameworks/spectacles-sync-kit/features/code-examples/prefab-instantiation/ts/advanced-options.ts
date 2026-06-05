import {
  Instantiator,
  InstantiationOptions,
} from 'SpectaclesSyncKit.lspkg/Components/Instantiator';
import { SessionController } from 'SpectaclesSyncKit.lspkg/Core/SessionController';

@component
export class AdvancedOptionsExample extends BaseScriptComponent {
  @input
  instantiator: Instantiator;

  @input
  prefab: ObjectPrefab;

  private sessionController: SessionController;

  onAwake() {
    this.sessionController = SessionController.getInstance();
    this.instantiator.notifyOnReady(() => {
      this.onReady();
    });
  }

  onReady() {
    const customDataStore = GeneralDataStore.create();
    customDataStore.putString(
      'displayName',
      this.sessionController.getLocalUserName()
    );

    const options = new InstantiationOptions();
    options.claimOwnership = true;
    options.persistence = 'Session';
    options.localPosition = new vec3(0, 0, 0);
    options.localRotation = quat.quatIdentity();
    options.localScale = new vec3(0, 0, 0);
    options.onSuccess = (networkRootInfo) => {
      print('Success!');
    };
    options.onError = (error) => {
      print('Error!');
    };
    options.customDataStore = customDataStore;

    this.instantiator.instantiate(this.prefab, options);
  }
}
