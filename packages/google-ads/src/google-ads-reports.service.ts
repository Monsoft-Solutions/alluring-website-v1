/**
 * Google Ads reports
 *
 * The questions the practice actually asks of its ad account, each as one
 * typed function: where the money went, what people searched, which keywords
 * and pages carried it, which conversions count, who changed what, and which
 * campaign a lead's click came from. Shared by the `google-ads` MCP server and,
 * later, the admin dashboard.
 *
 * GAQL traps these functions absorb so callers don't have to:
 * - dates are account-zone calendar days (see google-ads-dates.util)
 * - zero values are omitted by the API; rows here always carry every field
 * - money arrives in micros; here it is account currency
 * - click_view accepts a single day per query and only the last 90 days
 * - change_event needs a LIMIT and a window inside the last 30 days
 *
 * @module @workspace/google-ads — reports
 */
import { getGoogleAdsConfig } from './google-ads-config.util.js'
import { searchGaql, searchGaqlRaw } from './google-ads-client.service.js'
import {
    addDays,
    assertIsoDate,
    daysBetween,
    resolveDateRange,
    todayIn,
} from './google-ads-dates.util.js'
import {
    assertNumericId,
    assertSelectQuery,
    dateClause,
    gaqlLikeContains,
    gaqlString,
} from './google-ads-gaql.util.js'
import { camelToSnake } from './google-ads-rows.util.js'
import type {
    DateRange,
    FlatRow,
    GaqlSearchResult,
    RawRow,
} from './google-ads.type.js'

// ============================================================================
// Shared input + row helpers
// ============================================================================

/** A reporting window: `days` ending yesterday, or explicit dates. */
export type RangeInput = {
    days?: number
    startDate?: string
    endDate?: string
}

/** Resolve a window in the account's time zone. */
export function getReportRange(input: RangeInput = {}): DateRange {
    return resolveDateRange({
        ...input,
        timeZone: getGoogleAdsConfig().timeZone,
    })
}

function num(row: FlatRow, key: string): number {
    const value = row[key]
    return typeof value === 'number' ? value : Number(value ?? 0) || 0
}

function str(row: FlatRow, key: string): string {
    const value = row[key]
    return value === null || value === undefined ? '' : String(value)
}

function optStr(row: FlatRow, key: string): string | null {
    const value = row[key]
    return value === null || value === undefined || value === ''
        ? null
        : String(value)
}

function round(value: number, decimals = 2): number {
    const factor = 10 ** decimals
    return Math.round(value * factor) / factor
}

/** Cost per conversion, or null when nothing converted. */
function costPer(cost: number, conversions: number): number | null {
    return conversions > 0 ? round(cost / conversions) : null
}

/** Standard delivery metrics every performance report shares. */
export type DeliveryMetrics = {
    impressions: number
    clicks: number
    cost: number
    conversions: number
    conversionsValue: number
}

const DELIVERY_FIELDS = [
    'metrics.impressions',
    'metrics.clicks',
    'metrics.cost_micros',
    'metrics.conversions',
    'metrics.conversions_value',
]

function delivery(row: FlatRow): DeliveryMetrics {
    return {
        impressions: num(row, 'metrics.impressions'),
        clicks: num(row, 'metrics.clicks'),
        cost: num(row, 'metrics.cost'),
        conversions: round(num(row, 'metrics.conversions')),
        conversionsValue: round(num(row, 'metrics.conversions_value')),
    }
}

/** Sum delivery metrics and derive the ratios. */
export function totalsOf(rows: DeliveryMetrics[]) {
    const sum = rows.reduce(
        (acc, row) => ({
            impressions: acc.impressions + row.impressions,
            clicks: acc.clicks + row.clicks,
            cost: acc.cost + row.cost,
            conversions: acc.conversions + row.conversions,
            conversionsValue: acc.conversionsValue + row.conversionsValue,
        }),
        {
            impressions: 0,
            clicks: 0,
            cost: 0,
            conversions: 0,
            conversionsValue: 0,
        }
    )
    return {
        ...sum,
        cost: round(sum.cost),
        conversions: round(sum.conversions),
        conversionsValue: round(sum.conversionsValue),
        ctr: sum.impressions > 0 ? round(sum.clicks / sum.impressions, 4) : 0,
        averageCpc: sum.clicks > 0 ? round(sum.cost / sum.clicks) : 0,
        costPerConversion: costPer(sum.cost, sum.conversions),
    }
}

