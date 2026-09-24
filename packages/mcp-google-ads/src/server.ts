/**
 * Google Ads MCP server
 *
 * Exposes `@workspace/google-ads` as MCP tools so Claude agents can read the
 * practice's ad account — spend, search terms, keywords, landing pages,
 * conversion actions, change history and gclid lookups — instead of scraping
 * the Google Ads UI through a browser.
 *
 * Read-only by design: the data layer only calls search endpoints, and the
 * service account is a Read only user on the account.
 *
 * @module @workspace/mcp-google-ads/server
 */
import { McpServer } from '@modelcontextprotocol/server'
import {
    CHANGE_HISTORY_MAX_DAYS,
    getAccountOverview,
    getCampaignPerformance,
    getChangeHistory,
    getConversionActions,
    getDailyTrend,
    getKeywordPerformance,
    getLandingPages,
    getSearchTerms,
    isGoogleAdsConfigured,
    lookupClicks,
    runGaql,
    searchGoogleAdsFields,
} from '@workspace/google-ads'
import { z } from 'zod'

import { formatResult } from './format.util.js'

/** Shape every tool handler returns. */
type ToolResult = {
    content: { type: 'text'; text: string }[]
    isError?: boolean
}

// ============================================================================
// Shared parameter schemas
// ============================================================================

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD')

/** Window parameters shared by every date-ranged report. */
const rangeShape = {
    days: z
        .number()
        .int()
        .min(1)
        .max(730)
        .default(30)
        .describe(
            'Window length in days, ending yesterday in the account time zone (America/New_York). Ignored when startDate is given.'
        ),
    startDate: isoDate
        .optional()
        .describe('First day, inclusive (YYYY-MM-DD). Overrides days.'),
    endDate: isoDate
        .optional()
        .describe(
            'Last day, inclusive (YYYY-MM-DD). Defaults to yesterday; pass today for live numbers.'
        ),
}

const campaignIdSchema = z
    .string()
    .regex(/^\d+$/)
    .optional()
    .describe('Limit to one campaign (numeric id from campaign_performance)')

const orderBySchema = z
    .enum(['cost', 'clicks', 'impressions', 'conversions'])
    .default('cost')
    .describe('Metric to rank by, descending')

const limitSchema = (fallback: number, max = 1000) =>
    z.number().int().min(1).max(max).default(fallback)

// ============================================================================
// Handler plumbing
// ============================================================================

function ok(text: string): ToolResult {
    return { content: [{ type: 'text', text }] }
}

function fail(message: string): ToolResult {
    return { content: [{ type: 'text', text: message }], isError: true }
}

const NOT_CONFIGURED =
    'Google Ads is not configured. Set GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY ' +
    'and GOOGLE_ADS_CUSTOMER_ID in apps/admin/.env and restart the MCP server. ' +
    'The service account must be a user on the Google Ads account.'

/**
 * Run a tool body with the failure modes every tool shares: missing
 * configuration, and an API call that threw. Google Ads errors carry the
 * API's own explanation (e.g. which GAQL field is invalid), passed through.
 */
async function handle(
    label: string,
    run: () => Promise<unknown>
): Promise<ToolResult> {
    if (!isGoogleAdsConfigured()) return fail(NOT_CONFIGURED)

    try {
        return ok(formatResult(await run()))
    } catch (error) {
        const detail = error instanceof Error ? error.message : String(error)
        return fail(`${label} failed: ${detail}`)
    }
}

// ============================================================================
// Server
// ============================================================================

/**
 * Build the MCP server with every Google Ads tool registered.
 */
