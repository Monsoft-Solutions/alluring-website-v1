/**
 * Google Ads daily reports
 *
 * Per-day variants of the account reports (`segments.date` in the SELECT),
 * shaped for the admin's snapshot tables: one row per day and per the
 * table's key, every metric present, money in dollars. The admin stores these
 * in Postgres so its pages never call the API and click details outlive
 * Google's retention.
 *
 * Rows are rolled up by their key here. The API can split what the snapshot
 * treats as one row — landing-page URL variants always, and anything else if
 * a segment sneaks in — and a duplicate key would fail the insert.
 *
 * Each function is one GAQL query, i.e. one API operation per 10,000 rows.
 *
 * @module @workspace/google-ads — daily reports
 */
import { searchGaql } from './google-ads-client.service.js'
import { assertIsoDate, daysBetween } from './google-ads-dates.util.js'
import { dateClause } from './google-ads-gaql.util.js'
import { landingPagePath } from './google-ads-reports.service.js'
import type { FlatRow } from './google-ads.type.js'

/** Upper bound on rows per daily report — far above a 30-day window's size. */
const DAILY_MAX_ROWS = 200_000

/** An explicit, inclusive account-zone window. */
export type DailyRange = {
    startDate: string
    endDate: string
}

/** The metrics every daily snapshot row carries. */
export type DailyMetrics = {
    impressions: number
    clicks: number
    cost: number
    conversions: number
    allConversions: number
}

const DAILY_METRIC_FIELDS = [
    'metrics.impressions',
    'metrics.clicks',
    'metrics.cost_micros',
    'metrics.conversions',
    'metrics.all_conversions',
].join(', ')

function num(row: FlatRow, key: string): number {
    const value = row[key]
    return typeof value === 'number' ? value : Number(value ?? 0) || 0
}

function str(row: FlatRow, key: string): string {
    const value = row[key]
    return value === null || value === undefined ? '' : String(value)
}

function round(value: number, decimals = 2): number {
    const factor = 10 ** decimals
    return Math.round(value * factor) / factor
}

function metricsOf(row: FlatRow): DailyMetrics {
    return {
        impressions: num(row, 'metrics.impressions'),
        clicks: num(row, 'metrics.clicks'),
        cost: round(num(row, 'metrics.cost')),
        conversions: round(num(row, 'metrics.conversions')),
        allConversions: round(num(row, 'metrics.all_conversions')),
    }
}

/** Add `from`'s metrics into `into`, keeping money at cents. */
function addMetrics(into: DailyMetrics, from: DailyMetrics): void {
    into.impressions += from.impressions
    into.clicks += from.clicks
    into.cost = round(into.cost + from.cost)
    into.conversions = round(into.conversions + from.conversions)
    into.allConversions = round(into.allConversions + from.allConversions)
}

/** Whether a row recorded anything — empty rows are not worth storing. */
function hasActivity(metrics: DailyMetrics): boolean {
    return (
        metrics.impressions > 0 ||
        metrics.clicks > 0 ||
        metrics.cost > 0 ||
        metrics.conversions > 0 ||
        metrics.allConversions > 0
    )
}

/**
 * Merge rows that share a key, summing their metrics. The first row seen
 * keeps its descriptive fields.
 */
export function rollUpDaily<T extends DailyMetrics>(
    rows: T[],
    keyOf: (row: T) => string
): T[] {
    const byKey = new Map<string, T>()
    for (const row of rows) {
        const key = keyOf(row)
        const existing = byKey.get(key)
        if (existing) addMetrics(existing, row)
        else byKey.set(key, { ...row })
    }
    return [...byKey.values()]
}

function assertRange(range: DailyRange): void {
    assertIsoDate(range.startDate, 'startDate')
    assertIsoDate(range.endDate, 'endDate')
    if (range.startDate > range.endDate) {
        throw new Error(
            `startDate ${range.startDate} is after endDate ${range.endDate}`
        )
    }
}

function clauseFor(range: DailyRange): string {
    assertRange(range)
    return dateClause({
        ...range,
        days: daysBetween(range.startDate, range.endDate),
    })
}

// ============================================================================
// Campaigns
// ============================================================================

export type CampaignDailyRow = DailyMetrics & {
    date: string
    campaignId: string
    campaignName: string
    status: string
    channel: string
    biddingStrategy: string
    dailyBudget: number | null
    /** Search campaigns only; null elsewhere. */
    searchImpressionShare: number | null
    searchBudgetLostImpressionShare: number | null
    searchRankLostImpressionShare: number | null
}

