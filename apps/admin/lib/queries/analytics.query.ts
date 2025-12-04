/**
 * Analytics Dashboard Queries
 *
 * Queries for the admin analytics dashboard.
 * Provides page view statistics, traffic sources, device breakdown, and geo distribution.
 *
 * @module lib/queries/analytics
 */
import { db } from '@workspace/db/client'
import { pageView } from '@workspace/db/schema/analytics'
import { count, desc, gte, sql, countDistinct } from 'drizzle-orm'

import {
    fillMissingDatesWithViews,
    type DailyViewCount,
} from '@/lib/utils/date.util'

// ============================================================================
// Types
// ============================================================================

export type AnalyticsSummary = {
    totalViews: number
    uniqueSessions: number
    todayViews: number
    topPage: string | null
    topSource: string | null
}

// Re-export DailyViewCount from shared utility for backwards compatibility
export type { DailyViewCount }

export type TopPage = {
    pagePath: string
    pageTitle: string | null
    views: number
    uniqueSessions: number
}

export type TrafficSource = {
    source: string
    views: number
    sessions: number
}

export type DeviceStats = {
    deviceType: string
    views: number
    percentage: number
}

export type BrowserStats = {
    browser: string
    views: number
    percentage: number
}

export type OSStats = {
    os: string
    views: number
    percentage: number
}

export type GeoStats = {
    countryCode: string
    views: number
    sessions: number
}

// ============================================================================
// Summary Stats
// ============================================================================

/**
 * Get analytics summary stats for the dashboard header cards
 */
export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const [
        totalViewsResult,
        uniqueSessionsResult,
        todayViewsResult,
        topPageResult,
        topSourceResult,
    ] = await Promise.all([
        // Total views all time
        db.select({ count: count() }).from(pageView),

        // Unique sessions (unique session IDs)
        db.select({ count: countDistinct(pageView.sessionId) }).from(pageView),

        // Today's views
        db
            .select({ count: count() })
            .from(pageView)
            .where(gte(pageView.createdAt, today)),

        // Top page by views
        db
            .select({
                pagePath: pageView.pagePath,
                views: count(),
            })
            .from(pageView)
            .groupBy(pageView.pagePath)
            .orderBy(desc(count()))
            .limit(1),

        // Top source (utm_source or referrer domain)
        db
            .select({
                source: sql<string>`COALESCE(${pageView.utmSource}, 
                    CASE 
                        WHEN ${pageView.referrer} IS NOT NULL AND ${pageView.referrer} != '' 
                        THEN REGEXP_REPLACE(${pageView.referrer}, '^https?://([^/]+).*$', '\\1')
                        ELSE 'direct'
                    END
                )`.as('source'),
                views: count(),
            })
            .from(pageView)
            .groupBy(sql`1`)
            .orderBy(desc(count()))
            .limit(1),
    ])

    return {
        totalViews: totalViewsResult[0]?.count ?? 0,
        uniqueSessions: uniqueSessionsResult[0]?.count ?? 0,
        todayViews: todayViewsResult[0]?.count ?? 0,
        topPage: topPageResult[0]?.pagePath ?? null,
        topSource: topSourceResult[0]?.source ?? null,
    }
}

// ============================================================================
// Time Series Data
// ============================================================================

/**
 * Get page views over time for the specified number of days
 */
export async function getPageViewsOverTime(
    days = 30
): Promise<DailyViewCount[]> {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    startDate.setHours(0, 0, 0, 0)

    const results = await db
        .select({
            date: sql<string>`DATE(${pageView.createdAt})`.as('date'),
            views: count(),
            sessions: countDistinct(pageView.sessionId),
        })
        .from(pageView)
        .where(gte(pageView.createdAt, startDate))
        .groupBy(sql`DATE(${pageView.createdAt})`)
        .orderBy(sql`DATE(${pageView.createdAt})`)

    // Fill in missing dates with zeros using shared utility
    return fillMissingDatesWithViews(results, days)
}

// ============================================================================
// Top Pages
// ============================================================================

/**
 * Get top pages by view count
 */
export async function getTopPages(limit = 10): Promise<TopPage[]> {
    const results = await db
        .select({
            pagePath: pageView.pagePath,
            pageTitle: sql<string>`MAX(${pageView.pageTitle})`.as('pageTitle'),
            views: count(),
            uniqueSessions: countDistinct(pageView.sessionId),
        })
        .from(pageView)
        .groupBy(pageView.pagePath)
        .orderBy(desc(count()))
        .limit(limit)

    return results
}

/**
 * Get top pages within a date range
 */