/** Optional `AND campaign.id = N`. */
function campaignFilter(campaignId?: string): string {
    return campaignId
        ? ` AND campaign.id = ${assertNumericId(campaignId, 'campaignId')}`
        : ''
}

// ============================================================================
// Account
// ============================================================================

/** Account settings plus delivery totals for a window. */
export async function getAccountOverview(input: RangeInput = {}) {
    const range = getReportRange(input)
    const { rows } = await searchGaql(
        `SELECT customer.id, customer.descriptive_name, customer.currency_code,
            customer.time_zone, customer.status, customer.auto_tagging_enabled,
            customer.tracking_url_template, customer.final_url_suffix,
            ${DELIVERY_FIELDS.join(', ')}
        FROM customer WHERE ${dateClause(range)}`
    )
    const row = rows[0] ?? {}
    const metrics = delivery(row)

    return {
        range,
        account: {
            customerId: str(row, 'customer.id'),
            name: str(row, 'customer.descriptive_name'),
            currency: str(row, 'customer.currency_code'),
            timeZone: str(row, 'customer.time_zone'),
            status: str(row, 'customer.status'),
            autoTaggingEnabled: row['customer.auto_tagging_enabled'] === true,
            trackingUrlTemplate: optStr(row, 'customer.tracking_url_template'),
            finalUrlSuffix: optStr(row, 'customer.final_url_suffix'),
        },
        totals: totalsOf([metrics]),
    }
}

// ============================================================================
// Campaigns
// ============================================================================

export type CampaignPerformanceRow = DeliveryMetrics & {
    campaignId: string
    campaignName: string
    status: string
    channel: string
    biddingStrategy: string
    dailyBudget: number | null
    ctr: number
    averageCpc: number
    costPerConversion: number | null
    /** Search campaigns only; null elsewhere. */
    searchImpressionShare: number | null
    searchBudgetLostImpressionShare: number | null
    searchRankLostImpressionShare: number | null
}

/**
 * Spend, delivery and conversions per campaign, most expensive first.
 *
 * @param input.includeInactive - Also list paused/ended campaigns with no
 *   impressions in the window (off by default: old campaigns are noise)
 */
export async function getCampaignPerformance(
    input: RangeInput & { includeInactive?: boolean } = {}
) {
    const range = getReportRange(input)
    const { rows } = await searchGaql(
        `SELECT campaign.id, campaign.name, campaign.status,
            campaign.advertising_channel_type, campaign.bidding_strategy_type,
            campaign_budget.amount_micros, ${DELIVERY_FIELDS.join(', ')},
            metrics.search_impression_share,
            metrics.search_budget_lost_impression_share,
            metrics.search_rank_lost_impression_share
        FROM campaign
        WHERE ${dateClause(range)} AND campaign.status != 'REMOVED'
        ORDER BY metrics.cost_micros DESC`
    )

    const campaigns: CampaignPerformanceRow[] = rows
        .map((row) => {
            const metrics = delivery(row)
            const isSearch =
                str(row, 'campaign.advertising_channel_type') === 'SEARCH'
            const share = (key: string) =>
                isSearch ? round(num(row, key), 4) : null
            return {
                campaignId: str(row, 'campaign.id'),
                campaignName: str(row, 'campaign.name'),
                status: str(row, 'campaign.status'),
                channel: str(row, 'campaign.advertising_channel_type'),
                biddingStrategy: str(row, 'campaign.bidding_strategy_type'),
                dailyBudget:
                    row['campaign_budget.amount'] === null
                        ? null
                        : num(row, 'campaign_budget.amount'),
                ...metrics,
                ctr:
                    metrics.impressions > 0
                        ? round(metrics.clicks / metrics.impressions, 4)
                        : 0,
                averageCpc:
                    metrics.clicks > 0
                        ? round(metrics.cost / metrics.clicks)
                        : 0,
                costPerConversion: costPer(metrics.cost, metrics.conversions),
                searchImpressionShare: share('metrics.search_impression_share'),
                searchBudgetLostImpressionShare: share(
                    'metrics.search_budget_lost_impression_share'
                ),
                searchRankLostImpressionShare: share(
                    'metrics.search_rank_lost_impression_share'
                ),
            }
        })
        .filter(
            (campaign) =>
                input.includeInactive ||
                campaign.status === 'ENABLED' ||
                campaign.impressions > 0
        )

    return { range, campaigns, totals: totalsOf(campaigns) }
}

