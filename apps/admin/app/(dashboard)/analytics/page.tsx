import { AnalyticsStatsGrid } from '@/components/analytics/analytics-stats-grid.component'
import { PageViewsChartCard } from '@/components/analytics/pageviews-chart-card.component'
import { TopPagesCard } from '@/components/analytics/top-pages-card.component'
import { TrafficSourcesCard } from '@/components/analytics/traffic-sources-card.component'
import { DevicesCard } from '@/components/analytics/devices-card.component'
import { BrowsersCard } from '@/components/analytics/browsers-card.component'
import { GeoCard } from '@/components/analytics/geo-card.component'
import { PageDetailsCard } from '@/components/analytics/page-details-card.component'

export const metadata = {
    title: 'Analytics | Admin',
    description:
        'Website analytics dashboard with page views, traffic sources, and visitor insights',
}

/**
 * Analytics page with independent data-fetching components.
 *
 * Each card component fetches its own data via TanStack Query,
 * enabling parallel loading and granular refresh capabilities.
 */
export default function AnalyticsPage() {
    return (
        <div className='space-y-8'>
            {/* Header */}
            <div>
                <h1 className='text-2xl font-bold tracking-tight'>Analytics</h1>
                <p className='text-muted-foreground'>
                    Cookie-free page view analytics for your website
                </p>
            </div>

            {/* Summary Stats */}
            <AnalyticsStatsGrid />

            {/* Page Views Over Time */}
            <PageViewsChartCard />

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
    )
}