export async function getTopPagesInRange(
    days = 30,
    limit = 10
): Promise<TopPage[]> {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const results = await db
        .select({
            pagePath: pageView.pagePath,
            pageTitle: sql<string>`MAX(${pageView.pageTitle})`.as('pageTitle'),
            views: count(),
            uniqueSessions: countDistinct(pageView.sessionId),
        })
        .from(pageView)
        .where(gte(pageView.createdAt, startDate))
        .groupBy(pageView.pagePath)
        .orderBy(desc(count()))
        .limit(limit)

    return results
}

// ============================================================================
// Traffic Sources
// ============================================================================

/**
 * Get traffic sources breakdown
 */
export async function getTrafficSources(limit = 10): Promise<TrafficSource[]> {
    const results = await db
        .select({
            source: sql<string>`COALESCE(
                ${pageView.utmSource}, 
                CASE 
                    WHEN ${pageView.referrer} IS NOT NULL AND ${pageView.referrer} != '' 
                    THEN REGEXP_REPLACE(${pageView.referrer}, '^https?://([^/]+).*$', '\\1')
                    ELSE 'direct'
                END
            )`.as('source'),
            views: count(),
            sessions: countDistinct(pageView.sessionId),
        })
        .from(pageView)
        .groupBy(sql`1`)
        .orderBy(desc(count()))
        .limit(limit)

    return results
}

/**
 * Get UTM campaign breakdown
 */
export async function getUTMCampaigns(
    limit = 10
): Promise<{ campaign: string; views: number; sessions: number }[]> {
    const results = await db
        .select({
            campaign:
                sql<string>`COALESCE(${pageView.utmCampaign}, '(none)')`.as(
                    'campaign'
                ),
            views: count(),
            sessions: countDistinct(pageView.sessionId),
        })
        .from(pageView)
        .groupBy(pageView.utmCampaign)
        .orderBy(desc(count()))
        .limit(limit)

    return results
}

// ============================================================================
// Device & Browser Stats
// ============================================================================

/**
 * Get device type breakdown
 */
export async function getDeviceBreakdown(): Promise<DeviceStats[]> {
    const results = await db
        .select({
            deviceType:
                sql<string>`COALESCE(${pageView.deviceType}, 'unknown')`.as(
                    'deviceType'
                ),
            views: count(),
        })
        .from(pageView)
        .groupBy(pageView.deviceType)
        .orderBy(desc(count()))

    // Calculate percentages
    const total = results.reduce((sum, r) => sum + r.views, 0)
    return results.map((r) => ({
        ...r,
        percentage: total > 0 ? Math.round((r.views / total) * 100) : 0,
    }))
}

/**
 * Get browser breakdown
 */
export async function getBrowserBreakdown(limit = 10): Promise<BrowserStats[]> {
    const results = await db
        .select({
            browser: sql<string>`COALESCE(${pageView.browser}, 'Unknown')`.as(
                'browser'
            ),
            views: count(),
        })
        .from(pageView)
        .groupBy(pageView.browser)
        .orderBy(desc(count()))
        .limit(limit)

    // Calculate percentages
    const total = results.reduce((sum, r) => sum + r.views, 0)
    return results.map((r) => ({
        ...r,
        percentage: total > 0 ? Math.round((r.views / total) * 100) : 0,
    }))
}

/**
 * Get OS breakdown
 */
export async function getOSBreakdown(limit = 10): Promise<OSStats[]> {
    const results = await db
        .select({
            os: sql<string>`COALESCE(${pageView.os}, 'Unknown')`.as('os'),
            views: count(),
        })
        .from(pageView)
        .groupBy(pageView.os)
        .orderBy(desc(count()))
        .limit(limit)

    // Calculate percentages
    const total = results.reduce((sum, r) => sum + r.views, 0)
    return results.map((r) => ({
        ...r,
        percentage: total > 0 ? Math.round((r.views / total) * 100) : 0,
    }))
}

// ============================================================================
// Geo Distribution
// ============================================================================

/**
 * Get geographic distribution by country
 */
export async function getGeoDistribution(limit = 20): Promise<GeoStats[]> {
    const results = await db
        .select({
            countryCode:
                sql<string>`COALESCE(${pageView.countryCode}, 'XX')`.as(
                    'countryCode'
                ),
            views: count(),
            sessions: countDistinct(pageView.sessionId),
        })
        .from(pageView)
        .groupBy(pageView.countryCode)
        .orderBy(desc(count()))
        .limit(limit)

    return results
}

// ============================================================================
// Notes
// ============================================================================

/**
 * Note on percentage calculations (e.g., getBrowserBreakdown):
 *
 * Percentages are calculated from the limited result set (top N items),
 * not from all data. This is intentional for "top N" breakdowns where
 * showing relative proportions within the visible items is more useful
 * than showing absolute percentages of total traffic.
 *
 * For accurate total percentages, a separate total count query would
 * be needed, which adds query complexity for minimal UX benefit.
 */
