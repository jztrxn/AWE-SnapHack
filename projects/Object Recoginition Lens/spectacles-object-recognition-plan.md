# Spectacles Object Recognition App — Project Plan
**Platform:** Snap Spectacles (2024) | **IDE:** Lens Studio | **Language:** TypeScript/JavaScript

---

## Project Overview

An AR lens for Snap Spectacles that lets the user look at (or point at) a real-world object, see it highlighted with a segmentation outline, confirm the selection, and receive AI-generated information (e.g., a Wikipedia-style summary) displayed in a world-locked UI panel.

---

## Core Experience Loop

```
1. DETECT     → Identify what the user is looking at (gaze or hand point)
2. HIGHLIGHT  → Segment & outline the object on screen
3. CONFIRM    → User gesture/dwell confirms the selection
4. LOOKUP     → AI vision API returns object info
5. DISPLAY    → World-locked info panel shown next to the object
```

---

## Build Order (Incremental Steps)

The project is built in five stages. Each stage should be verified in isolation (console logs) before connecting to the next.

---

## Stage 1: Object Detection

**Goal:** Determine what the user is looking at and classify it.

### 1A — Gaze Direction (Head Tracking Ray)

The Spectacles headset has no eye-tracking. Gaze = head/camera forward direction.

**Component chain:**
- Camera Scene Object → add `DeviceTracking` component → set mode to **World Tracking**
- Call `hitTestWorldMesh(vec2(0.5, 0.5), callback)` every frame to get the 3D world-space point the user is looking at
  - `vec2(0.5, 0.5)` = dead center of the screen = gaze center
  - The hit test uses the depth texture + World Mesh to return `hit.position` (vec3) and `hit.normal`
- `transform.forward` on the camera's SceneObject gives the raw gaze direction vector if needed for manual raycasting

**Key API:** `DeviceTracking.hitTestWorldMesh(screenPos: vec2, callback: (hit) => void)`

**Verify step:** Log `hit.position` each frame and confirm it changes as the head moves.

---

### 1B — Hand Pointing (Finger Ray)

Used as an alternative or secondary confirmation method.

**Component chain:**
- Add `HandTracking` component to a Scene Object
- Get index finger tip and base world positions each frame:
  - `handTracker.getIndexTip().getWorldPosition()`
  - `handTracker.getIndexBase().getWorldPosition()`
- Build a ray: `direction = (tipPos - basePos).normalize()`
- Cast via `Physics.createRayCastQuery()` along that direction from the tip
- The hit result gives the 3D world position the finger is pointing at

**Key API:** `Physics.rayCast(origin: vec3, end: vec3, callback)`

**Verify step:** Log finger-ray hit position and confirm it tracks with the pointing gesture.

---

### 1C — Object Classification (SnapML, Full-Frame YOLO)

**How it works (important conceptual note):**

YOLO-style object detection models take the **full camera frame** as input and output bounding boxes + class labels for every detected object in a single forward pass. The model internally divides the image into a grid and predicts regions simultaneously — you do not need to crop or pre-select a region. The model tells you *where* things are and *what* they are in one step.

```
Input:  Full Device Camera Texture (640×640)
Output: [{ class: "coffee mug", confidence: 0.94, bbox: [cx, cy, w, h] }, ...]
        bbox coordinates are normalized (0.0–1.0) in screen space
```

**Setup:**
1. Export `yolov8n.onnx` from Ultralytics (pretrained, 80 COCO classes, small file size)
2. Import `.onnx` into Lens Studio Asset Browser
3. Add `ML Component` to a Scene Object
4. Set input: `Device Camera Texture` (either left or right Spectacles camera)
5. Set output: parse the bounding box tensor in a script

**Verify step:** Log detected class names and bbox coordinates to console each frame.

---

### 1D — Gaze-to-Object Mapping (Connecting 1A + 1C)

**Goal:** From the list of YOLO bounding boxes, determine which object the user is currently looking at.

