'use client'

import { DateRangeProvider } from '@/components/analytics/date-range-context.component'
import { DateRangeSelector } from '@/components/analytics/date-range-selector.component'
import { AnalyticsStatsGrid } from '@/components/analytics/analytics-stats-grid.component'
import { PageViewsChartCard } from '@/components/analytics/pageviews-chart-card.component'
import { TopPagesCard } from '@/components/analytics/top-pages-card.component'
import { TrafficSourcesCard } from '@/components/analytics/traffic-sources-card.component'
import { DevicesCard } from '@/components/analytics/devices-card.component'
import { BrowsersCard } from '@/components/analytics/browsers-card.component'
import { GeoCard } from '@/components/analytics/geo-card.component'
import { PageDetailsCard } from '@/components/analytics/page-details-card.component'
import { SearchConsoleSummaryCard } from '@/components/analytics/search-console-summary-card.component'

/**
 * Client-side analytics page wrapper.
 *
 * Provides the DateRangeContext to all analytics cards and renders
 * the page header with the date range selector.
 */
export function AnalyticsPageClient() {
    return (
        <DateRangeProvider>
            <div className='space-y-8'>
                {/* Header with Date Range Selector */}
                <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                    <div>
                        <h1 className='text-2xl font-bold tracking-tight'>
                            Analytics
                        </h1>
                        <p className='text-muted-foreground'>
                            Cookie-free page view analytics for your website
                        </p>
                    </div>
                    <DateRangeSelector />
                </div>

                {/* Summary Stats */}
                <AnalyticsStatsGrid />

                {/* Page Views Over Time */}
                <PageViewsChartCard />

                {/* Google Search Console Summary */}
                <SearchConsoleSummaryCard />

                {/* Top Pages & Traffic Sources */}
                <div className='grid gap-6 lg:grid-cols-2'>
                    <TopPagesCard />
                    <TrafficSourcesCard />
                </div>

                {/* Device & Browser Stats */}
                <div className='grid gap-6 lg:grid-cols-3'>
                    <DevicesCard />
                    <BrowsersCard />
                    <GeoCard />
                </div>

                {/* Page Details Table */}
                <PageDetailsCard />
            </div>
        </DateRangeProvider>
    )
}
