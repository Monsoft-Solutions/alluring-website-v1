/**
 * Ads Keyword, Search Term and Landing Page Queries (epic #288)
 *
 * Google's click report names the keyword behind each lead but never the
 * search term. So leads and cost per lead live on keywords (and landing
 * pages); search terms are judged on spend and Google's conversions.
 *
 * @module @/lib/queries/ads/ads-keywords.query
 */
import { asc, eq, sql } from 'drizzle-orm'

import { db } from '@workspace/db/client'
import { adsTermClass } from '@workspace/db/schema/ads'

import type {
    AdsKeywordRow,
    AdsKeywordsReport,
    AdsLandingPageRow,
    AdsLandingPagesReport,
    AdsRange,
    AdsSearchTermRow,
    AdsSearchTermsReport,
    AdsTermClassEntry,
    TermClassName,
} from '@/lib/types/ads/ads.type'
import { costPerLead } from '@/lib/utils/ads/ads-attention.util'
import {
    createTermClassifier,
    DEFAULT_TERM_CLASSES,
    normalizePattern,
} from '@/lib/utils/ads/term-class.util'

function round2(value: number): number {
    return Math.round(value * 100) / 100
}

function cpc(cost: number, clicks: number): number | null {
    return clicks > 0 ? round2(cost / clicks) : null
}

// ============================================
// Keywords
// ============================================

/**
 * Keywords over the window with the leads their clicks produced. A lead joins
 * a keyword on ad group + keyword text + match type — the click report's
 * keyword info carries no criterion id.
 */
export async function getAdsKeywords(
    range: AdsRange,
    campaignId?: string
): Promise<AdsKeywordsReport> {
    const filter = campaignId ? sql`AND campaign_id = ${campaignId}` : sql``
    const [rows, unkeyed] = await Promise.all([
        db.execute<{
            campaign_id: string
            campaign_name: string
            ad_group_id: string
            ad_group_name: string
            keyword: string
            match_type: string
            status: string
            quality_score: number | null
            impressions: number
            clicks: number
            cost: number
            conversions: number
            leads: number
        }>(sql`
            WITH kw AS (
                SELECT campaign_id, ad_group_id, criterion_id,
                    (array_agg(campaign_name ORDER BY date DESC))[1] AS campaign_name,
                    (array_agg(ad_group_name ORDER BY date DESC))[1] AS ad_group_name,
                    (array_agg(keyword ORDER BY date DESC))[1] AS keyword,
                    (array_agg(match_type ORDER BY date DESC))[1] AS match_type,
                    (array_agg(status ORDER BY date DESC))[1] AS status,
                    (array_agg(quality_score ORDER BY date DESC))[1] AS quality_score,
                    SUM(impressions)::int AS impressions,
                    SUM(clicks)::int AS clicks,
                    SUM(cost)::float8 AS cost,
                    SUM(conversions)::float8 AS conversions
                FROM ads_keyword_daily
                WHERE date BETWEEN ${range.from} AND ${range.to} ${filter}
                GROUP BY campaign_id, ad_group_id, criterion_id
            ),
            leads AS (
                SELECT ad_group_id, lower(keyword) AS keyword,
                    keyword_match_type AS match_type, COUNT(*)::int AS leads
                FROM lead_ad_click
                WHERE lead_date BETWEEN ${range.from} AND ${range.to}
                    AND keyword IS NOT NULL ${filter}
                GROUP BY 1, 2, 3
            )
            SELECT kw.*, COALESCE(leads.leads, 0) AS leads
            FROM kw
            LEFT JOIN leads ON leads.ad_group_id = kw.ad_group_id
                AND leads.keyword = lower(kw.keyword)
                AND leads.match_type = kw.match_type
            ORDER BY kw.cost DESC
        `),
        db.execute<{ via_keyword: number; without_keyword: number }>(sql`
            SELECT
                COUNT(*) FILTER (WHERE keyword IS NOT NULL)::int AS via_keyword,
                COUNT(*) FILTER (WHERE keyword IS NULL AND match = 'click')::int AS without_keyword
            FROM lead_ad_click
            WHERE lead_date BETWEEN ${range.from} AND ${range.to} ${filter}
        `),
    ])

    const keywords: AdsKeywordRow[] = rows.map((row) => {
        const cost = round2(Number(row.cost))
        const leads = Number(row.leads)
        return {
            campaignId: row.campaign_id,
            campaignName: row.campaign_name,
            adGroupId: row.ad_group_id,
            adGroupName: row.ad_group_name,
            keyword: row.keyword,
            matchType: row.match_type,
            status: row.status,
            qualityScore:
                row.quality_score === null ? null : Number(row.quality_score),
            impressions: Number(row.impressions),
            clicks: Number(row.clicks),
            cost,
            cpc: cpc(cost, Number(row.clicks)),
            googleConversions: round2(Number(row.conversions)),
            leads,
            costPerLead: costPerLead(cost, leads),
        }
    })

    const totalCost = round2(keywords.reduce((sum, row) => sum + row.cost, 0))
    return {
        range,
        keywords,
        totals: {
            cost: totalCost,
            leadsViaKeyword: Number(unkeyed[0]?.via_keyword ?? 0),
            leadsWithoutKeyword: Number(unkeyed[0]?.without_keyword ?? 0),
            costWithNoLead: round2(
                keywords
                    .filter((row) => row.leads === 0)
                    .reduce((sum, row) => sum + row.cost, 0)
            ),
        },
    }
}

