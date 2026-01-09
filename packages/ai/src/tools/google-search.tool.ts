/**
 * Google Search Tool for AI SDK
 *
 * AI SDK-compatible tool using the tool() helper with inputSchema.
 * Factory function creates a tool with source tracking for citation purposes.
 *
 * @module @workspace/ai/tools/google-search
 */
import { tool } from 'ai'
import { z } from 'zod'

import { executeGoogleSearch } from './web-search-google.tool'
import type { SourceContext } from './research-tools.type'

/**
 * Input schema for Google search tool
 * Uses inputSchema as required by AI SDK
 */
const googleSearchInputSchema = z.object({
    query: z.string().describe('The search query'),
    sites: z
        .array(z.string())
        .optional()
        .describe('Optional list of domains to restrict search to'),
    maxResults: z
        .number()
        .min(1)
        .max(10)
        .optional()
        .describe('Maximum number of results to return (default: 5)'),
})

/**
 * Create a Google search tool with source tracking
 *
 * Factory function that creates an AI SDK-compatible tool.
 * The sourceContext is injected to track all sources used during generation.
 *
 * @param sourceContext - Context object for collecting sources
 * @returns AI SDK tool for Google search
 *
 * @example
 * ```typescript
 * const sourceContext = createSourceCollector()
 * const googleTool = createGoogleSearchTool(sourceContext)
 *
 * const result = await generateText({
 *   model: openai('gpt-4.1'),
 *   tools: { google_search: googleTool },
 *   maxSteps: 10,
 *   prompt: 'Find recent plastic surgery articles',
 * })
 *
 * console.log(sourceContext.sources) // All sources found
 * ```
 */
export function createGoogleSearchTool(sourceContext: SourceContext) {
    return tool({
        description:
            'Search Google for specific information from web pages. Use for recent articles, specific websites, or domain-restricted searches. Returns snippets and URLs from matching pages.',
        inputSchema: googleSearchInputSchema,
        execute: async ({ query, sites, maxResults }) => {
            console.log(
                `[Google] Searching: "${query}"${sites ? ` (sites: ${sites.join(', ')})` : ''}`
            )

            try {
                const result = await executeGoogleSearch({
                    query,
                    sites,
                    maxResults: maxResults ?? 5,
                })

                // Track sources for citation - avoid duplicates
                result.results.forEach((r) => {
                    if (!sourceContext.sources.some((s) => s.url === r.url)) {
                        sourceContext.sources.push({
                            title: r.title,
                            url: r.url,
                            type: 'google',
                        })
                    }
                })

                console.log(`[Google] Found ${result.results.length} results`)

                return {
                    query,
                    results: result.results.map((r) => ({
                        title: r.title,
                        url: r.url,
                        snippet: r.snippet,
                        domain: r.displayDomain,
                    })),
                    totalResults: result.results.length,
                    success: true,
                }
            } catch (error) {
                console.error('[Google] Search error:', error)
                return {
                    query,
                    results: [],
                    totalResults: 0,
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
