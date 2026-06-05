@component
export class ObjectDetector extends BaseScriptComponent {
  @input()
  mlComponent: MLComponent;


  // Optional DeviceTracking to resolve world hit positions for selected object
  @input()
  deviceTracking: DeviceTracking;

  @input()
  detectionIntervalMs: number = 100; // run every 100ms (~10 FPS)

  @input()
  confidenceThreshold: number = 0.4;

  @input()
  maxGazeRadius: number = 0.15; // normalized screen-space radius for selection

  @input()
  showDebugBBoxes: boolean = false;

  @input()
  enable3DMarker: boolean = true;

  @input()
  classNames: string[] = [];

  // Publicly visible selected detection
  public selectedDetection: {label: string; confidence: number; bbox: vec4} | null = null;

  private lastRunTime: number = 0;
  private markerObject: SceneObject | null = null;

  onAwake() {
    if (!this.mlComponent) {
      print("ObjectDetector: MLComponent not assigned in inspector.");
      return;
    }

    // Create a simple marker SceneObject for selected object (3D sphere or editor-provided mesh can be added manually)
    if (this.enable3DMarker) {
      const found = this.findRootObjectByName("ObjectDetector Marker");
      if (found) {
        this.markerObject = found;
      } else {
        this.markerObject = global.scene.createSceneObject("ObjectDetector Marker");
        // Keep it disabled until a selection exists
        this.markerObject.enabled = false;
      }
    }

    this.createEvent("UpdateEvent").bind(() => this.onUpdate());
  }

  private findRootObjectByName(name: string): SceneObject | null {
    const count = global.scene.getRootObjectsCount();
    for (let i = 0; i < count; i++) {
      const obj = global.scene.getRootObject(i);
      if (obj && obj.name === name) {
        return obj;
      }
    }
    return null;
  }

  private onUpdate(): void {
    const now = Date.now();
    if (now - this.lastRunTime < this.detectionIntervalMs) return;
    this.lastRunTime = now;

    // Run inference
    try {
      this.mlComponent.runImmediate(false);
    } catch (e) {
      // runImmediate may throw if misconfigured
    }

    // Read output binding (try common names)
    const output = this.mlComponent.getOutput("output") || this.mlComponent.getOutput("predictions") || this.mlComponent.getOutput("detections");
    if (!output) {
      if (this.showDebugBBoxes) print("ObjectDetector: MLComponent output not found (check binding name)");
      return;
    }

    const data = output.data as Float32Array;
    if (!data || data.length === 0) return;

    const detections = this.parseDetections(data);
    const filtered = detections.filter(d => d.confidence >= this.confidenceThreshold);

    if (this.showDebugBBoxes) {
      print("Detections (filtered): " + filtered.length);
      for (let i = 0; i < Math.min(filtered.length, 10); i++) {
        const d = filtered[i];
        print(`${d.label} @ ${d.bbox.x.toFixed(2)},${d.bbox.y.toFixed(2)} (${d.confidence.toFixed(2)})`);
      }
    }

    // Select closest bbox to gaze center (0.5,0.5)
    const gaze = new vec2(0.5, 0.5);
    let best: {label: string; confidence: number; bbox: vec4} | null = null;
    let bestDist = Number.POSITIVE_INFINITY;
    for (let i = 0; i < filtered.length; i++) {
      const det = filtered[i];
      // bbox assumed [cx,cy,w,h] normalized
      const cx = det.bbox.x;
      const cy = det.bbox.y;
      const center = new vec2(cx, cy);
      const dist = gaze.distance(center);
      if (dist < bestDist && dist <= this.maxGazeRadius) {
        bestDist = dist;
        best = det;
      } else if (dist === bestDist && best && det.confidence > best.confidence) {
        // tie-breaker: higher confidence
        best = det;
      }
    }

    this.selectedDetection = best;

    // If selected, attempt to get world hit point from DeviceTracking and place marker
    if (this.selectedDetection && this.deviceTracking) {
      const results = this.deviceTracking.hitTestWorldMesh(gaze);
      if (results.length > 0) {
        const hit = results[0];
        if (this.enable3DMarker && this.markerObject) {
          const t = this.markerObject.getTransform();
          t.setLocalPosition(hit.position);
          this.markerObject.enabled = true;
        }
      } else {
        if (this.markerObject) this.markerObject.enabled = false;
      }
    } else {
      if (this.markerObject) this.markerObject.enabled = false;
    }
  }

  // Parse YOLO-style output. Assumes each detection record = [x, y, w, h, conf, class0, class1, ...]
  private parseDetections(data: Float32Array): {label: string; confidence: number; bbox: vec4}[] {
    const results: {label: string; confidence: number; bbox: vec4}[] = [];
    const numClasses = this.classNames ? this.classNames.length : 0;
    const stride = 5 + Math.max(1, numClasses);
    for (let i = 0; i + stride <= data.length; i += stride) {
      const x = data[i];
      const y = data[i + 1];
      const w = data[i + 2];
      const h = data[i + 3];
      const conf = data[i + 4];
      if (conf <= 0) continue;

      // class scores follow
      let classIdx = 0;
      let classScore = 1;
      if (numClasses > 0) {
        classIdx = 0;
        classScore = data[i + 5];
        for (let c = 1; c < numClasses; c++) {
          const s = data[i + 5 + c];
          if (s > classScore) {
            classScore = s;
            classIdx = c;
          }
        }
      }

      const label = this.classNames && this.classNames[classIdx] ? this.classNames[classIdx] : String(classIdx);
      const confidence = conf * classScore;
      results.push({label, confidence, bbox: new vec4(x, y, w, h)});
    }
    return results;
  }
}