// ============================================================================
// Daily trend
// ============================================================================

export type DailyTrendRow = DeliveryMetrics & { date: string }

/**
 * Day-by-day delivery for the account, or for one campaign.
 */
export async function getDailyTrend(
    input: RangeInput & { campaignId?: string } = {}
) {
    const range = getReportRange(input)
    const from = input.campaignId ? 'campaign' : 'customer'
    const { rows } = await searchGaql(
        `SELECT segments.date, ${DELIVERY_FIELDS.join(', ')}
        FROM ${from}
        WHERE ${dateClause(range)}${campaignFilter(input.campaignId)}
        ORDER BY segments.date`
    )

    // Days with no delivery return no row at all; a trend needs them as zeros,
    // or a pause reads as a gap in the data rather than a drop to nothing.
    const byDate = new Map(
        rows.map((row) => [str(row, 'segments.date'), delivery(row)])
    )
    const days: DailyTrendRow[] = []
    for (
        let date = range.startDate;
        date <= range.endDate;
        date = addDays(date, 1)
    ) {
        days.push({
            date,
            ...(byDate.get(date) ?? {
                impressions: 0,
                clicks: 0,
                cost: 0,
                conversions: 0,
                conversionsValue: 0,
            }),
        })
    }

    return {
        range,
        campaignId: input.campaignId ?? null,
        days,
        totals: totalsOf(days),
    }
}

// ============================================================================
// Search terms + keywords
// ============================================================================

const ORDER_FIELDS = {
    cost: 'metrics.cost_micros',
    clicks: 'metrics.clicks',
    impressions: 'metrics.impressions',
    conversions: 'metrics.conversions',
} as const

export type ReportOrder = keyof typeof ORDER_FIELDS

export type SearchTermRow = DeliveryMetrics & {
    searchTerm: string
    /** ADDED / EXCLUDED / NONE — whether it is already a keyword or negative. */
    status: string
    matchType: string
    campaignName: string
    adGroupName: string
}

/**
 * What people actually typed before clicking. Search campaigns only —
 * Performance Max search terms are not exposed row by row.
 *
 * @param input.contains - Case-insensitive substring filter on the term
 */
export async function getSearchTerms(
    input: RangeInput & {
        campaignId?: string
        contains?: string
        limit?: number
        orderBy?: ReportOrder
    } = {}
) {
    const range = getReportRange(input)
    const contains = input.contains?.trim()
    const { rows, truncated } = await searchGaql(
        `SELECT search_term_view.search_term, search_term_view.status,
            segments.search_term_match_type, campaign.name, ad_group.name,
            ${DELIVERY_FIELDS.join(', ')}
        FROM search_term_view
        WHERE ${dateClause(range)}${campaignFilter(input.campaignId)}${
            contains
                ? ` AND search_term_view.search_term LIKE ${gaqlLikeContains(contains.toLowerCase())}`
                : ''
        }
        ORDER BY ${ORDER_FIELDS[input.orderBy ?? 'cost']} DESC
        LIMIT ${input.limit ?? 100}`
    )

    const terms: SearchTermRow[] = rows.map((row) => ({
        searchTerm: str(row, 'search_term_view.search_term'),
        status: str(row, 'search_term_view.status'),
        matchType: str(row, 'segments.search_term_match_type'),
        campaignName: str(row, 'campaign.name'),
        adGroupName: str(row, 'ad_group.name'),
        ...delivery(row),
    }))

    return { range, terms, truncated }
}

