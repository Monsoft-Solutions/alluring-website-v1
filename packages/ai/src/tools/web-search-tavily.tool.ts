/**
 * Web Search Tool
 *
 * Tavily-powered web search for AI agents.
 * Searches the web for current medical/cosmetic surgery information.
 *
 * @module @workspace/ai/tools/web-search
 */
import { tavily } from '@tavily/core'
import { z } from 'zod'

import { env, isTavilyConfigured } from '../env'

/**
 * Web search result returned to the AI
 */
export type WebSearchResult = {
    title: string
    url: string
    snippet: string
    relevanceScore: number
    publishedDate?: string
}

/**
 * Web search tool result
 */
export type WebSearchToolResult = {
    query: string
    results: WebSearchResult[]
    summary?: string
}

/**
 * Domains to exclude from search results (competitors)
 */
const EXCLUDED_DOMAINS = [
    // Add competitor domains here
    'realself.com', // Has user reviews but also competitor ads
]

/**
 * Web search parameters schema
 */
export const webSearchParametersSchema = z.object({
    query: z
        .string()
        .describe(
            'The search query. Be specific and include relevant medical terms.'
        ),
    maxResults: z.number().min(1).max(10).default(5),
    searchDepth: z.enum(['basic', 'advanced']).default('basic'),
})

export type WebSearchParameters = z.infer<typeof webSearchParametersSchema>

/**
 * Get or create the Tavily client
 */
function getTavilyClient() {
    if (!isTavilyConfigured()) {
        return null
    }
    return tavily({ apiKey: env.TAVILY_API_KEY! })
}

/**
 * Execute a Tavily web search
 *
 * @param options - Search options
 * @returns Search results
 */
async function executeTavilySearch(options: {
    query: string
    maxResults: number
    searchDepth?: 'basic' | 'advanced'
    includeDomains?: string[]
    excludeDomains?: string[]
}): Promise<WebSearchToolResult> {
    const client = getTavilyClient()

    if (!client) {
        console.warn('TAVILY_API_KEY not set, returning empty search results')
        return {
            query: options.query,
            results: [],
            summary: 'Web search is not configured. Please set TAVILY_API_KEY.',
        }
    }

    try {
        const response = await client.search(options.query, {
            searchDepth: options.searchDepth || 'basic',
            maxResults: options.maxResults,
            includeAnswer: true,
            includeDomains: options.includeDomains,
            excludeDomains: [
                ...EXCLUDED_DOMAINS,
                ...(options.excludeDomains || []),
            ],
        })

        return {
            query: response.query,
            results: response.results.map((result) => ({
                title: result.title,
                url: result.url,
                snippet: result.content,
                relevanceScore: result.score,
                publishedDate: result.publishedDate,
            })),
            summary: response.answer,
        }
    } catch (error) {
        console.error('Tavily search error:', error)
        throw new Error(
            `Tavily search failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        )
    }
}

/**
 * Execute a web search for general information
 */
export async function executeWebSearch(
    params: WebSearchParameters
): Promise<WebSearchToolResult> {
    return executeTavilySearch({
        query: params.query,
        maxResults: params.maxResults,
        searchDepth: params.searchDepth,
    })
}

/**
 * Execute a medical-focused web search
 */
export async function executeMedicalSearch(
    query: string,
    maxResults: number = 5
): Promise<WebSearchToolResult> {
    return executeTavilySearch({
        query,
        maxResults,
        searchDepth: 'advanced',
        includeDomains: [
            'mayoclinic.org',
            'healthline.com',
            'webmd.com',
            'plasticsurgery.org',
            'ncbi.nlm.nih.gov',
            'nih.gov',
            'medlineplus.gov',
            'clevelandclinic.org',
        ],
    })
}

/**
 * Execute a web search (convenience function)
 */
export async function searchWeb(
    query: string,
    options?: {
        maxResults?: number
        searchDepth?: 'basic' | 'advanced'
        medicalOnly?: boolean
        includeDomains?: string[]
        excludeDomains?: string[]
    }
): Promise<WebSearchToolResult> {
    const {
        maxResults = 5,
        searchDepth = 'basic',
        medicalOnly = false,
        includeDomains,
        excludeDomains,
    } = options || {}

    return executeTavilySearch({
        query,
        maxResults,
        searchDepth,
        includeDomains:
            includeDomains ||
            (medicalOnly
                ? [
                      'mayoclinic.org',
                      'healthline.com',
                      'webmd.com',
                      'plasticsurgery.org',
                      'ncbi.nlm.nih.gov',
                  ]
                : undefined),
        excludeDomains,
    })
}

/**
 * Tool definition for AI agents (for use with generateText tools parameter)
 */
export const webSearchToolDefinition = {
    description:
        'Search the web for current, accurate medical and cosmetic surgery information. Use this to find statistics, medical facts, recovery guidelines, and authoritative information from trusted sources.',
    parameters: webSearchParametersSchema,
}

/**
 * Medical search tool definition
 */
export const medicalSearchToolDefinition = {
    description:
        'Search trusted medical sources for health and surgery information. Use this for medical facts, procedure details, and recovery information from authoritative medical sources.',
    parameters: z.object({
        query: z.string().describe('The medical search query'),
        maxResults: z.number().min(1).max(10).default(5),
    }),
}
