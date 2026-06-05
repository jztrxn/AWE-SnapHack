---
name: ai-remote-service
description: Integrate AI APIs (Gemini Live, OpenAI Realtime, DALL-E, Snap3D) using the Remote Service Gateway (RSG) package in Spectacles. Load when implementing AI chat, voice, vision, image generation, or function calling features.
user-invocable: false
---

# AI Integration via Remote Service Gateway (RSG)

Reference implementations: `AI Playground/`, `AI Music Gen/`, `Agentic Playground/`, `Crop/`, `Depth Cache/`

Package path: `RemoteServiceGateway.lspkg/`

---

## Gemini Live (WebSocket — voice + vision)

```typescript
import {Gemini, GeminiLiveWebsocket} from "RemoteServiceGateway.lspkg/HostedExternal/Gemini"
import {GeminiTypes} from "RemoteServiceGateway.lspkg/HostedExternal/GeminiTypes"
import {AudioProcessor} from "RemoteServiceGateway.lspkg/Helpers/AudioProcessor"
import {DynamicAudioOutput} from "RemoteServiceGateway.lspkg/Helpers/DynamicAudioOutput"
import {MicrophoneRecorder} from "RemoteServiceGateway.lspkg/Helpers/MicrophoneRecorder"
import {VideoController} from "RemoteServiceGateway.lspkg/Helpers/VideoController"

private GeminiLive: GeminiLiveWebsocket
private audioProcessor: AudioProcessor = new AudioProcessor()
private microphoneRecorder: MicrophoneRecorder
private dynamicAudioOutput: DynamicAudioOutput
private videoController: VideoController

// Connect
private createSession(): void {
  this.GeminiLive = Gemini.liveConnect()

  this.GeminiLive.onOpen.add(() => {
    this.logger.info("Gemini connected")
    this.sendSetup()
  })

  this.GeminiLive.onMessage.add((message) => {
    // Audio response
    if (message.serverContent?.modelTurn?.parts) {
      for (const part of message.serverContent.modelTurn.parts) {
        if (part.inlineData?.mimeType?.startsWith("audio/")) {
          const audioData = Base64.decode(part.inlineData.data)
          this.dynamicAudioOutput.addAudioFrame(audioData)
        }
        if (part.text) {
          this.onTextReceived.invoke({text: part.text, completed: false})
        }
      }
    }
    // Turn complete
    if (message.serverContent?.turnComplete) {
      this.onTextReceived.invoke({text: "", completed: true})
    }
    // Function calls
    if (message.toolCall) {
      for (const fc of message.toolCall.functionCalls) {
        this.onFunctionCall.invoke({name: fc.name, args: fc.args})
      }
    }
  })

  this.GeminiLive.onError.add((event) => {
    this.logger.error("Gemini error: " + event)
  })

  this.GeminiLive.onClose.add((event) => {
    this.logger.info("Gemini closed: " + event.reason)
  })
}

// Session setup (system prompt, tools, audio config)
private sendSetup(): void {
  const setup = {
    setup: {
      model: "models/gemini-2.0-flash-live-001",
      generation_config: {
        response_modalities: ["AUDIO"],
        speech_config: {voice_config: {prebuilt_voice_config: {voice_name: "Aoede"}}}
      },
      system_instruction: {parts: [{text: "You are a helpful AR assistant."}]},
      tools: [{function_declarations: this.getFunctionDeclarations()}]
    }
  } as GeminiTypes.Live.Setup
  this.GeminiLive.send(setup)
}

// Send audio chunk from microphone
private setupMicrophone(): void {
  this.microphoneRecorder.setSampleRate(16000)
  this.audioProcessor.onAudioChunkReady.add((encodedChunk) => {
    const msg = {
      realtime_input: {
        media_chunks: [{mime_type: "audio/pcm", data: encodedChunk}]
      }
    } as GeminiTypes.Live.RealtimeInput
    this.GeminiLive.send(msg)
  })
}

// Send video frame
private setupVideo(): void {
  this.videoController = new VideoController(1500, CompressionQuality.HighQuality, EncodingType.Jpg)
  this.videoController.onFrameReady.add((encodedFrame) => {
    const msg = {
      realtime_input: {
        media_chunks: [{mime_type: "image/jpeg", data: encodedFrame}]
      }
    } as GeminiTypes.Live.RealtimeInput
    this.GeminiLive.send(msg)
  })
}

// Send function call response back to Gemini
public sendFunctionResponse(name: string, response: object): void {
  const msg = {
    tool_response: {
      function_responses: [{name, response: {content: JSON.stringify(response)}}]
    }
  } as GeminiTypes.Live.ToolResponse
  this.GeminiLive.send(msg)
}

// Send text message
public sendText(text: string): void {
  const msg = {
    client_content: {
      turns: [{role: "user", parts: [{text}]}],
      turn_complete: true
    }
  } as GeminiTypes.Live.ClientContent
  this.GeminiLive.send(msg)
}
```