export function createServer(): McpServer {
    const server = new McpServer({ name: 'google-ads', version: '0.0.1' })

    server.registerTool(
        'account_overview',
        {
            title: 'Account overview',
            description:
                'Account settings (name, currency, time zone, auto-tagging, account-level tracking template and final URL suffix) plus total spend, clicks, impressions, conversions and cost per conversion for a window. Start here.',
            inputSchema: z.object(rangeShape),
        },
        async (input) =>
            handle('account_overview', () => getAccountOverview(input))
    )

    server.registerTool(
        'campaign_performance',
        {
            title: 'Campaign performance',
            description:
                'Per-campaign spend, impressions, clicks, CTR, average CPC, conversions, cost per conversion, status, channel (SEARCH / PERFORMANCE_MAX / …), bidding strategy and daily budget, most expensive first, with account totals. Search campaigns also report impression share and the share lost to budget and to rank. Paused campaigns with no impressions in the window are hidden unless includeInactive is true.',
            inputSchema: z.object({
                ...rangeShape,
                includeInactive: z
                    .boolean()
                    .default(false)
                    .describe(
                        'Also list campaigns with no impressions in the window'
                    ),
            }),
        },
        async (input) =>
            handle('campaign_performance', () => getCampaignPerformance(input))
    )

    server.registerTool(
        'daily_trend',
        {
            title: 'Daily trend',
            description:
                'Spend, impressions, clicks and conversions per day for the account or one campaign. Use it to spot overspend days, pauses, and when a change took effect.',
            inputSchema: z.object({
                ...rangeShape,
                campaignId: campaignIdSchema,
            }),
        },
        async (input) => handle('daily_trend', () => getDailyTrend(input))
    )

    server.registerTool(
        'search_terms',
        {
            title: 'Search terms',
            description:
                'The actual queries people typed before clicking a Search ad, with the campaign and ad group, match type, status (ADDED = already a keyword, EXCLUDED = already negative, NONE = neither), spend, clicks and conversions. Use it to find wasted spend, competitor-name queries and negative-keyword candidates. Performance Max search terms are not available here.',
            inputSchema: z.object({
                ...rangeShape,
                campaignId: campaignIdSchema,
                contains: z
                    .string()
                    .optional()
                    .describe(
                        'Only terms containing this text (case-insensitive), e.g. "bbl"'
                    ),
                orderBy: orderBySchema,
                limit: limitSchema(100),
            }),
        },
        async (input) => handle('search_terms', () => getSearchTerms(input))
    )

    server.registerTool(
        'keywords',
        {
            title: 'Keyword performance',
            description:
                'Keywords with match type, status, quality score (1–10, null when Google has too little data), spend, clicks, CTR, CPC, conversions and search impression share.',
            inputSchema: z.object({
                ...rangeShape,
                campaignId: campaignIdSchema,
                orderBy: orderBySchema,
                limit: limitSchema(100),
            }),
        },
        async (input) => handle('keywords', () => getKeywordPerformance(input))
    )

    server.registerTool(
        'landing_pages',
        {
            title: 'Landing pages',
            description:
                'Clicks, spend and conversions by landing page, busiest first. Each row rolls up every tagged variant of one page (`urlVariants`); `sampleUrl` keeps the tracking parameters, so a broken ValueTrack template shows up. With expanded=true it reports the pages actually served, including ones Performance Max picked through URL expansion (e.g. blog posts).',
            inputSchema: z.object({
                ...rangeShape,
                expanded: z
                    .boolean()
                    .default(false)
                    .describe(
                        'Report served URLs instead of configured final URLs'
                    ),
                limit: limitSchema(50, 500),
            }),
        },
        async (input) => handle('landing_pages', () => getLandingPages(input))
    )

    server.registerTool(
        'conversion_actions',
        {
            title: 'Conversion actions',
            description:
                'Every conversion action with its type, origin, counting type, whether it is primary (counts in "Conversions", which bidding optimizes for) and what it recorded in the window, in both "Conversions" and "All conversions". Check this first when conversion numbers look wrong.',
            inputSchema: z.object(rangeShape),
        },
        async (input) =>
            handle('conversion_actions', () => getConversionActions(input))
    )

    server.registerTool(
        'change_history',
        {
            title: 'Change history',
            description: `Who changed what in the account, newest first: user email, client (web UI, API, …), resource type, operation and changed fields, with campaign and ad group names. With includeValues it adds the old and new value of each changed field (budgets in currency). Covers today and the ${CHANGE_HISTORY_MAX_DAYS} days before it at most.`,
            inputSchema: z.object({
                days: z
                    .number()
                    .int()
                    .min(1)
                    .max(CHANGE_HISTORY_MAX_DAYS)
                    .default(7)
                    .describe('Look-back including today'),
                resourceType: z
                    .string()
                    .optional()
                    .describe(
                        'Filter, e.g. CAMPAIGN, CAMPAIGN_BUDGET, AD_GROUP, AD_GROUP_AD, AD_GROUP_CRITERION, CAMPAIGN_CRITERION, ASSET, ASSET_GROUP'
                    ),
                includeValues: z
                    .boolean()
                    .default(false)
                    .describe('Attach old → new values per changed field'),
                limit: limitSchema(100),
            }),
        },
        async (input) => handle('change_history', () => getChangeHistory(input))
    )

    server.registerTool(
        'lookup_click',
        {
            title: 'Look up Google click ids',
            description:
                "Resolve gclids (from a lead's gclid column or a landing URL) to the campaign, ad group, keyword and match type, device and network behind each click. Needs the lead's date; it also searches `daysBefore` earlier days, since people click and submit on different days. Only the last 90 days are queryable, and each day searched costs one API operation. gbraid/wbraid (iOS) clicks cannot be looked up this way.",
            inputSchema: z.object({
                gclids: z.array(z.string().min(10)).min(1).max(100),
                date: isoDate.describe(
                    "The lead's date (YYYY-MM-DD, America/New_York)"
                ),
                daysBefore: z
                    .number()
                    .int()
                    .min(0)
                    .max(30)
                    .default(3)
                    .describe('Extra days to search before date'),
            }),
        },
        async (input) => handle('lookup_click', () => lookupClicks(input))
    )

    server.registerTool(
        'list_fields',
        {
            title: 'List GAQL fields',
            description:
                'GAQL field metadata for writing gaql_search queries: every field whose name starts with a prefix, with its category (ATTRIBUTE / METRIC / SEGMENT), type, enum values, and whether it can be selected, filtered and sorted. E.g. prefix "search_term_view." or "metrics.search_".',
            inputSchema: z.object({
                prefix: z
                    .string()
                    .min(2)
                    .describe(
                        'Field-name prefix, e.g. "campaign." or "metrics.cost"'
                    ),
            }),
        },
        async ({ prefix }) =>
            handle('list_fields', () =>
                searchGoogleAdsFields(`${prefix.replace(/%/g, '')}%`)
            )
    )

    server.registerTool(
        'gaql_search',
        {
            title: 'Run a GAQL query',
            description:
                "Run any read-only GAQL query when no other tool fits. Rows come back keyed by GAQL field name; *_micros fields drop the suffix and arrive in dollars, as do average_cpc and cost_per_conversion. GAQL rules: dates are account-zone days (segments.date BETWEEN 'YYYY-MM-DD' AND 'YYYY-MM-DD' or DURING LAST_30_DAYS); WHERE supports AND only; click_view needs a single segments.date; change_event needs a LIMIT and a window within 30 days. Use list_fields to check field names.",
            inputSchema: z.object({
                query: z.string().min(10).describe('A GAQL SELECT statement'),
                maxRows: limitSchema(500, 5000).describe(
                    'Row cap across pages'
                ),
            }),
        },
        async ({ query, maxRows }) =>
            handle('gaql_search', () => runGaql(query, maxRows))
    )

    return server
}
