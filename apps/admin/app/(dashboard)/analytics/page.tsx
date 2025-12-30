import { AnalyticsPageClient } from '@/components/analytics/analytics-page-client.component'

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
 *
 * The DateRangeProvider allows filtering all analytics by a selected time period.
 */
export default function AnalyticsPage() {
    return <AnalyticsPageClient />
}
