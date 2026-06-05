declare function require(name: string): any;

@component
export class GazeSelector extends BaseScriptComponent {

  // Script component that exposes onDetectionsUpdated (MLController script)
  @input()
  mlController: ScriptComponent;

  // Reference to the GetGaze script component instance in the scene
  @input()
  getGazeScript: ScriptComponent;

  // Optional SceneObject with ScreenTransform to be used as a highlight overlay.
  // The script will set its ScreenTransform.anchors to detection.getScreenRect().
  @input()
  highlightObject: SceneObject;

  // Throttle selection updates (Hz)
  @input()
  selectionRate: number = 30;

  // Screen-space squared distance EPS for tie-breaking (units: normalized screen coords squared)
  @input()
  epsilonSquared: number = 0.0004; // ~0.02^2

  // How long (ms) the same detection must be highlighted to confirm selection
  @input()
  holdMs: number = 5000;

  // Whether to print debug info
  @input()
  debugPrint: boolean = false;

  // Reference to the RemoteLookup ScriptComponent (handles RSG/Gemini calls)
  @input()
  remoteLookupScript: ScriptComponent;
  private detections = null;
  private lastSelection: any = null;
  // stable key for last confirmed selection (index or label+center)
  private lastSelectionKey: string | null = null;
  // current candidate under gaze (may be settling)
  private currentCandidateKey: string | null = null;
  private selectionSettleStart: number | null = null;

  private lastUpdateTime = 0;
  private touchStartTime = 0;
  // last confirmed selection (exposed to other scripts)
  lastConfirmed: any = null;

  // hold tracking
  private selectedStartTime: number | null = null;
  private lastProgressTick: number = 0;
  // guard so we only call lookup once per confirmed key
  private pendingLookup: boolean = false;
  private lastLookupKey: string | null = null;
  // settle time before starting hold (ms)
  @input()
  settleMs: number = 200;

  onAwake() {
    const ml = this.mlController as any;
    if (!ml || !ml.onDetectionsUpdated) {
      print("GazeSelector: please set ML Controller script component (with onDetectionsUpdated)");
    } else {
      // subscribe to detections
      ml.onDetectionsUpdated.add((detections: any) => {
        this.detections = detections;
      });
    }

    // Update loop -- throttle using selectionRate
    this.createEvent("UpdateEvent").bind(() => {
      const now = Date.now();
      const minInterval = 1000 / Math.max(1, this.selectionRate);
      if (now - this.lastUpdateTime < minInterval) {
        return;
      }
      this.lastUpdateTime = now;
      this.updateSelection();
    });

    // Remove old touch-confirm behavior; prolonged gaze will handle confirmation.
    // Keep touch handlers no-op so touches don't interfere with hold logic.
    this.createEvent("TouchStartEvent").bind(() => {
      // noop
    });
    this.createEvent("TouchEndEvent").bind(() => {
      // noop
    });
  }

