import { QueriesPageClient } from './queries-page-client.component'

export const metadata = {
    title: 'Query Performance | SEO | Admin',
    description:
        'Analyze search query performance, discover content gaps, and track query trends from Google Search Console',
}

/**
 * SEO Query Performance page.
 *
 * Features:
 * - Search queries by term with contains filter
 * - Sortable table with clicks, impressions, CTR, position
 * - Expandable rows showing related pages and trends
 * - Content gap indicators for queries needing dedicated content
 * - Time period selector (7/28/90 days)
 */
export default function QueriesPage() {
    return <QueriesPageClient />
}
