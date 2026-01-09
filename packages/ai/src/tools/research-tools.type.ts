/**
 * Research Tools Types
 *
 * Shared types for research tools to avoid circular dependencies.
 *
 * @module @workspace/ai/tools/research-tools.type
 */

/**
 * Source collected during research
 */
export type CollectedSource = {
    title: string
    url: string
    type: 'perplexity' | 'google'
}

/**
 * Source context for tracking all sources used during generation
 */
export type SourceContext = {
    sources: CollectedSource[]
}
