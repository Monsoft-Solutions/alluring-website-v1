/**
 * Search Console MCP server
 *
 * Exposes the shared `@workspace/seo/search-console` data layer as MCP tools so
 * Claude agents can read what the site actually ranks for before writing or
 * revising content — the same numbers the admin dashboard shows.
 *
 * Read-only by design. `submitSitemap` exists in the service layer but is not
 * registered here: an agent should not be able to push anything to Google.
 *
 * @module @workspace/mcp-gsc/server
 */
import { McpServer } from '@modelcontextprotocol/server'
import { z } from 'zod'

import {
    DEFAULT_DAYS,
    getContentGaps,
    getContentOpportunities,
    getDateRange,
    getPageTrend,
    getPagesForQuery,
    getPerformanceTrend,
    getPositionChanges,
    getQueriesByTerm,
    getQueriesForPage,
    getQueryTrend,
    getSearchConsoleSummary,
    getSitemaps,
    getTopPages,
    getTopQueries,
    inspectUrl,
    isSearchConsoleConfigured,
    searchPages,
} from '@workspace/seo/search-console'

import { formatResult } from './format.util.js'

/** Shape every tool handler returns. */
type ToolResult = {
    content: { type: 'text'; text: string }[]
    isError?: boolean
}

// ============================================================================
// Shared parameter schemas
// ============================================================================

const daysSchema = z
    .number()
    .int()
    .min(1)
    .max(480)
    .default(DEFAULT_DAYS)
    .describe(
        'Days of history to analyze, ending 3 days ago (Search Console data lags by ~3 days)'
    )

const limitSchema = (fallback: number) =>
    z.number().int().min(1).max(500).default(fallback)

const orderBySchema = z
    .enum(['clicks', 'impressions', 'ctr', 'position'])
    .default('clicks')
    .describe('Metric to rank results by')

const orderDirectionSchema = z
    .enum(['asc', 'desc'])
    .default('desc')
    .describe(
        "Sort direction. For 'position', desc means best rank (lowest number) first"
    )

const pageTypeSchema = z
    .enum([
        'blog',
        'blog-listing',
        'procedure',
        'pages',
        'gallery',
        'promotion',
        'other',
        'all',
    ])
    .default('all')
    .describe(
        'Content type filter. Classified by URL shape here, so pre-2026 blog posts at root level report as "other"'
    )

// ============================================================================
// Handler plumbing
// ============================================================================

/** Wrap a value as a successful text result. */
function ok(text: string): ToolResult {
    return { content: [{ type: 'text', text }] }
}

/** Wrap a message as an error result the model can act on. */
function fail(message: string): ToolResult {
    return { content: [{ type: 'text', text: message }], isError: true }
}

const NOT_CONFIGURED =
    'Google Search Console is not configured. Set GOOGLE_CLIENT_EMAIL, ' +
    'GOOGLE_PRIVATE_KEY and GOOGLE_SEARCH_CONSOLE_SITE_URL in apps/admin/.env ' +
    'and restart the MCP server.'

/**
 * Run a tool body with the two failure modes every tool shares: missing
 * credentials, and an API call that threw.
 *
 * @param label - Human-readable operation name, used in the error message
 * @param run - The tool body
 */
async function handle(
    label: string,
    run: () => Promise<string>
): Promise<ToolResult> {
    if (!isSearchConsoleConfigured()) return fail(NOT_CONFIGURED)

    try {
        return ok(await run())
    } catch (error) {
        const detail = error instanceof Error ? error.message : String(error)
        return fail(`${label} failed: ${detail}`)
    }
}

/** Build the window stamp attached to every date-ranged result. */
function windowFor(days: number) {
    return { ...getDateRange(days), days }
}

// ============================================================================
// Server
// ============================================================================

/**
 * Build the MCP server with every Search Console tool registered.
 */
