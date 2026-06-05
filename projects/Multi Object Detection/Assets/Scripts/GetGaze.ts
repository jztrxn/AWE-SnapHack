@component
export class GetGaze extends BaseScriptComponent {
  @input()
  deviceTracking: DeviceTracking;

  @input()
  debugIndicator: SceneObject;

  // Public: current gaze screen position (normalized 0..1). Other scripts may read this.
  gazeScreenPos: vec2 = new vec2(0.5, 0.5);

  // Public: last world-space hit point from hitTestWorldMesh (or null if no hit)
  gazeHitPoint: vec3 | null = null;
  // Public flag indicating whether the last update produced a hit
  hasGazeHit: boolean = false;

  // Toggle visual debug (sphere/ray) in the scene
  @input()
  debugVisual: boolean = false;

  // Toggle printed values for gaze hit position and normal
  @input()
  debugPrint: boolean = false;

  //private debugIndicator: SceneObject | null = null;

  /*private findRootObjectByName(name: string): SceneObject | null {
    const count = global.scene.getRootObjectsCount();
    for (let i = 0; i < count; i++) {
      const obj = global.scene.getRootObject(i);
      if (obj && obj.name === name) {
        return obj;
      }
    }
    return null;
  }*/

  onAwake() {
    this.createEvent("OnStartEvent").bind(() => {
      if (!this.deviceTracking) {
        print("Missing DeviceTracking input");
        return;
      }

      this.deviceTracking.requestDeviceTrackingMode(DeviceTrackingMode.World);
      this.deviceTracking.worldOptions.enableWorldMeshesTracking = true;

      // Prepare debug indicator if visual debugging is enabled.
      if (this.debugVisual) {
        //const found = this.findRootObjectByName("Debug Gaze Indicator");
        const found = this.debugIndicator;
        if (found) {
          this.debugIndicator = found;
        } else {
          // Create a placeholder SceneObject which can be given visuals in the editor if desired
          this.debugIndicator = global.scene.createSceneObject("Debug Gaze Indicator");
        }
        if (this.debugIndicator) {
          this.debugIndicator.enabled = this.debugVisual;
        }
      }
    });

    this.createEvent("UpdateEvent").bind(() => {
      if (!this.deviceTracking) {
        return;
      }

      const results = this.deviceTracking.hitTestWorldMesh(this.gazeScreenPos);

      if (results.length > 0) {
        const hit = results[0];
        const p = hit.position;
        const n = hit.normal;

        // publish hit info for other scripts
        this.gazeHitPoint = p;
        this.hasGazeHit = true;

        if (this.debugPrint) {
          print(
            "Gaze hit position: " + p.x.toFixed(3) + ", " + p.y.toFixed(3) + ", " + p.z.toFixed(3)
          );
          print(
            "Hit normal: " + n.x.toFixed(3) + ", " + n.y.toFixed(3) + ", " + n.z.toFixed(3)
          );
        }

        if (this.debugVisual && this.debugIndicator) {
          const t = this.debugIndicator.getTransform();
          // Place the indicator at the hit point
          t.setLocalPosition(p);
          // Try to orient the indicator to face along the hit normal
          try {
            t.setLocalRotation(quat.lookAt(n, vec3.up()));
          } catch (e) {
            // ignore if quat.lookAt isn't available
          }
          this.debugIndicator.enabled = true;
        }
      } else {
        // clear published hit info
        this.gazeHitPoint = null;
        this.hasGazeHit = false;

        if (this.debugVisual && this.debugIndicator) {
          this.debugIndicator.enabled = false;
        }
      }
    });
  }
}