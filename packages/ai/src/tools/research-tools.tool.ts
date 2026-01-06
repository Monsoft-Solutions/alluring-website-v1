/**
 * Research Tools Bundle
 *
 * Bundled research tools for agentic content generation.
 * Uses AI SDK tool() helper with inputSchema for proper tool calling.
 * Provides factory functions to create tools with source tracking.
 *
 * @module @workspace/ai/tools/research-tools
 */
import { createPerplexitySearchTool } from './perplexity-search.tool'
import { createGoogleSearchTool } from './google-search.tool'
import type { SourceContext } from './research-tools.type'

// Re-export types for convenience
export type { CollectedSource, SourceContext } from './research-tools.type'

/**
 * Create a source collector for tracking all sources used during generation
 *
 * @returns Empty source context
 *
 * @example
 * ```typescript
 * const sourceContext = createSourceCollector()
 * const tools = createResearchTools(sourceContext)
 *
 * await generateText({ tools, ... })
 *
 * console.log(sourceContext.sources) // All sources used
 * ```
 */
export function createSourceCollector(): SourceContext {
    return { sources: [] }
}

/**
 * Create research tools bundle for agentic content generation
 *
 * Returns an object with AI SDK-compatible tools that can be passed
 * directly to generateText. Uses the tool() helper with inputSchema
 * for proper multi-step tool calling.
 *
 * Includes:
 * - perplexity_search: AI-powered search with citations
 * - google_search: Google Custom Search for specific sources
 * - think: Structured reasoning scratchpad for complex decisions
 *
 * @param sourceContext - Source collector context for tracking sources
 * @returns Tools bundle with perplexity_search, google_search, and think
 *
 * @example
 * ```typescript
 * import { generateText } from 'ai'
 * import { openai } from '@ai-sdk/openai'
 * import { createSourceCollector, createResearchTools } from './research-tools.tool'
 *
 * const sourceContext = createSourceCollector()
 * const tools = createResearchTools(sourceContext)
 *
 * const result = await generateText({
 *   model: openai('gpt-4.1'),
 *   prompt: 'Write about BBL recovery with statistics',
 *   tools,
 *   maxSteps: 20,
 * })
 *
 * console.log(result.text) // Generated content
 * console.log(sourceContext.sources) // All sources used
 * ```
 */
export function createResearchTools(sourceContext: SourceContext) {
    return {
        perplexity_search: createPerplexitySearchTool(sourceContext),
        google_search: createGoogleSearchTool(sourceContext),
    }
}

// Re-export for convenience
export { createPerplexitySearchTool } from './perplexity-search.tool'
export { createGoogleSearchTool } from './google-search.tool'
