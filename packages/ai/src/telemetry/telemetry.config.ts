/**
 * Telemetry Configuration
 *
 * Centralized configuration for AI SDK telemetry.
 * Uses Langfuse for observability and tracing.
 *
 * @module @workspace/ai/telemetry
 */

/**
 * Telemetry options passed to every AI SDK call.
 *
 * **AI SDK 7 emits nothing unless an integration is registered.** `isEnabled`
 * is an opt-_out_ switch for an already-registered integration, not the thing
 * that turns telemetry on. Each Next.js app calls
 * `registerTelemetry(new LegacyOpenTelemetry())` in its `instrumentation.ts`;
 * without that call every span silently disappears from Langfuse — no error,
 * no type error, no failing build.
 *
 * `LegacyOpenTelemetry` (not `OpenTelemetry`) is deliberate: it emits the
 * `ai.*` span attributes that `@langfuse/otel@4` parses. The newer
 * `OpenTelemetry` integration emits GenAI SemConv (`gen_ai.input.messages`),
 * which Langfuse only understands from v5 — spans would still arrive, but
 * without prompt or response bodies.
 *
 * @example
 * ```typescript
 * import { telemetryConfig } from '@workspace/ai/telemetry'
 *
 * const result = await generateText({
 *   model,
 *   prompt: 'Hello',
 *   telemetry: telemetryConfig,
 * })
 * ```
 */
export const telemetryConfig = {
    /** Opt-out switch; the registered integration is what enables emission */
    isEnabled: true,
}
