@component
export class GetGaze extends BaseScriptComponent {
    // Optional SceneObject to visualize gaze hits; assign in the editor
    @property({ type: 'SceneObject' })
    debugIndicator: SceneObject = null;

    private screenCenter: vec2 = new vec2(0.5, 0.5);
    private lastHit: any = null;

    onAwake() {
        Diagnostics.log("GetGaze initialized.");
    }

    onUpdate() {
        DeviceTracking.hitTestWorldMesh(this.screenCenter, (hit) => {
            if (!hit) return;
            const p = hit.position;
            const n = hit.normal;
            Diagnostics.log('Gaze hit position: ' + p.x + ', ' + p.y + ', ' + p.z);
            Diagnostics.log('Gaze hit normal: ' + n.x + ', ' + n.y + ', ' + n.z);
            this.lastHit = hit;

            if (this.debugIndicator) {
                this.debugIndicator.getTransform().setWorldPosition(p);
            }

            // Optional global callback other scripts can set
            if (global.getGazeHitCallback && typeof global.getGazeHitCallback === 'function') {
                global.getGazeHitCallback(hit);
            }
        });
    }
}