---

## OpenAI Realtime (WebSocket — voice + function calling)

```typescript
import {OpenAI, OpenAIRealtimeWebsocket} from "RemoteServiceGateway.lspkg/HostedExternal/OpenAI"
import {OpenAITypes} from "RemoteServiceGateway.lspkg/HostedExternal/OpenAITypes"

private OAIRealtime: OpenAIRealtimeWebsocket

private createSession(): void {
  this.OAIRealtime = OpenAI.createRealtimeSession({
    model: "gpt-4o-mini-realtime-preview"
  })

  this.OAIRealtime.onOpen.add(() => {
    this.logger.info("OpenAI connected")
    this.sendSessionUpdate()
  })

  this.OAIRealtime.onMessage.add((message) => {
    switch (message.type) {
      case "response.text.delta":
        this.onTextReceived.invoke({text: message.delta, completed: false})
        break
      case "response.text.done":
        this.onTextReceived.invoke({text: "", completed: true})
        break
      case "response.audio.delta": {
        const audio = Base64.decode(message.delta)
        this.dynamicAudioOutput.addAudioFrame(audio)
        break
      }
      case "response.output_item.done":
        if (message.item?.type === "function_call") {
          this.onFunctionCall.invoke({
            name: message.item.name,
            args: JSON.parse(message.item.arguments),
            callId: message.item.call_id
          })
        }
        break
    }
  })
}

// Session configuration
private sendSessionUpdate(): void {
  const update = {
    type: "session.update",
    session: {
      instructions: "You are a helpful AR assistant.",
      tools: this.getOpenAITools(),
      tool_choice: "auto"
    }
  } as OpenAITypes.Realtime.SessionUpdateRequest
  this.OAIRealtime.send(update)
}

// Send function call output
public sendFunctionOutput(callId: string, output: string): void {
  const item = {
    type: "conversation.item.create",
    item: {type: "function_call_output", call_id: callId, output}
  } as OpenAITypes.Realtime.ConversationItemCreateRequest
  this.OAIRealtime.send(item)
  this.OAIRealtime.send({type: "response.create"} as OpenAITypes.Realtime.ResponseCreateRequest)
}
```

---

## Function Declarations

```typescript
// Gemini format
private getFunctionDeclarations(): GeminiTypes.FunctionDeclaration[] {
  return [
    {
      name: "SetLightColor",
      description: "Set the color of a light in the scene",
      parameters: {
        type: "object",
        properties: {
          color: {type: "string", description: "Color name or hex value"},
          brightness: {type: "number", description: "0.0 to 1.0"}
        },
        required: ["color"]
      }
    }
  ]
}

// OpenAI format
private getOpenAITools() {
  return [
    {
      type: "function",
      name: "SetLightColor",
      description: "Set the color of a light in the scene",
      parameters: {
        type: "object",
        properties: {
          color: {type: "string", description: "Color name or hex value"},
          brightness: {type: "number", description: "0.0 to 1.0"}
        },
        required: ["color"]
      }
    }
  ]
}
```

---

## Audio Setup

```typescript
import {DynamicAudioOutput} from "RemoteServiceGateway.lspkg/Helpers/DynamicAudioOutput"

// Initialize with the sample rate the AI returns audio at
this.dynamicAudioOutput = new DynamicAudioOutput()
this.dynamicAudioOutput.initialize(24000)  // Gemini: 24000 Hz

// Microphone setup
this.microphoneRecorder = new MicrophoneRecorder()
this.microphoneRecorder.setSampleRate(16000)  // RSG expects 16000 Hz input
this.microphoneRecorder.start()
```

---

## Disconnect / Cleanup

```typescript
private disconnect(): void {
  this.GeminiLive?.close()
  this.microphoneRecorder?.stop()
  this.dynamicAudioOutput?.stop()
  this.videoController?.stop()
}
```

---

## Key Notes

- RSG handles authentication — no API keys needed in the Lens script
- Always initialize `DynamicAudioOutput` before streaming audio frames
- Gemini audio output: 24000 Hz PCM; mic input: 16000 Hz
- OpenAI Realtime audio: 24000 Hz PCM; mic input: 16000 Hz
- Function calls must get a response before Gemini/OpenAI continues
- See `AI Playground/Assets/Scripts/GeminiAssistant.ts` and `OpenAIAssistant.ts` for full examples
