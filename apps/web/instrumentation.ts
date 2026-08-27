/**
 * OpenTelemetry Instrumentation for Next.js
 *
 * Sets up Langfuse observability for AI SDK telemetry.
 * This file is automatically loaded by Next.js on server startup.
 *
 * @see https://langfuse.com/integrations/frameworks/vercel-ai-sdk
 */
import { LangfuseSpanProcessor, type ShouldExportSpan } from '@langfuse/otel'
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node'
import { registerAiTelemetry } from '@workspace/ai/telemetry'

/**
 * Filter out Next.js infrastructure spans to reduce noise.
 * Only export AI SDK spans and custom application spans.
 */
const shouldExportSpan: ShouldExportSpan = (span) => {
    return span.otelSpan.instrumentationScope.name !== 'next.js'
}

/** Langfuse span processor for trace export */
export const langfuseSpanProcessor = new LangfuseSpanProcessor({
    shouldExportSpan,
})

const tracerProvider = new NodeTracerProvider({
    spanProcessors: [langfuseSpanProcessor],
})

tracerProvider.register()

/**
 * AI SDK 7 emits telemetry only when an integration is registered. Without this
 * call every AI span silently stops reaching Langfuse — no error, no failing
 * build. See `registerAiTelemetry` for why it is the *legacy* integration.
 */
registerAiTelemetry()
