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
import { count, desc, gte, sql, countDistinct, and, lte } from 'drizzle-orm'

import { fillMissingDatesWithViews } from '@/lib/utils/date.util'
import type {
    AnalyticsSummary,
    DailyViewCount,
    HourlyViewCount,
    TopPage,
    TrafficSource,
    DeviceStats,
    BrowserStats,
    OSStats,
    GeoStats,
} from '@/lib/types/analytics/analytics.type'

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Calculate start date based on days parameter.
 *
 * @param days - Number of days to go back (0 = today only, 1 = yesterday only)
 * @returns Object with startDate and endDate
 */
function getDateRange(days: number): { startDate: Date; endDate: Date } {
    const now = new Date()
    const endDate = new Date(now)
    endDate.setHours(23, 59, 59, 999)

    const startDate = new Date(now)
    startDate.setHours(0, 0, 0, 0)

    if (days === 0) {
        // Today only - start and end are both today
        return { startDate, endDate }
    } else if (days === 1) {
        // Yesterday only
        startDate.setDate(startDate.getDate() - 1)
        endDate.setDate(endDate.getDate() - 1)
        return { startDate, endDate }
    } else {
        // Last N days (includes today)
        startDate.setDate(startDate.getDate() - (days - 1))
        return { startDate, endDate }
    }
}

// ============================================================================
// Summary Stats
// ============================================================================

/**
 * Get analytics summary stats for the dashboard header cards
 *
 * @param days - Number of days to analyze (0 = today, 1 = yesterday)
 */
export const getAnalyticsSummary = cache(
    async (days = 7): Promise<AnalyticsSummary> => {
        const { startDate, endDate } = getDateRange(days)

        const [
            totalViewsResult,
            uniqueSessionsResult,
            todayViewsResult,
            topPageResult,
            topSourceResult,
        ] = await Promise.all([
            // Total views in the period
            db
                .select({ count: count() })
                .from(pageView)
                .where(
                    and(
                        gte(pageView.createdAt, startDate),
                        lte(pageView.createdAt, endDate)
                    )
                ),

            // Unique sessions in the period
            db
                .select({ count: countDistinct(pageView.sessionId) })
                .from(pageView)
                .where(
                    and(
                        gte(pageView.createdAt, startDate),
                        lte(pageView.createdAt, endDate)
                    )
                ),

            // Today's views (always today regardless of period)
            (() => {
                const today = new Date()
                today.setHours(0, 0, 0, 0)
                return db
                    .select({ count: count() })
                    .from(pageView)
                    .where(gte(pageView.createdAt, today))
            })(),

            // Top page by views in the period
            db
                .select({
                    pagePath: pageView.pagePath,
                    views: count(),
                })
                .from(pageView)
                .where(
                    and(
                        gte(pageView.createdAt, startDate),
                        lte(pageView.createdAt, endDate)
                    )
                )
                .groupBy(pageView.pagePath)
                .orderBy(desc(count()))
                .limit(1),

            // Top source in the period
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
                .where(
                    and(
                        gte(pageView.createdAt, startDate),
                        lte(pageView.createdAt, endDate)
                    )
                )
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
        const { startDate } = getDateRange(days)

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

/**
 * Get page views grouped by hour for a specific date.
 * Used for Today/Yesterday hourly breakdown.
 *
 * @param targetDate - The date to get hourly data for
 */
export const getPageViewsByHour = cache(
    async (targetDate: Date): Promise<HourlyViewCount[]> => {
        const startOfDay = new Date(targetDate)
        startOfDay.setHours(0, 0, 0, 0)

        const endOfDay = new Date(targetDate)
        endOfDay.setHours(23, 59, 59, 999)

        const results = await db
            .select({
                hour: sql<number>`EXTRACT(HOUR FROM ${pageView.createdAt})::int`.as(
                    'hour'
                ),
                views: count(),
                sessions: countDistinct(pageView.sessionId),
            })
            .from(pageView)
            .where(
                and(
                    gte(pageView.createdAt, startOfDay),
                    lte(pageView.createdAt, endOfDay)
                )
            )
            .groupBy(sql`EXTRACT(HOUR FROM ${pageView.createdAt})`)
            .orderBy(sql`EXTRACT(HOUR FROM ${pageView.createdAt})`)

        // Fill in missing hours with zeros (0-23)
        const hourlyData: HourlyViewCount[] = []
        const resultMap = new Map(results.map((r) => [r.hour, r]))

        for (let hour = 0; hour < 24; hour++) {
            const existing = resultMap.get(hour)
            hourlyData.push({
                hour,
                views: existing?.views ?? 0,
                sessions: existing?.sessions ?? 0,
            })
        }

        return hourlyData
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
        const { startDate, endDate } = getDateRange(days)

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
            .where(
                and(
                    gte(pageView.createdAt, startDate),
                    lte(pageView.createdAt, endDate)
                )
            )
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
 *
 * @param days - Number of days to analyze
 * @param limit - Max number of sources to return
 */
export const getTrafficSources = cache(
    async (days = 30, limit = 10): Promise<TrafficSource[]> => {
        const { startDate, endDate } = getDateRange(days)

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
            .where(
                and(
                    gte(pageView.createdAt, startDate),
                    lte(pageView.createdAt, endDate)
                )
            )
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
 *
 * @param days - Number of days to analyze
 */
export const getDeviceBreakdown = cache(
    async (days = 30): Promise<DeviceStats[]> => {
        const { startDate, endDate } = getDateRange(days)

        const results = await db
            .select({
                deviceType:
                    sql<string>`COALESCE(${pageView.deviceType}, 'unknown')`.as(
                        'deviceType'
                    ),
                views: count(),
            })
            .from(pageView)
            .where(
                and(
                    gte(pageView.createdAt, startDate),
                    lte(pageView.createdAt, endDate)
                )
            )
            .groupBy(pageView.deviceType)
            .orderBy(desc(count()))

        // Calculate percentages
        const total = results.reduce((sum, r) => sum + r.views, 0)
        return results.map((r) => ({
            ...r,
            percentage: total > 0 ? Math.round((r.views / total) * 100) : 0,
        }))
    }
)

/**
 * Get browser breakdown
 *
 * @param days - Number of days to analyze
 * @param limit - Max number of browsers to return
 */
export const getBrowserBreakdown = cache(
    async (days = 30, limit = 10): Promise<BrowserStats[]> => {
        const { startDate, endDate } = getDateRange(days)

        const results = await db
            .select({
                browser:
                    sql<string>`COALESCE(${pageView.browser}, 'Unknown')`.as(
                        'browser'
                    ),
                views: count(),
            })
            .from(pageView)
            .where(
                and(
                    gte(pageView.createdAt, startDate),
                    lte(pageView.createdAt, endDate)
                )
            )
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
 *
 * @param days - Number of days to analyze
 * @param limit - Max number of countries to return
 */
export const getGeoDistribution = cache(
    async (days = 30, limit = 20): Promise<GeoStats[]> => {
        const { startDate, endDate } = getDateRange(days)

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
            .where(
                and(
                    gte(pageView.createdAt, startDate),
                    lte(pageView.createdAt, endDate)
                )
            )
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
