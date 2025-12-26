/**
 * Google Custom Search Tool
 *
 * Google Programmable Search Engine powered web search for AI agents.
 * Supports complex boolean queries with configurable site restrictions.
 *
 * @module @workspace/ai/tools/web-search-google
 */
import { z } from 'zod'

import { env, isGoogleSearchConfigured } from '../env'

/**
 * Google Custom Search API result item
 */
type GoogleSearchItem = {
    title: string
    link: string
    snippet: string
    displayLink: string
    formattedUrl: string
}

/**
 * Google Custom Search API response
 */
type GoogleSearchResponse = {
    kind: string
    searchInformation: {
        totalResults: string
        searchTime: number
    }
    items?: GoogleSearchItem[]
}

/**
 * Google search result returned to the AI
 */
export type GoogleSearchResult = {
    title: string
    url: string
    snippet: string
    displayDomain: string
}

/**
 * Google search tool result
 */
export type GoogleSearchToolResult = {
    query: string
    results: GoogleSearchResult[]
    totalResults: number
    searchTime: number
}

/**
 * Query group for building complex boolean queries
 */
export type QueryGroup = {
    /** Terms to OR together within this group */
    terms: string[]
    /** How to join this group with other groups (default: AND) */
    operator?: 'AND' | 'OR'
    /** Wrap terms in quotes for exact phrase matching */
    exact?: boolean
}

/**
 * Google search options
 */
export type GoogleSearchOptions = {
    /** Simple string query or structured query groups */
    query: string | QueryGroup[]
    /** Domains to restrict search to (uses site: operator) */
    sites?: string[]
    /** Domains to exclude from search (uses -site: operator) */
    excludeSites?: string[]
    /** Maximum results to return (1-10) */
    maxResults?: number
    /** Date restriction (e.g., 'd7' for last 7 days, 'm3' for last 3 months) */
    dateRestrict?: string
    /** Start index for pagination (1-based) */
    startIndex?: number
}

/**
 * Google search parameters schema for AI agents
 */
export const googleSearchParametersSchema = z.object({
    query: z.string().describe('The search query'),
    sites: z
        .array(z.string())
        .optional()
        .describe('Optional list of domains to restrict search to'),
    excludeSites: z
        .array(z.string())
        .optional()
        .describe('Optional list of domains to exclude'),
    maxResults: z.number().min(1).max(10).default(10),
    dateRestrict: z
        .string()
        .optional()
        .describe('Date restriction like d7 (7 days) or m3 (3 months)'),
})

export type GoogleSearchParameters = z.infer<
    typeof googleSearchParametersSchema
>

/**
 * Build a boolean query string from query groups
 *
 * @example
 * buildQueryString([
 *   { terms: ['BBL', 'fat transfer'] },
 *   { terms: ['complications', 'risks'] }
 * ])
 * // Returns: (BBL OR "fat transfer") (complications OR risks)
 */
export function buildQueryString(groups: QueryGroup[]): string {
    return groups
        .map((group) => {
            const terms = group.terms.map((term) => {
                // Wrap multi-word terms or exact phrases in quotes
                const needsQuotes =
                    group.exact || (term.includes(' ') && !term.startsWith('"'))
                return needsQuotes ? `"${term}"` : term
            })

            // Join terms within group with OR
            const groupQuery = terms.join(' OR ')

            // Wrap in parentheses if multiple terms
            return terms.length > 1 ? `(${groupQuery})` : groupQuery
        })
        .join(' ')
}

/**
 * Build site restriction operators
 *
 * @example
 * buildSiteRestrictions(['nih.gov', 'mayoclinic.org'])
 * // Returns: (site:nih.gov OR site:mayoclinic.org)
 */
export function buildSiteRestrictions(sites: string[]): string {
    if (sites.length === 0) return ''

    const siteOperators = sites.map((site) => `site:${site}`)

    return sites.length > 1
        ? `(${siteOperators.join(' OR ')})`
        : siteOperators[0]!
}

/**
 * Build site exclusion operators
 *
 * @example
 * buildSiteExclusions(['reddit.com', 'quora.com'])
 * // Returns: -site:reddit.com -site:quora.com
 */
export function buildSiteExclusions(sites: string[]): string {
    return sites.map((site) => `-site:${site}`).join(' ')
}

/**
 * Build the complete search query
 */