// ============================================
// Term classes
// ============================================

/**
 * The editable brand/competitor/procedure list, seeded with the defaults the
 * first time it is read empty.
 */
export async function getTermClasses(): Promise<AdsTermClassEntry[]> {
    const read = () =>
        db
            .select({
                id: adsTermClass.id,
                pattern: adsTermClass.pattern,
                termClass: adsTermClass.termClass,
            })
            .from(adsTermClass)
            .orderBy(asc(adsTermClass.termClass), asc(adsTermClass.pattern))

    const rows = await read()
    if (rows.length > 0) return rows

    await db
        .insert(adsTermClass)
        .values(DEFAULT_TERM_CLASSES)
        .onConflictDoNothing({ target: adsTermClass.pattern })
    return read()
}

/** Add or reclassify a pattern. */
export async function upsertTermClass(
    pattern: string,
    termClass: TermClassName
): Promise<AdsTermClassEntry> {
    const normalized = normalizePattern(pattern)
    const [row] = await db
        .insert(adsTermClass)
        .values({ pattern: normalized, termClass })
        .onConflictDoUpdate({
            target: adsTermClass.pattern,
            set: { termClass },
        })
        .returning({
            id: adsTermClass.id,
            pattern: adsTermClass.pattern,
            termClass: adsTermClass.termClass,
        })
    return row!
}

export async function deleteTermClass(id: string): Promise<boolean> {
    const deleted = await db
        .delete(adsTermClass)
        .where(eq(adsTermClass.id, id))
        .returning({ id: adsTermClass.id })
    return deleted.length > 0
}

// ============================================
// Search terms
// ============================================

const EMPTY_BY_CLASS = (): AdsSearchTermsReport['totals']['byClass'] => ({
    brand: { cost: 0, terms: 0 },
    competitor: { cost: 0, terms: 0 },
    procedure: { cost: 0, terms: 0 },
    address: { cost: 0, terms: 0 },
    other: { cost: 0, terms: 0 },
})

/** Search terms over the window, per campaign, classified. */
export async function getAdsSearchTerms(
    range: AdsRange,
    options: { campaignId?: string; limit?: number } = {}
): Promise<AdsSearchTermsReport> {
    const filter = options.campaignId
        ? sql`AND campaign_id = ${options.campaignId}`
        : sql``
    const [rows, classes] = await Promise.all([
        db.execute<{
            search_term: string
            campaign_id: string
            campaign_name: string
            status: string
            match_types: string[]
            impressions: number
            clicks: number
            cost: number
            conversions: number
        }>(sql`
            SELECT search_term, campaign_id,
                (array_agg(campaign_name ORDER BY date DESC))[1] AS campaign_name,
                (array_agg(status ORDER BY date DESC))[1] AS status,
                array_agg(DISTINCT match_type) AS match_types,
                SUM(impressions)::int AS impressions,
                SUM(clicks)::int AS clicks,
                SUM(cost)::float8 AS cost,
                SUM(conversions)::float8 AS conversions
            FROM ads_search_term_daily
            WHERE date BETWEEN ${range.from} AND ${range.to} ${filter}
            GROUP BY search_term, campaign_id
            ORDER BY SUM(cost) DESC
        `),
        getTermClasses(),
    ])

    const classify = createTermClassifier(classes)
    const byClass = EMPTY_BY_CLASS()
    let totalCost = 0
    let costWithNoConversion = 0

    const all: AdsSearchTermRow[] = rows.map((row) => {
        const cost = round2(Number(row.cost))
        const conversions = round2(Number(row.conversions))
        const termClass = classify(row.search_term)
        totalCost += cost
        if (conversions === 0) costWithNoConversion += cost
        byClass[termClass].cost = round2(byClass[termClass].cost + cost)
        byClass[termClass].terms += 1
        return {
            searchTerm: row.search_term,
            campaignId: row.campaign_id,
            campaignName: row.campaign_name,
            status: row.status,
            matchTypes: row.match_types,
            impressions: Number(row.impressions),
            clicks: Number(row.clicks),
            cost,
            cpc: cpc(cost, Number(row.clicks)),
            googleConversions: conversions,
            termClass,
        }
    })

    const competitorNegatives = [
        ...new Set(
            all
                .filter(
                    (term) =>
                        term.termClass === 'competitor' &&
                        term.cost > 0 &&
                        term.status !== 'EXCLUDED'
                )
                .map((term) => term.searchTerm)
        ),
    ]

    return {
        range,
        competitorNegatives,
        terms: all.slice(0, options.limit ?? 500),
        totals: {
            cost: round2(totalCost),
            costWithNoConversion: round2(costWithNoConversion),
            byClass,
        },
    }
}

