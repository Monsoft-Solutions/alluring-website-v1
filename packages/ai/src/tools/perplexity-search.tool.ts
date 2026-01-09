/**
 * Perplexity Search Tool for AI SDK
 *
 * AI SDK-compatible tool using the tool() helper with inputSchema.
 * Factory function creates a tool with source tracking for citation purposes.
 *
 * @module @workspace/ai/tools/perplexity-search
 */
import { tool } from 'ai'
import { z } from 'zod'

import { executePerplexitySearch } from './perplexity.tool'
import type { SourceContext } from './research-tools.type'

/**
 * Input schema for Perplexity search tool
 * Uses inputSchema as required by AI SDK
 */
const perplexitySearchInputSchema = z.object({
    query: z.string().describe('The question or topic to search for'),
    focus: z
        .enum(['general', 'medical', 'academic'])
        .optional()
        .describe('Search focus: general (default), medical, or academic'),
})

/**
 * Create a Perplexity search tool with source tracking
 *
 * Factory function that creates an AI SDK-compatible tool.
 * The sourceContext is injected to track all sources used during generation.
 *
 * @param sourceContext - Context object for collecting sources
 * @returns AI SDK tool for Perplexity search
 *
 * @example
 * ```typescript
 * const sourceContext = createSourceCollector()
 * const perplexityTool = createPerplexitySearchTool(sourceContext)
 *
 * const result = await generateText({
 *   model: openai('gpt-4.1'),
 *   tools: { perplexity_search: perplexityTool },
 *   maxSteps: 10,
 *   prompt: 'Research BBL recovery statistics',
 * })
 *
 * console.log(sourceContext.sources) // All sources found
 * ```
 */
export function createPerplexitySearchTool(sourceContext: SourceContext) {
    return tool({
        description:
            'Search for facts and information using Perplexity AI. Returns an AI-generated answer with source citations. Use for fact-checking, statistics, medical information, and current data during content writing. Always use this when you need to cite specific facts or numbers.',
        inputSchema: perplexitySearchInputSchema,
        execute: async ({ query, focus }) => {
            console.log(
                `[Perplexity] Searching: "${query}" (focus: ${focus ?? 'general'})`
            )

            try {
                const result = await executePerplexitySearch({
                    query,
                    focus: focus ?? 'general',
                })

                // Track sources for citation - avoid duplicates
                result.sources.forEach((source) => {
                    if (
                        !sourceContext.sources.some((s) => s.url === source.url)
                    ) {
                        sourceContext.sources.push({
                            title: source.title,
                            url: source.url,
                            type: 'perplexity',
                        })
                    }
                })

                console.log(
                    `[Perplexity] Found ${result.sources.length} sources`
                )

                return {
                    query,
                    answer: result.answer,
                    sources: result.sources.map((s) => ({
                        title: s.title,
                        url: s.url,
                    })),
                    success: true,
                }
            } catch (error) {
                console.error('[Perplexity] Search error:', error)
                return {
                    query,
                    answer: '',
                    sources: [],
                    success: false,
                    error:
                        error instanceof Error
                            ? error.message
                            : 'Unknown error',
                }
            }
        },
    })
}