export function buildCompleteQuery(options: GoogleSearchOptions): string {
    const parts: string[] = []

    // Main query
    if (typeof options.query === 'string') {
        parts.push(options.query)
    } else {
        parts.push(buildQueryString(options.query))
    }

    // Site restrictions
    if (options.sites && options.sites.length > 0) {
        parts.push(buildSiteRestrictions(options.sites))
    }

    // Site exclusions
    if (options.excludeSites && options.excludeSites.length > 0) {
        parts.push(buildSiteExclusions(options.excludeSites))
    }

    return parts.join(' ')
}

/**
 * Execute a Google Custom Search
 *
 * @param options - Search options
 * @returns Search results
 */
export async function executeGoogleSearch(
    options: GoogleSearchOptions
): Promise<GoogleSearchToolResult> {
    if (!isGoogleSearchConfigured()) {
        console.warn(
            'Google Custom Search not configured, returning empty results'
        )
        const queryStr =
            typeof options.query === 'string'
                ? options.query
                : buildQueryString(options.query)
        return {
            query: queryStr,
            results: [],
            totalResults: 0,
            searchTime: 0,
        }
    }

    const query = buildCompleteQuery(options)
    const maxResults = options.maxResults || 10
    const startIndex = options.startIndex || 1

    const params = new URLSearchParams({
        key: env.GOOGLE_CUSTOM_SEARCH_API_KEY!,
        cx: env.GOOGLE_CUSTOM_SEARCH_ENGINE_ID!,
        q: query,
        num: String(Math.min(maxResults, 10)), // Google API max is 10
        start: String(startIndex),
    })

    if (options.dateRestrict) {
        params.set('dateRestrict', options.dateRestrict)
    }

    const url = `https://www.googleapis.com/customsearch/v1?${params.toString()}`

    try {
        const response = await fetch(url)

        if (!response.ok) {
            const errorText = await response.text()
            throw new Error(
                `Google Custom Search API error: ${response.status} - ${errorText}`
            )
        }

        const data = (await response.json()) as GoogleSearchResponse

        return {
            query,
            results: (data.items || []).map((item) => ({
                title: item.title,
                url: item.link,
                snippet: item.snippet,
                displayDomain: item.displayLink,
            })),
            totalResults: parseInt(data.searchInformation.totalResults, 10),
            searchTime: data.searchInformation.searchTime,
        }
    } catch (error) {
        console.error('Google Custom Search error:', error)
        throw new Error(
            `Google search failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        )
    }
}

/**
 * Execute a Google search with preset sources
 *
 * @param query - Search query (string or query groups)
 * @param sites - List of domains to restrict to
 * @param options - Additional options
 */
export async function searchGoogle(
    query: string | QueryGroup[],
    sites?: string[],
    options?: {
        excludeSites?: string[]
        maxResults?: number
        dateRestrict?: string
    }
): Promise<GoogleSearchToolResult> {
    return executeGoogleSearch({
        query,
        sites,
        ...options,
    })
}

/**
 * Execute a medical research search on Google
 * Uses the medical sources preset
 */
export async function searchMedicalGoogle(
    query: string | QueryGroup[],
    options?: {
        maxResults?: number
        dateRestrict?: string
    }
): Promise<GoogleSearchToolResult> {
    // Import dynamically to avoid circular dependency
    const { MEDICAL_SOURCES } = await import('../config/search-sources.config')

    return executeGoogleSearch({
        query,
        sites: [...MEDICAL_SOURCES],
        ...options,
    })
}

/**
 * Execute an academic research search on Google
 * Uses the academic sources preset
 */
export async function searchAcademicGoogle(
    query: string | QueryGroup[],
    options?: {
        maxResults?: number
        dateRestrict?: string
    }
): Promise<GoogleSearchToolResult> {
    // Import dynamically to avoid circular dependency
    const { ACADEMIC_SOURCES } = await import('../config/search-sources.config')

    return executeGoogleSearch({
        query,
        sites: [...ACADEMIC_SOURCES],
        ...options,
    })
}

/**
 * Tool definition for AI agents
 */
export const googleSearchToolDefinition = {
    description:
        'Search Google with custom site restrictions. Use this to find information from specific trusted sources. Supports complex boolean queries with AND/OR operators and site restrictions.',
    parameters: googleSearchParametersSchema,
}

/**
 * Medical Google search tool definition
 */
export const medicalGoogleSearchToolDefinition = {
    description:
        'Search Google for medical information from trusted sources like NIH, Mayo Clinic, Cleveland Clinic, and medical professional organizations.',
    parameters: z.object({
        query: z
            .string()
            .describe(
                'The medical search query. Be specific with medical terms.'
            ),
        maxResults: z.number().min(1).max(10).default(10),
        dateRestrict: z
            .string()
            .optional()
            .describe('Limit to recent results (e.g., m6 for 6 months)'),
    }),
}