export type KeywordRow = DeliveryMetrics & {
    keyword: string
    matchType: string
    status: string
    qualityScore: number | null
    campaignName: string
    adGroupName: string
    ctr: number
    averageCpc: number
    searchImpressionShare: number
}

/** Keyword performance with match type and quality score. */
export async function getKeywordPerformance(
    input: RangeInput & {
        campaignId?: string
        limit?: number
        orderBy?: ReportOrder
    } = {}
) {
    const range = getReportRange(input)
    const { rows, truncated } = await searchGaql(
        `SELECT ad_group_criterion.keyword.text,
            ad_group_criterion.keyword.match_type, ad_group_criterion.status,
            ad_group_criterion.quality_info.quality_score, campaign.name,
            ad_group.name, ${DELIVERY_FIELDS.join(', ')},
            metrics.search_impression_share
        FROM keyword_view
        WHERE ${dateClause(range)}${campaignFilter(input.campaignId)}
        ORDER BY ${ORDER_FIELDS[input.orderBy ?? 'cost']} DESC
        LIMIT ${input.limit ?? 100}`
    )

    const keywords: KeywordRow[] = rows.map((row) => {
        const metrics = delivery(row)
        const quality = row['ad_group_criterion.quality_info.quality_score']
        return {
            keyword: str(row, 'ad_group_criterion.keyword.text'),
            matchType: str(row, 'ad_group_criterion.keyword.match_type'),
            status: str(row, 'ad_group_criterion.status'),
            qualityScore: quality === null ? null : Number(quality),
            campaignName: str(row, 'campaign.name'),
            adGroupName: str(row, 'ad_group.name'),
            ...metrics,
            ctr:
                metrics.impressions > 0
                    ? round(metrics.clicks / metrics.impressions, 4)
                    : 0,
            averageCpc:
                metrics.clicks > 0 ? round(metrics.cost / metrics.clicks) : 0,
            searchImpressionShare: round(
                num(row, 'metrics.search_impression_share'),
                4
            ),
        }
    })

    return { range, keywords, truncated }
}

// ============================================================================
// Landing pages
// ============================================================================

export type LandingPageRow = DeliveryMetrics & {
    /** URL without its query string or ValueTrack `{ignore}` marker. */
    page: string
    /** How many distinct tagged URLs (per campaign, device, …) rolled up into this page. */
    urlVariants: number
    /** The busiest tagged URL, tracking parameters included — shows the template in use. */
    sampleUrl: string
}

/** Strip the query string and ValueTrack `{ignore}` from a final URL. */
export function landingPagePath(url: string): string {
    return url.split('?')[0]!.replace('{ignore}', '')
}

/**
 * Performance by landing page.
 *
 * @param input.expanded - Report the URLs actually served (including pages
 *   Performance Max chose through URL expansion) instead of the configured
 *   final URLs
 */
export async function getLandingPages(
    input: RangeInput & { expanded?: boolean; limit?: number } = {}
) {
    const range = getReportRange(input)
    const [resource, field] = input.expanded
        ? ['expanded_landing_page_view', 'expanded_final_url']
        : ['landing_page_view', 'unexpanded_final_url']

    // Every campaign, device and network tags the same page differently, so
    // the API returns one row per variant. Roll them up to the page.
    const { rows, truncated } = await searchGaql(
        `SELECT ${resource}.${field}, ${DELIVERY_FIELDS.join(', ')}
        FROM ${resource}
        WHERE ${dateClause(range)}
        ORDER BY metrics.clicks DESC`,
        { maxRows: 5000 }
    )

    const byPage = new Map<string, LandingPageRow>()
    for (const row of rows) {
        const url = str(row, `${resource}.${field}`)
        const page = landingPagePath(url)
        const metrics = delivery(row)
        const existing = byPage.get(page)
        if (!existing) {
            // Rows arrive busiest first, so the first URL seen is the sample.
            byPage.set(page, {
                page,
                urlVariants: 1,
                sampleUrl: url,
                ...metrics,
            })
            continue
        }
        existing.urlVariants += 1
        existing.impressions += metrics.impressions
        existing.clicks += metrics.clicks
        existing.cost = round(existing.cost + metrics.cost)
        existing.conversions = round(existing.conversions + metrics.conversions)
        existing.conversionsValue = round(
            existing.conversionsValue + metrics.conversionsValue
        )
    }

    const pages = [...byPage.values()]
        .sort((a, b) => b.clicks - a.clicks)
        .slice(0, input.limit ?? 50)

    return {
        range,
        expanded: Boolean(input.expanded),
        pages,
        truncated: truncated || byPage.size > pages.length,
    }
}

