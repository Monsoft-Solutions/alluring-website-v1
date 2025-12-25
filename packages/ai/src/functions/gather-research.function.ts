/**
 * Gather Research Function
 *
 * Pre-generation research gathering for blog post content.
 * Fetches current statistics, facts, and authoritative sources
 * before content generation for more accurate, up-to-date posts.
 *
 * @module @workspace/ai/functions/gather-research
 */
import {
    executeWebSearch,
    executeMedicalSearch,
    type WebSearchResult,
} from '../tools/web-search-tavily.tool'

/**
 * Research result structure
 */
export type ResearchResult = {
    /** General web search results */
    statistics: WebSearchResult[]
    /** Medical/authoritative source results */
    medicalSources: WebSearchResult[]
    /** AI-generated summary of findings */
    summary?: string
    /** Formatted context for injection into prompts */
    formattedContext: string
}

/**
 * Options for research gathering
 */
export type GatherResearchOptions = {
    /** Main topic to research */
    topic: string
    /** Primary keyword for targeted search */
    primaryKeyword: string
    /** Optional secondary keywords */
    secondaryKeywords?: string[]
    /** Maximum results per search type */
    maxResultsPerSearch?: number
}

/**
 * Format research results for prompt injection
 */
function formatResearchContext(
    statistics: WebSearchResult[],
    medicalSources: WebSearchResult[],
    summary?: string
): string {
    const sections: string[] = []

    if (summary) {
        sections.push(`## Research Summary\n${summary}`)
    }

    if (statistics.length > 0) {
        const statsFormatted = statistics
            .map(
                (s) =>
                    `- **${s.title}** (${s.url})\n  ${s.snippet}${s.publishedDate ? ` [${s.publishedDate}]` : ''}`
            )
            .join('\n')
        sections.push(
            `## Current Statistics & Facts\n${statsFormatted}\n\n*Use these sources for citations. Format: "According to [Source Name](url), ..."*`
        )
    }

    if (medicalSources.length > 0) {
        const medicalFormatted = medicalSources
            .map(
                (s) =>
                    `- **${s.title}** (${s.url})\n  ${s.snippet}${s.publishedDate ? ` [${s.publishedDate}]` : ''}`
            )
            .join('\n')
        sections.push(
            `## Authoritative Medical Sources\n${medicalFormatted}\n\n*Cite these for medical facts and guidelines.*`
        )
    }

    if (sections.length === 0) {
        return `## Research Context\nNo external research available. Use general knowledge but be careful with specific statistics.`
    }

    return sections.join('\n\n')
}

/**
 * Gather research for blog post content generation
 *
 * Performs parallel web searches to gather current statistics,
 * facts, and authoritative medical sources before content generation.
 *
 * @param options - Research options
 * @returns Research results with formatted context
 *
 * @example
 * ```typescript
 * const research = await gatherResearch({
 *   topic: 'Brazilian Butt Lift Recovery',
 *   primaryKeyword: 'bbl recovery',
 *   secondaryKeywords: ['bbl healing time', 'bbl aftercare'],
 * })
 *
 * console.log(research.formattedContext)
 * // ## Research Summary
 * // ...statistics and sources formatted for prompt injection
 * ```
 */
export async function gatherResearch(
    options: GatherResearchOptions
): Promise<ResearchResult> {
    const {
        topic,
        primaryKeyword,
        secondaryKeywords = [],
        maxResultsPerSearch = 3,
    } = options

    // Build search queries
    const statsQuery = `${primaryKeyword} statistics 2025`
    const medicalQuery = `${topic} medical guidelines safety`

    // Perform parallel searches
    const [generalSearch, medicalSearch] = await Promise.all([
        executeWebSearch({
            query: statsQuery,
            maxResults: maxResultsPerSearch,
            searchDepth: 'basic',
        }),
        executeMedicalSearch(medicalQuery, maxResultsPerSearch),
    ])

    // If we have secondary keywords, do an additional search
    let additionalResults: WebSearchResult[] = []
    if (secondaryKeywords.length > 0) {
        const additionalQuery = secondaryKeywords.slice(0, 2).join(' OR ')
        try {
            const additional = await executeWebSearch({
                query: `${additionalQuery} latest research`,
                maxResults: 2,
                searchDepth: 'basic',
            })
            additionalResults = additional.results
        } catch {
            // Ignore errors from additional search
        }
    }

    // Combine statistics
    const allStats = [...generalSearch.results, ...additionalResults]

    // Format context for prompt injection
    const formattedContext = formatResearchContext(
        allStats,
        medicalSearch.results,
        generalSearch.summary
    )

    return {
        statistics: allStats,
        medicalSources: medicalSearch.results,
        summary: generalSearch.summary,
        formattedContext,
    }
}
