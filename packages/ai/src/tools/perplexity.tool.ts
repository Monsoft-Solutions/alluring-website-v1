/**
 * Perplexity AI Search Tool
 *
 * AI-powered search using Perplexity's sonar model for quick fact-checking
 * with source citations. Ideal for mid-writing lookups during content generation.
 *
 * Uses direct API calls for stability across AI SDK versions.
 *
 * @module @workspace/ai/tools/perplexity
 */
import { z } from 'zod'

import { getPerplexitySearchDomains } from '../config/trusted-sources.config'
import { env, isPerplexityConfigured } from '../env'

/**
 * Source citation from Perplexity search
 */
export type PerplexitySource = {
    title: string
    url: string
}

/**
 * Perplexity search result
 */
export type PerplexitySearchResult = {
    query: string
    answer: string
    sources: PerplexitySource[]
}

/**
 * Focus areas for Perplexity search
 */
export type PerplexityFocus = 'general' | 'medical' | 'academic'

/**
 * Perplexity search parameters schema
 */
export const perplexitySearchParametersSchema = z.object({
    query: z
        .string()
        .describe(
            'The question or topic to search for. Be specific for better results.'
        ),
    focus: z
        .enum(['general', 'medical', 'academic'])
        .default('general')
        .describe(
            'Search focus: general (default), medical (health/surgery topics), academic (research papers)'
        ),
})

export type PerplexitySearchParameters = z.infer<
    typeof perplexitySearchParametersSchema
>

/**
 * Perplexity API response type
 */
type PerplexityAPIResponse = {
    id: string
    model: string
    choices: Array<{
        index: number
        message: {
            role: string
            content: string
        }
        finish_reason: string
    }>
    citations?: string[]
}

/**
 * Build a focused query based on the search focus
 */
function buildFocusedQuery(query: string, focus: PerplexityFocus): string {
    switch (focus) {
        case 'medical':
            return `Medical/health information: ${query}. Provide accurate, evidence-based information with sources from medical institutions.`
        case 'academic':
            return `Academic research: ${query}. Focus on peer-reviewed sources and scientific studies.`
        default:
            return query
    }
}

/**
 * Execute a Perplexity AI search
 *
 * Uses the sonar model for quick fact-checking with source citations.
 * Returns structured results with the answer and source URLs.
 *
 * @param params - Search parameters
 * @returns Search result with answer and sources
 *
 * @example
 * ```typescript
 * const result = await executePerplexitySearch({
 *   query: 'What is the average recovery time for a BBL?',
 *   focus: 'medical',
 * })
 *
 * console.log(result.answer) // "The average recovery time for a BBL is..."
 * console.log(result.sources) // [{ title: "...", url: "..." }]
 * ```
 */
export async function executePerplexitySearch(
    params: PerplexitySearchParameters
): Promise<PerplexitySearchResult> {
    if (!isPerplexityConfigured()) {
        console.warn(
            'PERPLEXITY_API_KEY not set, returning empty search results'
        )
        return {
            query: params.query,
            answer: 'Perplexity search is not configured. Please set PERPLEXITY_API_KEY.',
            sources: [],
        }
    }

    const focusedQuery = buildFocusedQuery(params.query, params.focus)

    try {
        const response = await fetch(
            'https://api.perplexity.ai/chat/completions',
            {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${env.PERPLEXITY_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'sonar',
                    messages: [
                        {
                            role: 'user',
                            content: focusedQuery,
                        },
                    ],
                    return_citations: true,
                    search_domain_filter: getPerplexitySearchDomains(),
                }),
            }
        )

        if (!response.ok) {
            const errorText = await response.text()
            throw new Error(
                `Perplexity API error: ${response.status} - ${errorText}`
            )
        }

        const data = (await response.json()) as PerplexityAPIResponse

        // Extract sources from citations
        const sources: PerplexitySource[] = []
        if (data.citations) {
            data.citations.forEach((url, index) => {
                sources.push({
                    title: `Source ${index + 1}`,
                    url,
                })
            })
        }

        const answer = data.choices[0]?.message?.content ?? ''

        return {
            query: params.query,
            answer,
            sources,
        }
    } catch (error) {
        console.error('Perplexity search error:', error)
        throw new Error(
            `Perplexity search failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        )
    }
}

/**
 * Convenience function for quick searches
 */
export async function searchPerplexity(
    query: string,
    focus: PerplexityFocus = 'general'
): Promise<PerplexitySearchResult> {
    return executePerplexitySearch({ query, focus })
}

/**
 * Medical-focused Perplexity search
 */
export async function searchPerplexityMedical(
    query: string
): Promise<PerplexitySearchResult> {
    return executePerplexitySearch({ query, focus: 'medical' })
}

/**
 * Tool definition for AI agents
 */
export const perplexitySearchToolDefinition = {
    description:
        'Search for facts and information using Perplexity AI. Returns an AI-generated answer with source citations. Use this for quick fact-checking, statistics, and current information during content writing.',
    parameters: perplexitySearchParametersSchema,
}
