/**
 * Research result from web search
 *
 * @module @workspace/ai/types/pipeline/research-result
 */

/**
 * Research result from web search
 */
export type ResearchResult = {
    query: string
    findings: Array<{
        title: string
        url: string
        snippet: string
        relevanceScore: number
    }>
    summary?: string
}
