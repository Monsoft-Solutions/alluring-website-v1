/**
 * OpenTelemetry Instrumentation for Next.js Admin
 *
 * Sets up Langfuse observability for AI SDK telemetry.
 * This file is automatically loaded by Next.js on server startup.
 *
 * @see https://langfuse.com/integrations/frameworks/vercel-ai-sdk
 */
import { LangfuseSpanProcessor, ShouldExportSpan } from '@langfuse/otel'
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node'

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
