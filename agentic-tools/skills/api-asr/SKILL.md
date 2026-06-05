---
name: api-asr
description: Use the ASR (Automatic Speech Recognition) Module for real-time speech-to-text transcription in Spectacles. Supports 40+ languages, mixed language input, and configurable accuracy modes. Load when implementing voice input, speech recognition, or transcription features.
user-invocable: false
paths: "**/*.ts"
---

# ASR Module — Speech-to-Text

**Requirements:** Lens Studio v5.9+, Spectacles OS v5.61+. Device only (not Preview).

Reference: `AI Playground/`, `Agentic Playground/`

---

## Setup

```typescript
private asrModule = require('LensStudio:AsrModule');
```

> `createCameraRequest` and session setup must NOT be called inside `onAwake` — use `OnStartEvent`.

---

## Full Component

```typescript
@component
export class SpeechToText extends BaseScriptComponent {
  @ui.label('<span style="color: #60A5FA;">SpeechToText – Real-time speech transcription</span>')
  @ui.separator

  @input
  @hint("Silence duration in ms before finalizing a phrase")
  silenceUntilTerminationMs: number = 1000

  @input
  @hint("ASR accuracy mode: HighAccuracy, Balanced, or HighSpeed")
  mode: string = "HighAccuracy"

  @input
  @hint("Enable logging")
  enableLogging: boolean = false

  // Fired each time text is updated; isFinal=true means phrase is complete
  public onTranscription: Event<{text: string; isFinal: boolean}> =
    new Event<{text: string; isFinal: boolean}>()

  private asrModule = require('LensStudio:AsrModule')
  private logger: Logger

  onAwake(): void {
    this.logger = new Logger("SpeechToText", this.enableLogging, false)
    this.createEvent('OnStartEvent').bind(() => this.startSession())
    this.createEvent('OnDestroyEvent').bind(() => this.stopSession())
  }

  private startSession(): void {
    const options = AsrModule.AsrTranscriptionOptions.create()
    options.silenceUntilTerminationMs = this.silenceUntilTerminationMs
    options.mode = AsrModule.AsrMode.HighAccuracy  // or Balanced / HighSpeed

    options.onTranscriptionUpdateEvent.add((e: AsrModule.TranscriptionUpdateEvent) => {
      this.logger.info(`ASR: "${e.text}" (final=${e.isFinal})`)
      this.onTranscription.invoke({text: e.text, isFinal: e.isFinal})
    })

    options.onTranscriptionErrorEvent.add((code: AsrModule.AsrStatusCode) => {
      switch (code) {
        case AsrModule.AsrStatusCode.InternalError:
          this.logger.error("ASR: Internal error"); break
        case AsrModule.AsrStatusCode.Unauthenticated:
          this.logger.error("ASR: Unauthenticated"); break
        case AsrModule.AsrStatusCode.NoInternet:
          this.logger.error("ASR: No internet"); break
      }
    })

    this.asrModule.startTranscribing(options)
    this.logger.info("ASR session started")
  }

  public async stopSession(): Promise<void> {
    await this.asrModule.stopTranscribing()
    this.logger.info("ASR session stopped")
  }
}
```

---

## Key API

| Method / Property | Description |
|---|---|
| `AsrModule.AsrTranscriptionOptions.create()` | Creates options object |
| `options.mode` | `HighAccuracy` / `Balanced` / `HighSpeed` |
| `options.silenceUntilTerminationMs` | ms of silence before phrase is finalized |
| `options.onTranscriptionUpdateEvent` | Event: `TranscriptionUpdateEvent` (`text: string`, `isFinal: boolean`) |
| `options.onTranscriptionErrorEvent` | Event: `AsrStatusCode` |
| `asrModule.startTranscribing(options)` | Start listening |
| `asrModule.stopTranscribing()` | Stop — returns `Promise<void>`, use `await` |

## ASR Status Codes

| Code | Meaning |
|---|---|
| `AsrModule.AsrStatusCode.Success` | Transcription completed successfully |
| `AsrModule.AsrStatusCode.InternalError` | Internal ASR error |
| `AsrModule.AsrStatusCode.Unauthenticated` | Authentication failure |
| `AsrModule.AsrStatusCode.NoInternet` | No internet connection |

## `isFinal` Behavior

- `isFinal: false` — live partial transcript, updates frequently
- `isFinal: true` — phrase complete (silence detected), new phrase begins automatically

## ASR + AI Pattern

Use ASR to capture user voice → send final transcript to Gemini/OpenAI:

```typescript
this.speechToText.onTranscription.add(({text, isFinal}) => {
  if (isFinal && text.trim().length > 0) {
    this.geminiAssistant.sendText(text)
  }
})
```

## Notes

- Internet required (streaming transcription)
- Accessing ASR disables camera frame access (use Extended Permissions for both)
- Mixed languages handled automatically
- Heading accuracy improves as the session runs