/** Spend and delivery per campaign per day, removed campaigns included. */
export async function getCampaignDaily(
    range: DailyRange
): Promise<CampaignDailyRow[]> {
    const { rows } = await searchGaql(
        `SELECT segments.date, campaign.id, campaign.name, campaign.status,
            campaign.advertising_channel_type, campaign.bidding_strategy_type,
            campaign_budget.amount_micros, ${DAILY_METRIC_FIELDS},
            metrics.search_impression_share,
            metrics.search_budget_lost_impression_share,
            metrics.search_rank_lost_impression_share
        FROM campaign
        WHERE ${clauseFor(range)}`,
        { maxRows: DAILY_MAX_ROWS }
    )

    const mapped = rows.map((row): CampaignDailyRow => {
        const isSearch =
            str(row, 'campaign.advertising_channel_type') === 'SEARCH'
        const share = (key: string) =>
            isSearch && row[key] !== null ? round(num(row, key), 4) : null
        return {
            date: str(row, 'segments.date'),
            campaignId: str(row, 'campaign.id'),
            campaignName: str(row, 'campaign.name'),
            status: str(row, 'campaign.status'),
            channel: str(row, 'campaign.advertising_channel_type'),
            biddingStrategy: str(row, 'campaign.bidding_strategy_type'),
            dailyBudget:
                row['campaign_budget.amount'] === null ||
                row['campaign_budget.amount'] === undefined
                    ? null
                    : num(row, 'campaign_budget.amount'),
            ...metricsOf(row),
            searchImpressionShare: share('metrics.search_impression_share'),
            searchBudgetLostImpressionShare: share(
                'metrics.search_budget_lost_impression_share'
            ),
            searchRankLostImpressionShare: share(
                'metrics.search_rank_lost_impression_share'
            ),
        }
    })

    return rollUpDaily(
        mapped.filter(hasActivity),
        (row) => `${row.date}|${row.campaignId}`
    )
}

// ============================================================================
// Keywords
// ============================================================================

export type KeywordDailyRow = DailyMetrics & {
    date: string
    campaignId: string
    campaignName: string
    adGroupId: string
    adGroupName: string
    criterionId: string
    keyword: string
    matchType: string
    status: string
    qualityScore: number | null
}

/** Keyword delivery per day. Search campaigns only. */
export async function getKeywordDaily(
    range: DailyRange
): Promise<KeywordDailyRow[]> {
    const { rows } = await searchGaql(
        `SELECT segments.date, campaign.id, campaign.name, ad_group.id,
            ad_group.name, ad_group_criterion.criterion_id,
            ad_group_criterion.keyword.text,
            ad_group_criterion.keyword.match_type, ad_group_criterion.status,
            ad_group_criterion.quality_info.quality_score,
            ${DAILY_METRIC_FIELDS}
        FROM keyword_view
        WHERE ${clauseFor(range)}`,
        { maxRows: DAILY_MAX_ROWS }
    )

    const mapped = rows.map((row): KeywordDailyRow => {
        const quality = row['ad_group_criterion.quality_info.quality_score']
        return {
            date: str(row, 'segments.date'),
            campaignId: str(row, 'campaign.id'),
            campaignName: str(row, 'campaign.name'),
            adGroupId: str(row, 'ad_group.id'),
            adGroupName: str(row, 'ad_group.name'),
            criterionId: str(row, 'ad_group_criterion.criterion_id'),
            keyword: str(row, 'ad_group_criterion.keyword.text'),
            matchType: str(row, 'ad_group_criterion.keyword.match_type'),
            status: str(row, 'ad_group_criterion.status'),
            qualityScore:
                quality === null || quality === undefined
                    ? null
                    : Number(quality),
            ...metricsOf(row),
        }
    })

    return rollUpDaily(
        mapped.filter(hasActivity),
        (row) => `${row.date}|${row.adGroupId}|${row.criterionId}`
    )
}

// ============================================================================
// Search terms
// ============================================================================

export type SearchTermDailyRow = DailyMetrics & {
    date: string
    campaignId: string
    campaignName: string
    adGroupId: string
    adGroupName: string
    searchTerm: string
    matchType: string
    /** ADDED / EXCLUDED / NONE. */
    status: string
}

/** What people typed, per day. Performance Max terms are not exposed. */
export async function getSearchTermDaily(
    range: DailyRange
): Promise<SearchTermDailyRow[]> {
    const { rows } = await searchGaql(
        `SELECT segments.date, campaign.id, campaign.name, ad_group.id,
            ad_group.name, search_term_view.search_term,
            search_term_view.status, segments.search_term_match_type,
            ${DAILY_METRIC_FIELDS}
        FROM search_term_view
        WHERE ${clauseFor(range)}`,
        { maxRows: DAILY_MAX_ROWS }
    )

    const mapped = rows.map(
        (row): SearchTermDailyRow => ({
            date: str(row, 'segments.date'),
            campaignId: str(row, 'campaign.id'),
            campaignName: str(row, 'campaign.name'),
            adGroupId: str(row, 'ad_group.id'),
            adGroupName: str(row, 'ad_group.name'),
            searchTerm: str(row, 'search_term_view.search_term'),
            matchType: str(row, 'segments.search_term_match_type'),
            status: str(row, 'search_term_view.status'),
            ...metricsOf(row),
        })
    )

    return rollUpDaily(
        mapped.filter(hasActivity),
        (row) =>
            `${row.date}|${row.adGroupId}|${row.searchTerm}|${row.matchType}`
    )
}