export function createServer(): McpServer {
    const server = new McpServer({
        name: 'search-console',
        version: '0.0.1',
    })

    server.registerTool(
        'summary',
        {
            title: 'Search Console summary',
            description:
                'Site-wide totals for a period: clicks, impressions, average CTR and average position, plus the single top query. Start here to size up organic performance before drilling in.',
            inputSchema: z.object({ days: daysSchema }),
        },
        async ({ days }) =>
            handle('summary', async () =>
                formatResult(
                    await getSearchConsoleSummary(days),
                    windowFor(days)
                )
            )
    )

    server.registerTool(
        'top_queries',
        {
            title: 'Top search queries',
            description:
                'The queries bringing the site the most search traffic, with clicks, impressions, CTR and average position. Use it to learn the vocabulary real visitors search with before drafting copy.',
            inputSchema: z.object({
                days: daysSchema,
                limit: limitSchema(25),
                orderBy: orderBySchema,
                orderDirection: orderDirectionSchema,
            }),
        },
        async ({ days, limit, orderBy, orderDirection }) =>
            handle('top_queries', async () =>
                formatResult(
                    await getTopQueries(days, limit, orderBy, orderDirection),
                    windowFor(days)
                )
            )
    )

    server.registerTool(
        'search_queries',
        {
            title: 'Search queries by term',
            description:
                'Every query containing a given term, with its metrics — e.g. "bbl" surfaces all the phrasings people actually use around that procedure. Returns top queries when the term is empty.',
            inputSchema: z.object({
                term: z
                    .string()
                    .default('')
                    .describe('Substring matched case-insensitively'),
                days: daysSchema,
                limit: limitSchema(50),
                orderBy: orderBySchema,
                orderDirection: orderDirectionSchema,
            }),
        },
        async ({ term, days, limit, orderBy, orderDirection }) =>
            handle('search_queries', async () =>
                formatResult(
                    await getQueriesByTerm(
                        term,
                        days,
                        limit,
                        orderBy,
                        orderDirection
                    ),
                    windowFor(days)
                )
            )
    )

    server.registerTool(
        'query_trend',
        {
            title: 'Query trend over time',
            description:
                'Daily clicks, impressions, CTR and position for one exact query. Use it to check whether a keyword is gaining or slipping before deciding to refresh the page targeting it.',
            inputSchema: z.object({
                query: z
                    .string()
                    .min(1)
                    .describe('Exact query string, as it appears in GSC'),
                days: daysSchema,
            }),
        },
        async ({ query, days }) =>
            handle('query_trend', async () =>
                formatResult(await getQueryTrend(query, days), windowFor(days))
            )
    )

    server.registerTool(
        'top_pages',
        {
            title: 'Top pages',
            description:
                'The pages earning the most search traffic, with clicks, impressions, CTR and average position.',
            inputSchema: z.object({
                days: daysSchema,
                limit: limitSchema(25),
                orderBy: orderBySchema,
                orderDirection: orderDirectionSchema,
            }),
        },
        async ({ days, limit, orderBy, orderDirection }) =>
            handle('top_pages', async () =>
                formatResult(
                    await getTopPages(days, limit, orderBy, orderDirection),
                    windowFor(days)
                )
            )
    )

    server.registerTool(
        'search_pages',
        {
            title: 'Search pages',
            description:
                'Pages filtered by path substring and/or content type, with their search metrics. Use it to pull performance for a whole section, e.g. every procedure page.',
            inputSchema: z.object({
                term: z
                    .string()
                    .default('')
                    .describe('Substring matched against the page path'),
                pageType: pageTypeSchema,
                days: daysSchema,
                limit: limitSchema(100),
                orderBy: orderBySchema,
                orderDirection: orderDirectionSchema,
            }),
        },
        async ({ term, pageType, days, limit, orderBy, orderDirection }) =>
            handle('search_pages', async () =>
                formatResult(
                    await searchPages({
                        term,
                        pageType,
                        days,
                        limit,
                        orderBy,
                        orderDirection,
                    }),
                    windowFor(days)
                )
            )
    )

    server.registerTool(
        'queries_for_page',
        {
            title: 'Queries driving a page',
            description:
                'Every query that surfaced one specific page, ranked by clicks. This is the primary tool for tailoring existing content: it shows what a page is already being found for, including intents the copy never addressed.',
            inputSchema: z.object({
                page: z
                    .string()
                    .min(1)
                    .describe('Full page URL, exactly as GSC reports it'),
                days: daysSchema,
                limit: limitSchema(100),
            }),
        },
        async ({ page, days, limit }) =>
            handle('queries_for_page', async () =>
                formatResult(
                    await getQueriesForPage(page, days, limit),
                    windowFor(days)
                )
            )
    )

    server.registerTool(
        'pages_for_query',
        {
            title: 'Pages ranking for a query',
            description:
                'Every page that ranked for one exact query. Two or more pages sharing a query is keyword cannibalization — check this before writing another page on a topic the site already covers.',
            inputSchema: z.object({
                query: z.string().min(1).describe('Exact query string'),
                days: daysSchema,
                limit: limitSchema(25),
            }),
        },
        async ({ query, days, limit }) =>
            handle('pages_for_query', async () =>
                formatResult(
                    await getPagesForQuery(query, days, limit),
                    windowFor(days)
                )
            )
    )

    server.registerTool(
        'page_trend',
        {
            title: 'Page trend over time',
            description:
                'Daily clicks, impressions, CTR and position for one page. Use it to measure whether a rewrite actually moved anything.',
            inputSchema: z.object({
                page: z.string().min(1).describe('Full page URL'),
                days: daysSchema,
            }),
        },
        async ({ page, days }) =>
            handle('page_trend', async () =>
                formatResult(await getPageTrend(page, days), windowFor(days))
            )
    )

    server.registerTool(
        'content_opportunities',
        {
            title: 'Content opportunities',
            description:
                'Queries with real impression volume but CTR below 5%, ranked by the clicks a benchmark CTR would add. Each carries a suggested action based on current rank — retitle, rewrite meta, or build dedicated content.',
            inputSchema: z.object({
                days: daysSchema,
                limit: limitSchema(25),
            }),
        },
        async ({ days, limit }) =>
            handle('content_opportunities', async () =>
                formatResult(
                    await getContentOpportunities(days, limit),
                    windowFor(days)
                )
            )
    )

    server.registerTool(
        'content_gaps',
        {
            title: 'Content gaps',
            description:
                'Queries the site gets impressions for with no page dedicated to them — the strongest signal for what to write next. Ranked by impressions.',
            inputSchema: z.object({
                days: daysSchema,
                limit: limitSchema(25),
            }),
        },
        async ({ days, limit }) =>
            handle('content_gaps', async () =>
                formatResult(await getContentGaps(days, limit), windowFor(days))
            )
    )

    server.registerTool(
        'position_changes',
        {
            title: 'Ranking winners and losers',
            description:
                'Queries whose average position moved most between this period and the one immediately before it, split into winners and losers. Use the losers list to decide what needs a refresh.',
            inputSchema: z.object({
                days: z
                    .number()
                    .int()
                    .min(1)
                    .max(180)
                    .default(7)
                    .describe(
                        'Length of each period; the comparison window is twice this'
                    ),
                limit: limitSchema(20),
            }),
        },
        async ({ days, limit }) =>
            handle('position_changes', async () =>
                formatResult(
                    await getPositionChanges(days, limit),
                    windowFor(days)
                )
            )
    )

    server.registerTool(
        'performance_trend',
        {
            title: 'Site performance trend',
            description:
                'Site-wide daily clicks, impressions, CTR and position — the shape of organic traffic over time.',
            inputSchema: z.object({ days: daysSchema }),
        },
        async ({ days }) =>
            handle('performance_trend', async () =>
                formatResult(await getPerformanceTrend(days), windowFor(days))
            )
    )

    server.registerTool(
        'inspect_url',
        {
            title: 'Inspect a URL',
            description:
                'Live index status for one URL: whether Google has it indexed, its coverage state, robots.txt verdict, last crawl time and mobile usability. Quota is 2,000 calls/day — use it on specific URLs, not in bulk.',
            inputSchema: z.object({
                url: z
                    .string()
                    .min(1)
                    .describe('Full URL, inside the configured property'),
            }),
        },
        async ({ url }) =>
            handle('inspect_url', async () =>
                formatResult(await inspectUrl(url))
            )
    )

    server.registerTool(
        'list_sitemaps',
        {
            title: 'List sitemaps',
            description:
                'Submitted sitemaps with their submission and download times, warnings, errors, and submitted-vs-indexed counts per content type.',
            inputSchema: z.object({}),
        },
        async () =>
            handle('list_sitemaps', async () =>
                formatResult(await getSitemaps())
            )
    )

    return server
}
