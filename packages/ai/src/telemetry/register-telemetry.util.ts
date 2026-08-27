/**
 * AI SDK Telemetry Registration
 *
 * @module @workspace/ai/telemetry/register-telemetry
 */
import { LegacyOpenTelemetry } from '@ai-sdk/otel'
import { registerTelemetry } from 'ai'

/**
 * Register the AI SDK's OpenTelemetry integration.
 *
 * Call this once per runtime, from each Next.js app's `instrumentation.ts`,
 * **after** the tracer provider is registered.
 *
 * **AI SDK 7 emits no telemetry at all until an integration is registered.**
 * `telemetry: { isEnabled: true }` is an opt-_out_ switch for an integration
 * that is already registered — on its own it does nothing. Skip this call and
 * every AI span silently stops reaching Langfuse: no error, no type error, no
 * failing build.
 *
 * `LegacyOpenTelemetry` rather than `OpenTelemetry` is deliberate. It emits the
 * `ai.*` span attributes that `@langfuse/otel@4` parses; the newer integration
 * emits GenAI SemConv (`gen_ai.input.messages`), which Langfuse only reads from
 * v5. Registering the new one against Langfuse 4 keeps spans flowing but strips
 * prompt and response bodies out of them. Move both together, never one alone.
 *
 * Idempotent, and the flag has to live on `globalThis` because that is where
 * `registerTelemetry` keeps its registry. A module-scoped flag would not survive
 * a dev-server recompile or a second evaluation of `instrumentation.ts`: the new
 * module instance would see `false`, append a second integration to the array that
 * *did* survive, and every AI span would be emitted to Langfuse twice.
 */
export function registerAiTelemetry(): void {
    const globalScope = globalThis as typeof globalThis & {
        __aiTelemetryRegistered?: boolean
    }
    if (globalScope.__aiTelemetryRegistered) return
    globalScope.__aiTelemetryRegistered = true
    registerTelemetry(new LegacyOpenTelemetry())
}