// ============================================
// Landing pages
// ============================================

/**
 * Landing pages over the window with the paid leads that landed on them.
 * Pages join leads on host (www. ignored) and path, so a trailing slash or a
 * tracking parameter doesn't split a page.
 */
export async function getAdsLandingPages(
    range: AdsRange,
    options: { expanded?: boolean; campaignId?: string } = {}
): Promise<AdsLandingPagesReport> {
    const expanded = options.expanded ?? false
    const filter = options.campaignId
        ? sql`AND campaign_id = ${options.campaignId}`
        : sql``
    const campaignFilter = options.campaignId
        ? sql`AND lac.campaign_id = ${options.campaignId}`
        : sql``
    const rows = await db.execute<{
        page: string
        path: string
        url_variants: number
        sample_url: string
        impressions: number
        clicks: number
        cost: number
        conversions: number
        leads: number
    }>(sql`
        WITH normalized AS (
            SELECT *,
                regexp_replace(lower(substring(page FROM '^https?://([^/]+)')), '^www\.', '') AS host,
                COALESCE(NULLIF(rtrim(regexp_replace(page, '^https?://[^/]+', ''), '/'), ''), '/') AS path
            FROM ads_landing_page_daily
            WHERE date BETWEEN ${range.from} AND ${range.to}
                AND expanded = ${expanded} ${filter}
        ),
        pages AS (
            -- /specials and /specials/ are one page.
            SELECT MIN(page) AS page, host, path,
                SUM(url_variants)::int AS url_variants,
                (array_agg(sample_url ORDER BY clicks DESC))[1] AS sample_url,
                SUM(impressions)::int AS impressions,
                SUM(clicks)::int AS clicks,
                SUM(cost)::float8 AS cost,
                SUM(conversions)::float8 AS conversions
            FROM normalized
            GROUP BY host, path
        ),
        leads AS (
            SELECT
                regexp_replace(lower(substring(cs.landing_page FROM '^https?://([^/]+)')), '^www\.', '') AS host,
                COALESCE(NULLIF(rtrim(lac.landing_path, '/'), ''), '/') AS path,
                COUNT(*)::int AS leads
            FROM lead_ad_click lac
            JOIN contact_submission cs ON cs.id = lac.lead_id
            WHERE lac.lead_date BETWEEN ${range.from} AND ${range.to}
                AND lac.landing_path IS NOT NULL ${campaignFilter}
            GROUP BY 1, 2
        )
        SELECT pages.*, COALESCE(leads.leads, 0) AS leads
        FROM pages
        LEFT JOIN leads USING (host, path)
        ORDER BY pages.cost DESC
    `)

    // Leads join on host and path: another site's final URL can share a path
    // (…/miami-plastic-surgery-specials/), and its leads never reach here.
    const pages: AdsLandingPageRow[] = rows.map((row) => {
        const cost = round2(Number(row.cost))
        const leads = Number(row.leads)
        return {
            page: row.page,
            path: row.path,
            urlVariants: Number(row.url_variants),
            sampleUrl: row.sample_url,
            impressions: Number(row.impressions),
            clicks: Number(row.clicks),
            cost,
            cpc: cpc(cost, Number(row.clicks)),
            googleConversions: round2(Number(row.conversions)),
            leads,
            costPerLead: costPerLead(cost, leads),
        }
    })

    return { range, expanded, pages }
}