**Logic:**
```typescript
// Screen center = gaze point
const gazeScreenPos = new vec2(0.5, 0.5);

// Find the bbox whose center is closest to gaze screen position
let closestObj = null;
let minDist = Infinity;
for (const detection of yoloOutputs) {
    const bboxCenter = new vec2(detection.cx, detection.cy); // normalized coords
    const dist = gazeScreenPos.distance(bboxCenter);
    if (dist < minDist) {
        minDist = dist;
        closestObj = detection;
    }
}
// closestObj is what the user is looking at
```

Combine with the 3D world position from `hitTestWorldMesh` to get:
- `closestObj.class` — the object label (e.g., "chair")
- `worldHitPoint` — the 3D position in space for AR overlay placement

---

### 1E — Crop Texture (Optional, Stage 2+ Only)

The `ScreenCropTexture` is **not needed in Stage 1**. It is a second-stage tool used when:
- A coarse detector (YOLO or tracker) has already found a bounding box
- A fine-grained classifier needs a tightly-cropped, zoomed-in image of just that region
- Example use case: YOLO detects "bird" → crop to bird bbox → classifier identifies species

For the initial build, the full-frame YOLO output (class name + confidence) is sufficient to pass to the AI lookup stage.

---

## Stage 2: Segmentation & Outline Highlight

**Goal:** Draw a visual outline around the detected object to indicate it is selected.

**Component chain:**
- Use Lens Studio's **Custom Segmentation** template (available in Asset Library)
- Import a segmentation ONNX model (e.g., COCO-trained segmentation from Roboflow)
- The model outputs a **Proxy Texture** (pixel-level mask of the detected object)
- Apply an **EdgeDetect Post Effect** using the segmentation mask as input texture
- Result: a clean silhouette stroke drawn around the object in screen space

**Performance tip:** Use `ScreenCropTexture` scoped to the YOLO bounding box from Stage 1 as the segmentation model input — this reduces compute by only segmenting the region of interest, not the full frame.

**Visual state:**
- Idle: no outline
- Gazing at object: animated outline (pulse or glow)
- Confirmed: outline flashes, freezes

---

## Stage 3: User Confirmation

**Goal:** Let the user explicitly confirm the highlighted object before triggering the AI call.

Two methods (implement both, use whichever fires first):

### Dwell Timer
```typescript
// Accumulate gaze-on-object time
if (gazeIsOnObject) {
    dwellTimer += getDeltaTime();
    if (dwellTimer >= 1.5) triggerConfirm(); // 1.5 second dwell
} else {
    dwellTimer = 0;
}
```

### Hand Pinch Gesture
- Detect pinch via HandTracking component (thumb + index finger proximity)
- If pinch occurs while an object is highlighted → `triggerConfirm()`

**On confirm:**
1. Flash the outline (animate material opacity/color)
2. Capture a still frame of the camera texture (or use the current frame)
3. Freeze the `closestObj.class` label
4. Pass both to Stage 4

---

## Stage 4: AI Information Lookup

**Goal:** Send the confirmed object's class name (and optionally a camera frame) to an AI API and retrieve a summary.

**Available APIs on Spectacles (native support as of June 2025 OS update):**
- OpenAI GPT-4o Vision
- Google Gemini
- DeepSeek

**Recommended approach — use `RemoteServiceGateway`:**

