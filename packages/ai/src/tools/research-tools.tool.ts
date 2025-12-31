/**
 * Research Tools Bundle
 *
 * Bundled research tools for agentic content generation.
 * Provides Perplexity AI and Google Custom Search tools
 * that can be injected into AI generation calls.
 *
 * @module @workspace/ai/tools/research-tools
 */
import { z } from 'zod'

import type { CoreToolSet } from '../core/types.core'
import {
    executePerplexitySearch,
    type PerplexitySearchResult,
    type PerplexitySource,
} from './perplexity.tool'
import {
    executeGoogleSearch,
    type GoogleSearchToolResult,
    type GoogleSearchResult,
} from './web-search-google.tool'

/**
 * Source collected during research
 */
export type CollectedSource = {
    title: string
    url: string
    type: 'perplexity' | 'google'
}

/**
 * Research tools result for source tracking
 */
export type ResearchToolsContext = {
    sources: CollectedSource[]
}

/**
 * Create a source collector for tracking all sources used during generation
 */
export function createSourceCollector(): ResearchToolsContext {
    return { sources: [] }
}

/**
 * Add sources from Perplexity search results
 */
function addPerplexitySources(
    context: ResearchToolsContext,
    sources: PerplexitySource[]
) {
    sources.forEach((source) => {
        // Avoid duplicates
        if (!context.sources.some((s) => s.url === source.url)) {
            context.sources.push({
                title: source.title,
                url: source.url,
                type: 'perplexity',
            })
        }
    })
}

/**
 * Add sources from Google search results
 */
function addGoogleSources(
    context: ResearchToolsContext,
    results: GoogleSearchResult[]
) {
    results.forEach((result) => {
        // Avoid duplicates
        if (!context.sources.some((s) => s.url === result.url)) {
            context.sources.push({
                title: result.title,
                url: result.url,
                type: 'google',
            })
        }
    })
}

/**
 * Perplexity search parameters schema for research tools
 * Note: Avoid using .default() as it breaks JSON Schema conversion for AI SDK
 */
const researchPerplexitySchema = z.object({
    query: z
        .string()
        .describe(
            'The question or topic to search for. Be specific for better results.'
        ),
    focus: z
        .enum(['general', 'medical', 'academic'])
        .optional()
        .describe(
            'Search focus: general (default), medical (health/surgery topics), academic (research papers)'
        ),
})

/**
 * Google search parameters schema for research tools
 * Note: Avoid using .default() as it breaks JSON Schema conversion for AI SDK
 */
const researchGoogleSchema = z.object({
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
 * Create research tools bundle for agentic content generation
 *
 * Returns a tools object that can be passed to coreGenerateText.
 * Tracks all sources used during generation for citation purposes.
 *
 * @param context - Source collector context for tracking sources
 * @returns Tools bundle with perplexity_search and google_search
 *
 * @example
 * ```typescript
 * const sourceContext = createSourceCollector()
 * const tools = createResearchTools(sourceContext)
 *
 * const result = await coreGenerateText({
 *   prompt: 'Write about BBL recovery',
 *   tools,
 *   maxSteps: 10,
 * })
 *
 * console.log(sourceContext.sources) // All sources used
 * ```
 */
export function createResearchTools(
    context: ResearchToolsContext
): CoreToolSet {
    return {
        perplexity_search: {
            description:
                'Search for facts and information using Perplexity AI. Returns an AI-generated answer with source citations. Use this for quick fact-checking, statistics, medical information, and current data during content writing. Always use this when you need to cite specific facts or numbers.',
            parameters: researchPerplexitySchema,
            execute: async (params: unknown): Promise<unknown> => {
                const parsed = researchPerplexitySchema.parse(params)
                const result: PerplexitySearchResult =
                    await executePerplexitySearch({
                        query: parsed.query,
                        focus: parsed.focus ?? 'general',
                    })

                // Track sources
                addPerplexitySources(context, result.sources)

                // Return formatted result for the AI
                let response = `**Answer:** ${result.answer}\n`
                if (result.sources.length > 0) {
                    response += '\n**Sources:**\n'
                    result.sources.forEach((source, i) => {
                        response += `${i + 1}. [${source.title}](${source.url})\n`
                    })
                }
                return response
            },
        },
        google_search: {
            description:
                'Search Google for specific information from web pages. Use this to find recent articles, specific websites, or when you need results from particular domains. Returns snippets and URLs from matching pages.',
            parameters: researchGoogleSchema,
            execute: async (params: unknown): Promise<unknown> => {
                const parsed = researchGoogleSchema.parse(params)
                const result: GoogleSearchToolResult =
                    await executeGoogleSearch({
                        query: parsed.query,
                        sites: parsed.sites,
                        maxResults: parsed.maxResults ?? 5, // Apply default here
                    })

                // Track sources
                addGoogleSources(context, result.results)

                // Return formatted result for the AI
                if (result.results.length === 0) {
                    return 'No results found for the query.'
                }

                let response = `**Search Results for "${result.query}":**\n\n`
                result.results.forEach((item, i) => {
                    response += `${i + 1}. **${item.title}**\n`
                    response += `   ${item.snippet}\n`
                    response += `   Source: [${item.displayDomain}](${item.url})\n\n`
                })
                return response
            },
        },
    }
}

/**
 * Type for the research tools bundle
 */
export type ResearchToolsBundle = CoreToolSet