// ============================================================================
// Conversion actions
// ============================================================================

export type ConversionActionRow = {
    id: string
    name: string
    status: string
    category: string
    type: string
    origin: string
    countingType: string
    /** Primary actions count toward the "Conversions" column bidding optimizes for. */
    primaryForGoal: boolean
    includeInConversionsMetric: boolean
    /** Counted in the "Conversions" column over the window. */
    conversions: number
    /** Counted in "All conversions", primary or not. */
    allConversions: number
}

/**
 * Every non-removed conversion action with its settings and what it recorded
 * in the window — the first place to look when "conversions" look wrong.
 */
export async function getConversionActions(input: RangeInput = {}) {
    const range = getReportRange(input)
    const [actions, counts] = await Promise.all([
        searchGaql(
            `SELECT conversion_action.resource_name, conversion_action.id,
                conversion_action.name, conversion_action.status,
                conversion_action.category, conversion_action.type,
                conversion_action.origin, conversion_action.counting_type,
                conversion_action.primary_for_goal,
                conversion_action.include_in_conversions_metric
            FROM conversion_action
            WHERE conversion_action.status != 'REMOVED'`
        ),
        searchGaql(
            `SELECT segments.conversion_action, metrics.conversions,
                metrics.all_conversions
            FROM customer WHERE ${dateClause(range)}`
        ),
    ])

    const byAction = new Map(
        counts.rows.map((row) => [str(row, 'segments.conversion_action'), row])
    )

    const conversionActions: ConversionActionRow[] = actions.rows
        .map((row) => {
            const counted = byAction.get(
                str(row, 'conversion_action.resource_name')
            )
            return {
                id: str(row, 'conversion_action.id'),
                name: str(row, 'conversion_action.name'),
                status: str(row, 'conversion_action.status'),
                category: str(row, 'conversion_action.category'),
                type: str(row, 'conversion_action.type'),
                origin: str(row, 'conversion_action.origin'),
                countingType: str(row, 'conversion_action.counting_type'),
                primaryForGoal:
                    row['conversion_action.primary_for_goal'] === true,
                includeInConversionsMetric:
                    row['conversion_action.include_in_conversions_metric'] ===
                    true,
                conversions: counted
                    ? round(num(counted, 'metrics.conversions'))
                    : 0,
                allConversions: counted
                    ? round(num(counted, 'metrics.all_conversions'))
                    : 0,
            }
        })
        .sort((a, b) => b.allConversions - a.allConversions)

    return { range, conversionActions }
}

// ============================================================================
// Change history
// ============================================================================

/** change_event only covers the last 30 days. */
export const CHANGE_HISTORY_MAX_DAYS = 30

export type ChangeEventRow = {
    /** Account-zone timestamp, as the API reports it. */
    changedAt: string
    userEmail: string
    clientType: string
    resourceType: string
    operation: string
    changedFields: string[]
    campaignName: string | null
    adGroupName: string | null
    /** Per changed field, the value before and after — when `includeValues`. */
    values?: Record<string, { old: unknown; new: unknown }>
}

/** Fields every CREATE lists as changed; their values say nothing about the change. */
const IDENTITY_FIELDS = new Set(['id', 'resource_name'])

/** A change_event as the REST API returns it. */
type RawChangeEvent = {
    changeDateTime?: string
    userEmail?: string
    clientType?: string
    changeResourceType?: string
    resourceChangeOperation?: string
    /** FieldMask string, camelCase paths joined by commas. */
    changedFields?: string
    oldResource?: unknown
    newResource?: unknown
}