  updateSelection() {
    if (!this.detections || this.detections.length === 0) {
      this.clearHighlight();
      this.lastSelection = null;
      return;
    }

    // read gaze screen position from GetGaze script; fallback to center
    let gazeScreen = new vec2(0.5, 0.5);
    try {
      const gazeScript = this.getGazeScript as any;
      if (gazeScript && gazeScript.gazeScreenPos) {
        gazeScreen = gazeScript.gazeScreenPos;
      }
    } catch (e) {
      // ignore and use center
    }

    let best = null;
    let bestDist = Number.POSITIVE_INFINITY;
    let bestScore = -1;

    for (let i = 0; i < this.detections.length; i++) {
      const det = this.detections[i];
      // DetectionHelpers.Detection provides getScreenPos()
      let pos = null;
      try {
        pos = det.getScreenPos();
      } catch (e) {
        // fallback: if det.bbox exists, compute center
        if (det.bbox && det.bbox.length >= 4) {
          pos = new vec2(det.bbox[0], det.bbox[1]);
        } else {
          continue;
        }
      }
      const dx = gazeScreen.x - pos.x;
      const dy = gazeScreen.y - pos.y;
      const distSq = dx * dx + dy * dy;

      if (distSq < bestDist - this.epsilonSquared) {
        best = det;
        bestDist = distSq;
        bestScore = det.score || 0;
      } else if (Math.abs(distSq - bestDist) <= this.epsilonSquared) {
        // tie-break by higher score
        const s = det.score || 0;
        if (s > bestScore) {
          best = det;
          bestDist = distSq;
          bestScore = s;
        }
      }
    }

    if (best) {
      const key = this.getDetectionKey(best);
      // update current candidate
      if (this.currentCandidateKey !== key) {
        this.currentCandidateKey = key;
        this.selectionSettleStart = Date.now();
        // don't start hold timer yet - wait for settleMs
        this.selectedStartTime = null;
        this.lastProgressTick = 0;
        // apply visual candidate highlight immediately
        this.applyHighlight(best);
        if (this.debugPrint) {
          const label = best.label ? best.label : ("class_" + best.index);
          print("GazeSelector: candidate -> " + label + " (score=" + (best.score || 0).toFixed(2) + ")");
        }
        // clear pending lookup if we're on a new key
        if (this.lastLookupKey !== key) {
          this.pendingLookup = false;
        }
      } else {
        // candidate is same as previous frame
        const now = Date.now();
        // if still settling, check settleMs
        if (this.selectionSettleStart != null) {
          if (now - this.selectionSettleStart >= this.settleMs) {
            // settle complete -> promote to confirmed selection and start hold timer
            if (this.lastSelectionKey !== key) {
              this.lastSelection = best;
              this.lastSelectionKey = key;
              this.selectedStartTime = Date.now();
              if (this.debugPrint) {
                const label = best.label ? best.label : ("class_" + best.index);
                print("GazeSelector: selected -> " + label + " (score=" + (best.score || 0).toFixed(2) + ")");
              }
            }
            this.selectionSettleStart = null;
          } else {
            // still settling; optionally print progress
            if (this.debugPrint) {
              const s = ((now - this.selectionSettleStart) / 1000.0).toFixed(2);
              // print once at start
              if (this.lastProgressTick === 0) {
                const label = best.label ? best.label : ("class_" + best.index);
                print("GazeSelector: settling on " + label + " " + s + "s / " + (this.settleMs / 1000.0).toFixed(2) + "s");
                this.lastProgressTick = 1;
              }
            }
          }
        } else if (this.lastSelectionKey === key) {
          // already confirmed selection; advance hold timer
          if (this.selectedStartTime != null) {
            const held = now - this.selectedStartTime;
            const heldSec = held / 1000.0;
            const tick = Math.floor(held / 500);
            if (this.debugPrint && tick !== this.lastProgressTick) {
              this.lastProgressTick = tick;
              print(
                "GazeSelector: holding " + (best.label ? best.label : ("class_" + best.index)) + " " + heldSec.toFixed(2) + "s / " + (this.holdMs / 1000.0).toFixed(1) + "s"
              );
            }

            if (held >= this.holdMs) {
              // confirm selection once — only if we haven't already performed a lookup for this key
              if (!this.pendingLookup && this.lastLookupKey !== key) {
                this.pendingLookup = true;
                this.confirmSelection();
              }
            }
          }
        }
      }
    } else {
      this.clearHighlight();
      this.lastSelection = null;
      this.lastSelectionKey = null;
      this.currentCandidateKey = null;
      this.selectionSettleStart = null;
      this.selectedStartTime = null;
      this.lastProgressTick = 0;
    }
  }

  getDetectionKey(detection) {
    // Prefer stable index if available
    if (detection && (detection.index !== undefined && detection.index !== null)) {
      return 'idx:' + detection.index;
    }
    // Fallback to label + bbox center
    let label = detection && detection.label ? detection.label : 'class';
    let center = '';
    if (detection && detection.bbox && detection.bbox.length >= 4) {
      center = ':' + detection.bbox[0].toFixed(3) + ',' + detection.bbox[1].toFixed(3) + ',' + detection.bbox[2].toFixed(3) + ',' + detection.bbox[3].toFixed(3);
    }
    return label + center;
  }

  applyHighlight(detection) {
    if (!this.highlightObject) {
      return;
    }
    const st = this.highlightObject.getComponent("ScreenTransform");
    if (!st) {
      return;
    }
    try {
      const rect = detection.getScreenRect();
      st.anchors = rect;
      this.highlightObject.enabled = true;
    } catch (e) {
      // ignore
    }
  }

  clearHighlight() {
    if (this.highlightObject) {
      this.highlightObject.enabled = false;
    }
  }

  confirmSelection() {
    if (!this.lastSelection) {
      this.pendingLookup = false;
      return;
    }
    const label = this.lastSelection.label ? this.lastSelection.label : ("class_" + this.lastSelection.index);
    print("GazeSelector: " + label + " chosen");

    // expose confirmed selection
    this.lastConfirmed = this.lastSelection;
    // remember the confirmed selection key so we don't repeat lookups for the same object
    this.lastLookupKey = this.lastSelectionKey;

    // call remote lookup via the assigned RemoteLookup ScriptComponent
    const rl = this.remoteLookupScript as any;
    if (!rl || typeof rl.lookup !== 'function') {
      print("RemoteLookup: no RemoteLookup script assigned or lookup() not found");
      this.pendingLookup = false;
      return;
    }

    // call but don't await here to avoid blocking update loop
    rl.lookup(label, this.lastSelection)
      .then((res: any) => {
        print("RemoteLookup: success for '" + label + "' -> " + JSON.stringify(res));
      })
      .catch((err: any) => {
        print("RemoteLookup: error for '" + label + "' -> " + (err && err.message ? err.message : JSON.stringify(err)));
      })
      .finally(() => {
        // allow future lookups only if selection changes
        this.pendingLookup = false;
      });
  }
}
