---
name: snap-ml
description: Integrate machine learning models with SnapML in Spectacles — object detection, image classification, segmentation, custom ML models, and real-time inference on camera frames. Load when implementing ML/AI vision or model inference features.
user-invocable: false
---

# SnapML Integration Guide

Reference implementations: `SnapML Starter/`, `SnapML Chess Hints/`, `SnapML Pool/`

---

## Core Concepts

SnapML runs ML models on-device in Lens Studio. You provide a trained model (`.onnx` or similar), configure input/output tensors, and bind to camera frames.

---

## Basic SnapML Component Setup

```typescript
import {Logger} from "Utilities.lspkg/Scripts/Utils/Logger"

@component
export class MLInferenceController extends BaseScriptComponent {
  @ui.label('<span style="color: #60A5FA;">MLInferenceController – Runs ML model on camera frames</span>')
  @ui.separator

  @input
  @hint("The MLComponent configured with your model")
  private mlComponent: MLComponent

  @input
  @hint("Camera texture to run inference on")
  private cameraTexture: Texture

  @input
  @hint("Enable detection logging")
  enableLogging: boolean = false

  private logger: Logger

  onAwake(): void {
    this.logger = new Logger("MLInferenceController", this.enableLogging, false)
    this.setupML()
  }

  private setupML(): void {
    if (!this.mlComponent) {
      this.logger.error("MLComponent not assigned!")
      return
    }

    // Set input texture
    const inputTexture = this.mlComponent.getInput("input")
    inputTexture.texture = this.cameraTexture

    // Bind to run every frame
    this.createEvent("UpdateEvent").bind(() => {
      this.runInference()
    })
  }

  private runInference(): void {
    // Trigger inference
    this.mlComponent.runImmediate(false)

    // Read output tensor
    const outputData = this.mlComponent.getOutput("output")
    if (outputData) {
      this.processOutput(outputData.data as Float32Array)
    }
  }

  private processOutput(data: Float32Array): void {
    // Process model output — varies by model
    this.logger.debug("Model output: " + data.length + " values")
  }
}
```

---

## Object Detection (YOLO-style — SnapML Pool/Chess)

```typescript
@component
export class ObjectDetector extends BaseScriptComponent {
  @input
  @hint("MLComponent with detection model")
  private mlComponent: MLComponent

  @input
  @hint("Confidence threshold (0-1)")
  confidenceThreshold: number = 0.5

  @input
  @hint("Class names matching model output indices")
  classNames: string[] = []

  public onDetection: Event<{label: string; confidence: number; bbox: vec4}[]> =
    new Event<{label: string; confidence: number; bbox: vec4}[]>()

  private runDetection(): void {
    this.mlComponent.runImmediate(false)

    const output = this.mlComponent.getOutput("output")
    if (!output) return

    const data = output.data as Float32Array
    const detections = this.parseDetections(data)
    const filtered = detections.filter(d => d.confidence >= this.confidenceThreshold)

    if (filtered.length > 0) {
      this.onDetection.invoke(filtered)
    }
  }

  private parseDetections(data: Float32Array): {label: string; confidence: number; bbox: vec4}[] {
    // Decode YOLOv7-style output: [x, y, w, h, conf, class0, class1, ...]
    const results = []
    const stride = 5 + this.classNames.length
    for (let i = 0; i < data.length; i += stride) {
      const conf = data[i + 4]
      if (conf < this.confidenceThreshold) continue
      const classScores = data.slice(i + 5, i + stride)
      let maxIdx = 0
      let maxScore = classScores[0]
      for (let j = 1; j < classScores.length; j++) {
        if (classScores[j] > maxScore) {
          maxScore = classScores[j]
          maxIdx = j
        }
      }
      results.push({
        label: this.classNames[maxIdx] || String(maxIdx),
        confidence: conf * maxScore,
        bbox: new vec4(data[i], data[i + 1], data[i + 2], data[i + 3])
      })
    }
    return results
  }
}
```

---

## MLComponent Input/Output Bindings

```typescript
// Bind camera texture as input
const inputBinding = this.mlComponent.getInput("input_image")
inputBinding.texture = this.cameraTexture

// Read float array output
const outputBinding = this.mlComponent.getOutput("predictions")
const floatData: Float32Array = outputBinding.data as Float32Array

// Read 2D tensor (e.g., keypoints: [N, 2])
const keypointOutput = this.mlComponent.getOutput("keypoints")
const shape = keypointOutput.shape  // [N, 2]
const keypoints: Float32Array = keypointOutput.data as Float32Array
```

---

## Depth Estimation (Spatial Image / Depth Cache)

```typescript
import {DepthTextureProvider} from "SpectaclesDepthKit.lspkg/DepthTextureProvider"

@component
export class DepthAnalyzer extends BaseScriptComponent {
  @input
  @hint("Depth texture from the device depth sensor")
  depthTexture: Texture

  // Sample depth at a screen-space UV point (0-1 range)
  public getDepthAt(uv: vec2): number {
    // Access depth from texture via ML model output or device API
    // See Depth Cache template for full implementation
    return 0
  }
}
```

---

## Chess Hints Pattern (SnapML + AI)

The Chess Hints template combines SnapML (piece detection) with AI (move suggestions):

1. **SnapML** detects chess pieces on board → outputs bounding boxes + labels
2. **Board state** is inferred from detection positions
3. **AI (Gemini/OpenAI)** receives board state as text → returns best move
4. **Overlay** renders the suggestion on the board

```typescript
// Pipeline: camera → MLComponent → detectPieces() → boardStateToFEN() → sendToAI()
private async analyzeBoardAndSuggestMove(): Promise<void> {
  const pieces = this.detectPieces()
  const fenString = this.boardStateToFEN(pieces)
  const suggestion = await this.askAIForMove(fenString)
  this.displayMoveSuggestion(suggestion)
}
```

---

## Key Notes

- **Models must be imported** into Lens Studio as ML assets before referencing in MLComponent
- **Input resolution** matters — scale camera texture to match model's expected input size
- **`runImmediate(false)`** = synchronous inference on current frame; `runImmediate(true)` = async
- **Output tensor shapes** depend entirely on the model — check model documentation
- **Performance**: run inference every N frames rather than every frame for complex models:
  ```typescript
  private frameCount = 0
  private runEveryNFrames = 3

  private onUpdate(): void {
    this.frameCount++
    if (this.frameCount % this.runEveryNFrames === 0) {
      this.runInference()
    }
  }
  ```
- See `SnapML Pool/Assets/Scripts/` and `SnapML Chess Hints/Assets/Scripts/` for full working examples