// ============================================================================
// Landing pages
// ============================================================================

export type LandingPageDailyRow = DailyMetrics & {
    date: string
    campaignId: string
    page: string
    expanded: boolean
    urlVariants: number
    sampleUrl: string
}

/**
 * Delivery per landing page, campaign and day, tagged URL variants rolled up
 * to the page.
 *
 * @param expanded - Report the URLs actually served (Performance Max URL
 *   expansion included) instead of the configured final URLs
 */
export async function getLandingPageDaily(
    range: DailyRange,
    expanded = false
): Promise<LandingPageDailyRow[]> {
    const [resource, field] = expanded
        ? ['expanded_landing_page_view', 'expanded_final_url']
        : ['landing_page_view', 'unexpanded_final_url']

    const { rows } = await searchGaql(
        `SELECT segments.date, campaign.id, ${resource}.${field},
            ${DAILY_METRIC_FIELDS}
        FROM ${resource}
        WHERE ${clauseFor(range)}
        ORDER BY metrics.clicks DESC`,
        { maxRows: DAILY_MAX_ROWS }
    )

    // Rows arrive busiest first, so the first URL kept per page is the sample.
    const byKey = new Map<string, LandingPageDailyRow>()
    for (const row of rows) {
        const metrics = metricsOf(row)
        if (!hasActivity(metrics)) continue
        const url = str(row, `${resource}.${field}`)
        const date = str(row, 'segments.date')
        const campaignId = str(row, 'campaign.id')
        const page = landingPagePath(url)
        const key = `${date}|${campaignId}|${page}`
        const existing = byKey.get(key)
        if (existing) {
            existing.urlVariants += 1
            addMetrics(existing, metrics)
            continue
        }
        byKey.set(key, {
            date,
            campaignId,
            page,
            expanded,
            urlVariants: 1,
            sampleUrl: url,
            ...metrics,
        })
    }
    return [...byKey.values()]
}

// ============================================================================
// Conversion actions
// ============================================================================

export type ConversionDailyRow = {
    date: string
    conversionActionId: string
    actionName: string
    category: string
    origin: string
    type: string
    status: string
    primaryForGoal: boolean
    conversions: number
    allConversions: number
}

/**
 * What each conversion action counted per day, with its settings. Actions
 * that recorded nothing on a day have no row for it.
 */
export async function getConversionDaily(
    range: DailyRange
): Promise<ConversionDailyRow[]> {
    const [actions, counts] = await Promise.all([
        searchGaql(
            `SELECT conversion_action.resource_name, conversion_action.id,
                conversion_action.name, conversion_action.status,
                conversion_action.category, conversion_action.type,
                conversion_action.origin, conversion_action.primary_for_goal
            FROM conversion_action`
        ),
        searchGaql(
            `SELECT segments.date, segments.conversion_action,
                segments.conversion_action_name, metrics.conversions,
                metrics.all_conversions
            FROM customer
            WHERE ${clauseFor(range)}`,
            { maxRows: DAILY_MAX_ROWS }
        ),
    ])

    const byResource = new Map(
        actions.rows.map((row) => [
            str(row, 'conversion_action.resource_name'),
            row,
        ])
    )

    const mapped: ConversionDailyRow[] = []
    for (const row of counts.rows) {
        const resourceName = str(row, 'segments.conversion_action')
        const action = byResource.get(resourceName)
        const conversions = round(num(row, 'metrics.conversions'))
        const allConversions = round(num(row, 'metrics.all_conversions'))
        if (conversions === 0 && allConversions === 0) continue
        mapped.push({
            date: str(row, 'segments.date'),
            conversionActionId: action
                ? str(action, 'conversion_action.id')
                : (resourceName.split('/').pop() ?? resourceName),
            actionName: action
                ? str(action, 'conversion_action.name')
                : str(row, 'segments.conversion_action_name'),
            category: action ? str(action, 'conversion_action.category') : '',
            origin: action ? str(action, 'conversion_action.origin') : '',
            type: action ? str(action, 'conversion_action.type') : '',
            status: action ? str(action, 'conversion_action.status') : '',
            primaryForGoal: action
                ? action['conversion_action.primary_for_goal'] === true
                : false,
            conversions,
            allConversions,
        })
    }

    const byKey = new Map<string, ConversionDailyRow>()
    for (const row of mapped) {
        const key = `${row.date}|${row.conversionActionId}`
        const existing = byKey.get(key)
        if (existing) {
            existing.conversions = round(existing.conversions + row.conversions)
            existing.allConversions = round(
                existing.allConversions + row.allConversions
            )
        } else {
            byKey.set(key, { ...row })
        }
    }
    return [...byKey.values()]
}