/** Read one changed-field path out of a change event's old/new resource. */
function changedValue(resource: unknown, fieldPath: string): unknown {
    if (resource === null || typeof resource !== 'object') return null
    // The resource wrapper has one populated key (campaign, adGroupAd, …).
    const inner = Object.values(resource as Record<string, unknown>)[0]
    let current: unknown = inner
    for (const segment of fieldPath.split('.')) {
        if (current === null || typeof current !== 'object') return null
        const record = current as Record<string, unknown>
        const camel = segment.replace(/_([a-z])/g, (_, c: string) =>
            c.toUpperCase()
        )
        current = record[camel] ?? record[segment]
    }
    if (current === undefined) return null
    // Money inside change events is micros, like everywhere else.
    if (fieldPath.endsWith('_micros') && current !== null) {
        return round(Number(current) / 1_000_000)
    }
    return current
}

/**
 * Who changed what in the account, newest first — bids, budgets, statuses,
 * ads, keywords, assets.
 *
 * @param input.days - Look-back, at most 30 (the API's limit)
 * @param input.resourceType - Filter, e.g. CAMPAIGN, CAMPAIGN_BUDGET, AD_GROUP_AD
 * @param input.includeValues - Attach old → new values for each changed field
 */
export async function getChangeHistory(
    input: {
        days?: number
        resourceType?: string
        limit?: number
        includeValues?: boolean
    } = {}
) {
    const { timeZone } = getGoogleAdsConfig()
    const days = Math.min(input.days ?? 7, CHANGE_HISTORY_MAX_DAYS)
    const today = todayIn(timeZone)
    // Inclusive of today: changes made this morning are the interesting ones.
    const start = addDays(today, -(days - 1))
    const resourceType = input.resourceType?.trim().toUpperCase()
    if (resourceType && !/^[A-Z_]+$/.test(resourceType)) {
        throw new Error(
            `resourceType must be an enum name like CAMPAIGN, got "${input.resourceType}"`
        )
    }

    const { rows } = await searchGaqlRaw(
        `SELECT change_event.change_date_time, change_event.user_email,
            change_event.client_type, change_event.change_resource_type,
            change_event.resource_change_operation, change_event.changed_fields,
            campaign.name, ad_group.name${
                input.includeValues
                    ? ', change_event.old_resource, change_event.new_resource'
                    : ''
            }
        FROM change_event
        WHERE change_event.change_date_time >= ${gaqlString(start)}
            AND change_event.change_date_time <= ${gaqlString(`${today} 23:59:59`)}${
                resourceType
                    ? ` AND change_event.change_resource_type = '${resourceType}'`
                    : ''
            }
        ORDER BY change_event.change_date_time DESC
        LIMIT ${input.limit ?? 100}`
    )

    const events: ChangeEventRow[] = rows.map((row: RawRow) => {
        const event = (row.changeEvent ?? {}) as RawChangeEvent
        const campaign = row.campaign as { name?: string } | undefined
        const adGroup = row.adGroup as { name?: string } | undefined
        const changedFields = (event.changedFields ?? '')
            .split(',')
            .map((field) => camelToSnake(field.trim()))
            .filter(Boolean)

        return {
            changedAt: event.changeDateTime ?? '',
            userEmail: event.userEmail ?? '',
            clientType: event.clientType ?? '',
            resourceType: event.changeResourceType ?? '',
            operation: event.resourceChangeOperation ?? '',
            changedFields,
            campaignName: campaign?.name ?? null,
            adGroupName: adGroup?.name ?? null,
            ...(input.includeValues
                ? {
                      values: Object.fromEntries(
                          changedFields
                              .filter((field) => !IDENTITY_FIELDS.has(field))
                              .map((field) => [
                                  // Values are converted to currency, so drop the unit.
                                  field.replace(/_micros$/, ''),
                                  {
                                      old: changedValue(
                                          event.oldResource,
                                          field
                                      ),
                                      new: changedValue(
                                          event.newResource,
                                          field
                                      ),
                                  },
                              ])
                      ),
                  }
                : {}),
        }
    })

    return { window: { startDate: start, endDate: today, days }, events }
}

// ============================================================================
// Click lookup (gclid → campaign / ad group / keyword)
// ============================================================================