```typescript
const request = RemoteServiceModule.makeRequest();
request.url = "https://api.openai.com/v1/chat/completions";
request.method = "POST";
request.setHeader("Authorization", "Bearer YOUR_API_KEY");
request.setHeader("Content-Type", "application/json");
request.body = JSON.stringify({
    model: "gpt-4o",
    messages: [{
        role: "user",
        content: [
            {
                type: "text",
                text: `I'm looking at a ${objectClass}. Give me a concise Wikipedia-style summary in 3-4 sentences.`
            },
            {
                type: "image_url",
                image_url: { url: `data:image/jpeg;base64,${capturedFrameBase64}` }
            }
        ]
    }]
});
request.onSuccess = (response) => {
    const summary = JSON.parse(response.body).choices[0].message.content;
    displayInfoPanel(summary);
};
RemoteServiceModule.performRequest(request);
```

**Alternatively — HuggingFace Inference Endpoint:**
- Host any HuggingFace model (e.g., `facebook/detr-resnet-50`) via HuggingFace Inference Endpoints or a FastAPI wrapper on Render/Railway
- Call it via `InternetModule` fetch with the same pattern
- Trade-off: more latency, but allows custom/open-source models

**Key APIs:**
- `RemoteServiceGateway` — preconfigured connectors for OpenAI/Gemini (recommended)
- `InternetModule` — raw HTTP fetch for custom endpoints

---

## Stage 5: Info Display

**Goal:** Show the AI-returned summary as a world-locked UI panel next to the object.

**Component chain:**
- Create a Screen Transform UI panel with a `Text` component
- Set the panel's world position to `worldHitPoint` (from Stage 1's `hitTestWorldMesh` result)
- Offset slightly along the hit normal so it floats in front of the surface
- Populate the Text component with the AI summary string
- Add a dismiss gesture (pinch again, or dwell on a close button) to hide the panel

**Panel states:** Hidden → Loading (spinner) → Populated → Dismissed

---

## Technology Reference

| Stage | Lens Studio Tool | Notes |
|---|---|---|
| Gaze detection | `DeviceTracking` + `hitTestWorldMesh` | Wearable-only API; uses depth + World Mesh |
| Hand pointing | `HandTracking` + `Physics.rayCast` | Native Spectacles hand tracking |
| Object detection | `ML Component` + YOLOv8n ONNX | Full-frame input; outputs bbox + class |
| Segmentation/outline | Custom Segmentation template + EdgeDetect Post Effect | COCO segmentation ONNX via Roboflow |
| Confirmation | Dwell timer + Hand Pinch gesture | HandTracking pinch detection |
| AI lookup | `RemoteServiceGateway` (OpenAI/Gemini) | Native Spectacles June 2025 OS feature |
| Info display | Screen Transform + Text component | World-locked panel at hit point |

---

## Key Conceptual Notes for a New Agent

1. **Gaze = camera forward, not eye tracking.** The Spectacles 2024 headset does not have per-eye gaze tracking. Head orientation IS gaze. Screen center `vec2(0.5, 0.5)` always represents gaze.

2. **YOLO is full-frame by design.** Do not pre-crop before passing to the YOLO detection model. It finds all objects in the frame at once and returns their bounding box coordinates. Cropping comes AFTER detection, only if a second-stage classifier is needed.

3. **Two coordinate spaces to reconcile:**
   - YOLO outputs **screen space** bbox (normalized 0–1 x/y)
   - `hitTestWorldMesh` outputs **world space** vec3 position
   - Both are needed: screen space to identify WHICH object, world space to place AR overlays

4. **SnapML model format:** Must be `.onnx`. Export from PyTorch/Ultralytics or source from Roboflow. Lens Studio will not accept `.pt`, `.pb`, or `.tflite` formats directly.

5. **Network calls require `RemoteServiceGateway` or `InternetModule`.** Standard browser `fetch` is not available. All external API calls go through Lens Studio's networking modules.

6. **No localStorage.** Spectacles Lenses run in a sandboxed environment. Use in-memory variables for all state — do not attempt to persist data across sessions via storage APIs.

---

## Reference Resources

- Snap Spectacles Sample Repo (AI Assistant + SnapML examples): https://github.com/snapchat/Spectacles-Sample
- SnapML on Spectacles docs: https://developers.snap.com/spectacles/about-spectacles-features/snapML
- Custom Segmentation template: https://developers.snap.com/lens-studio/features/snap-ml/snap-ml-templates/custom-segmentation
- Object Detection template: https://developers.snap.com/lens-studio/features/snap-ml/snap-ml-templates/object-detection
- RemoteServiceGateway (OpenAI/Gemini): https://developers.snap.com/spectacles/about-spectacles-features/apis/remoteservice-gateway
- Internet Access / Fetch API: https://developers.snap.com/spectacles/about-spectacles-features/apis/internet-access
- World Hit Test: https://developers.snap.com/lens-studio/features/ar-tracking/world/world-templates/instant-world-hit-test
- Physics Raycast: https://developers.snap.com/lens-studio/features/physics/raycast
