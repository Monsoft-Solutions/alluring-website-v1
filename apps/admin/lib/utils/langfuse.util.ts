/**
 * Langfuse Deep-Link Helper
 *
 * Builds trace URLs for the Langfuse UI from trace ids stored in
 * pipelineState. Server-only: the base URL and project id are server env
 * vars, so routes compute the links and ship them to the client as data.
 *
 * @module @admin/lib/utils/langfuse
 */
import { env } from '@/env'

/**
 * URL of a trace in the Langfuse UI, or null when Langfuse deep-linking is
 * not configured (needs LANGFUSE_BASE_URL + LANGFUSE_PROJECT_ID) or the
 * phase never recorded a trace.
 */
export function buildLangfuseTraceUrl(
    traceId: string | undefined | null
): string | null {
    if (!traceId) return null

    const baseUrl = env.LANGFUSE_BASE_URL
    const projectId = env.LANGFUSE_PROJECT_ID
    if (!baseUrl || !projectId) return null

    return `${baseUrl.replace(/\/$/, '')}/project/${projectId}/traces/${traceId}`
}