/** click_view keeps 90 days of clicks. */
export const CLICK_VIEW_MAX_AGE_DAYS = 90

export type ClickRow = {
    gclid: string
    date: string
    campaignId: string
    campaignName: string
    adGroupId: string | null
    adGroupName: string | null
    /** Null for Performance Max and other keywordless clicks. */
    keyword: string | null
    keywordMatchType: string | null
    device: string
    network: string
}

/**
 * Resolve Google click ids to the campaign, ad group and keyword behind them.
 *
 * click_view only answers one day per query, so the lookup walks back from
 * `date` (the lead's day) for `daysBefore` more days — a visitor may click on
 * Monday and submit on Wednesday. Each day queried is one API operation, and
 * the walk stops once every gclid is found.
 *
 * @param input.gclids - Up to 100 click ids
 * @param input.date - The day to start from (YYYY-MM-DD, account zone)
 * @param input.daysBefore - Extra days to search before `date` (default 3)
 */
export async function lookupClicks(input: {
    gclids: string[]
    date: string
    daysBefore?: number
}) {
    const { timeZone } = getGoogleAdsConfig()
    assertIsoDate(input.date, 'date')
    const gclids = [
        ...new Set(input.gclids.map((g) => g.trim()).filter(Boolean)),
    ]
    if (gclids.length === 0) throw new Error('gclids is empty')
    if (gclids.length > 100) throw new Error('at most 100 gclids per lookup')

    const today = todayIn(timeZone)
    const oldest = addDays(today, -(CLICK_VIEW_MAX_AGE_DAYS - 1))

    const found = new Map<string, ClickRow>()
    const searchedDates: string[] = []
    const daysBefore = Math.min(input.daysBefore ?? 3, 30)

    for (let offset = 0; offset <= daysBefore; offset++) {
        const date = addDays(input.date, -offset)
        if (date < oldest || date > today) continue
        const pending = gclids.filter((gclid) => !found.has(gclid))
        if (pending.length === 0) break

        searchedDates.push(date)
        const { rows } = await searchGaql(
            `SELECT click_view.gclid, segments.date, campaign.id, campaign.name,
                ad_group.id, ad_group.name, click_view.keyword_info.text,
                click_view.keyword_info.match_type, segments.device,
                segments.ad_network_type
            FROM click_view
            WHERE segments.date = ${gaqlString(date)}
                AND click_view.gclid IN (${pending.map(gaqlString).join(', ')})`
        )
        for (const row of rows) {
            const gclid = str(row, 'click_view.gclid')
            found.set(gclid, {
                gclid,
                date: str(row, 'segments.date'),
                campaignId: str(row, 'campaign.id'),
                campaignName: str(row, 'campaign.name'),
                adGroupId: optStr(row, 'ad_group.id'),
                adGroupName: optStr(row, 'ad_group.name'),
                keyword: optStr(row, 'click_view.keyword_info.text'),
                keywordMatchType: optStr(
                    row,
                    'click_view.keyword_info.match_type'
                ),
                device: str(row, 'segments.device'),
                network: str(row, 'segments.ad_network_type'),
            })
        }
    }

    const outsideRetention =
        daysBetween(addDays(input.date, -daysBefore), today) >
        CLICK_VIEW_MAX_AGE_DAYS

    return {
        clicks: [...found.values()],
        notFound: gclids.filter((gclid) => !found.has(gclid)),
        searchedDates,
        ...(outsideRetention
            ? {
                  note: `click_view only keeps ${CLICK_VIEW_MAX_AGE_DAYS} days (oldest queryable day: ${oldest}); earlier days were skipped.`,
              }
            : {}),
    }
}

// ============================================================================
// Raw GAQL
// ============================================================================

/**
 * Run caller-written GAQL. Rows are flattened to GAQL field names; `*_micros`
 * fields lose the suffix and arrive in account currency.
 *
 * @param query - A GAQL SELECT statement
 * @param maxRows - Row cap across pages (default 500)
 */
export async function runGaql(
    query: string,
    maxRows = 500
): Promise<GaqlSearchResult> {
    return searchGaql(assertSelectQuery(query), { maxRows })
}
