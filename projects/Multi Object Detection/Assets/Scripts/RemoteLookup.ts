// RemoteLookup.ts
// Minimal RSG-based Remote Lookup component following Snap's Remote Service Gateway example.

// Static imports per Snap example. Project must include RemoteServiceGateway.lspkg.
import { Gemini } from 'RemoteServiceGateway.lspkg/HostedExternal/Gemini';
import { GeminiTypes } from 'RemoteServiceGateway.lspkg/HostedExternal/GeminiTypes';
import { OpenAI } from 'RemoteServiceGateway.lspkg/HostedExternal/OpenAI';

// Lens Studio global print function
declare function print(...args: any[]): void;
// Decorator and base class ambient declarations to avoid strict typing issues
declare function component(target: any): any;
declare function input(...args: any[]): any;
declare var BaseScriptComponent: any;
// Ensure timer identifier exists for environments missing DOM lib
declare var setTimeout: any;

// Timer helpers — use globalThis if available, and avoid ReferenceError when setTimeout is missing
function getSetTimeout(): ((handler: (...args: any[]) => void, timeout?: number) => number) | null {
  try {
    if (typeof setTimeout !== 'undefined') return setTimeout as any;
  } catch (e) {
    // ReferenceError if setTimeout not defined in this environment
  }
  if (typeof globalThis !== 'undefined' && (globalThis as any).setTimeout) return (globalThis as any).setTimeout;
  return null;
}

function sleep(ms: number) {
  const st = getSetTimeout();
  if (st) return new Promise((res) => st(res, ms));
  // fallback: immediate resolve (no delay) to avoid blocking
  return Promise.resolve();
}

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  const st = getSetTimeout();
  if (st) {
    return Promise.race([
      p,
      new Promise<T>((_, rej) => st(() => rej(new Error('timeout')), ms)),
    ]) as Promise<T>;
  }
  // no timer available — just return original promise (no timeout)
  return p;
}

// simple in-memory cache
const cache: Map<string, { result: any; fetchedAt: number }> = new Map();

@component
export class RemoteLookup extends BaseScriptComponent {
  // Inspector-exposed parameters
  @input()
  provider: string = 'Gemini'; // Gemini | OpenAI (currently using Gemini example)

  @input()
  model: string = 'gemini-2.5-flash-lite';

  @input()
  requestType: string = 'generateContent'; // per Snap example

  @input()
  systemPrompt: string = 'You are a witty assistant that answers in one sentence.';

  @input()
  promptTemplate: string = "Give a witty one-sentence description of '{label}'.";

  @input()
  temperature: number = 0.7;

  @input()
  timeoutMs: number = 8000;

  @input()
  retries: number = 1;

  @input()
  cacheTtlMs: number = 5 * 60 * 1000; // 5 minutes

  @input()
  enableDebug: boolean = true;

  onAwake() {
    if (this.enableDebug) print('RemoteLookup: Awake - ready to use RSG with model=' + this.model);
  }

  // Public lookup method called by GazeSelector. Returns parsed text or throws.
  async lookup(label: string, detection?: any): Promise<any> {
    const cacheKey = `${this.provider}::${this.model}::${label}`;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.fetchedAt < this.cacheTtlMs) {
      if (this.enableDebug) print(`RemoteLookup: cache hit for ${cacheKey}`);
      return cached.result;
    }

    let attempt = 0;
    let lastErr: any = null;

    const prompt = this.promptTemplate.replace('{label}', label);

    while (attempt <= this.retries) {
      attempt++;
      try {
        if (this.enableDebug) print('RemoteLookup: opening RSG/gateway for ' + label);

        // Build request according to Snap example for Gemini
        const request: any = {
          model: this.model,
          type: this.requestType,
          body: {
            contents: [
              { role: 'model', parts: [{ text: this.systemPrompt }] },
              { role: 'user', parts: [{ text: prompt }] },
            ],
          },
          temperature: this.temperature,
        };

        if (this.provider === 'Gemini') {
          if (this.enableDebug) print('RemoteLookup: Gemini request -> ' + JSON.stringify(request));
          // Call Gemini.models(request)
          const resp: any = await withTimeout((Gemini as any).models(request), this.timeoutMs);
          // Parse response like the Snap example
          const text = resp && resp.candidates && resp.candidates[0] && resp.candidates[0].content && resp.candidates[0].content.parts && resp.candidates[0].content.parts[0] && resp.candidates[0].content.parts[0].text
            ? resp.candidates[0].content.parts[0].text
            : JSON.stringify(resp);
          if (this.enableDebug) print('RemoteLookup: Gemini response -> ' + text);
          const result = { provider: 'Gemini', text, raw: resp };
          cache.set(cacheKey, { result, fetchedAt: Date.now() });
          return result;
        } else if (this.provider === 'OpenAI') {
          // Build OpenAI-style request
          const messages = [
            { role: 'system', content: this.systemPrompt },
            { role: 'user', content: prompt },
          ];
          const oReq: any = {
            model: this.model || 'gpt-4o',
            messages: messages,
          };
          if (this.temperature !== undefined) oReq.temperature = this.temperature;
          if (this.enableDebug) print('RemoteLookup: OpenAI request -> ' + JSON.stringify(oReq));
          // Call OpenAI.chatCompletions
          const resp: any = await withTimeout((OpenAI as any).chatCompletions(oReq), this.timeoutMs);
          const text = resp && resp.choices && resp.choices[0] && (resp.choices[0].message ? resp.choices[0].message.content : resp.choices[0].text)
            ? (resp.choices[0].message ? resp.choices[0].message.content : resp.choices[0].text)
            : JSON.stringify(resp);
          if (this.enableDebug) print('RemoteLookup: OpenAI response -> ' + text);
          const result = { provider: 'OpenAI', text, raw: resp };
          cache.set(cacheKey, { result, fetchedAt: Date.now() });
          return result;
        } else {
          throw new Error('Unsupported provider: ' + this.provider);
        }
      } catch (err) {
        lastErr = err;
        if (this.enableDebug) print(`RemoteLookup: attempt ${attempt} failed -> ${(err && err.message) ? err.message : err}`);
        if (attempt <= this.retries) {
          if (this.enableDebug) print('RemoteLookup: retrying...');
          await sleep(400);
        }
      }
    }

    if (this.enableDebug) print(`RemoteLookup: all attempts failed for ${label} -> ${(lastErr && lastErr.message) ? lastErr.message : lastErr}`);
    throw lastErr || new Error('RemoteLookup: unknown error');
  }
}
