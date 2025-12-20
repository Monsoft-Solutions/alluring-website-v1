/**
 * Analytics Dashboard Queries
 *
 * Queries for the admin analytics dashboard.
 * Provides page view statistics, traffic sources, device breakdown, and geo distribution.
 *
 * @module lib/queries/analytics
 */
import { cache } from 'react'
import { db } from '@workspace/db/client'
import { pageView } from '@workspace/db/schema/analytics'
import { count, desc, gte, sql, countDistinct } from 'drizzle-orm'

import { fillMissingDatesWithViews } from '@/lib/utils/date.util'
import type {
    AnalyticsSummary,
    DailyViewCount,
    TopPage,
    TrafficSource,
    DeviceStats,
    BrowserStats,
    OSStats,
    GeoStats,
} from '@/lib/types/analytics.type'

// ============================================================================
// Summary Stats
// ============================================================================

/**
 * Get analytics summary stats for the dashboard header cards
 */
export const getAnalyticsSummary = cache(
    async (): Promise<AnalyticsSummary> => {
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
            db
                .select({ count: countDistinct(pageView.sessionId) })
                .from(pageView),

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
)

// ============================================================================
// Time Series Data
// ============================================================================

/**
 * Get page views over time for the specified number of days
 */
export const getPageViewsOverTime = cache(
    async (days = 30): Promise<DailyViewCount[]> => {
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
)

// ============================================================================
// Top Pages
// ============================================================================

/**
 * Get top pages by view count
 */
export const getTopPages = cache(async (limit = 10): Promise<TopPage[]> => {
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
})

/**
 * Get top pages within a date range
 */
export const getTopPagesInRange = cache(
    async (days = 30, limit = 10): Promise<TopPage[]> => {
        const startDate = new Date()
        startDate.setDate(startDate.getDate() - days)

        const results = await db
            .select({
                pagePath: pageView.pagePath,
                pageTitle: sql<string>`MAX(${pageView.pageTitle})`.as(
                    'pageTitle'
                ),
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
)

// ============================================================================
// Traffic Sources
// ============================================================================

/**
 * Get traffic sources breakdown
 */
export const getTrafficSources = cache(
    async (limit = 10): Promise<TrafficSource[]> => {
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
)

/**
 * Get UTM campaign breakdown
 */
export const getUTMCampaigns = cache(
    async (
        limit = 10
    ): Promise<{ campaign: string; views: number; sessions: number }[]> => {
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
)

// ============================================================================
// Device & Browser Stats
// ============================================================================

/**
 * Get device type breakdown
 */
export const getDeviceBreakdown = cache(async (): Promise<DeviceStats[]> => {
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
})

/**
 * Get browser breakdown
 */
export const getBrowserBreakdown = cache(
    async (limit = 10): Promise<BrowserStats[]> => {
        const results = await db
            .select({
                browser:
                    sql<string>`COALESCE(${pageView.browser}, 'Unknown')`.as(
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
)

/**
 * Get OS breakdown
 */
export const getOSBreakdown = cache(async (limit = 10): Promise<OSStats[]> => {
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
})

// ============================================================================
// Geo Distribution
// ============================================================================

/**
 * Get geographic distribution by country
 */
export const getGeoDistribution = cache(
    async (limit = 20): Promise<GeoStats[]> => {
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
)

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
