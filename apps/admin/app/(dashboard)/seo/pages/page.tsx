import { PagesPageClient } from './pages-page-client.component'

export const metadata = {
    title: 'Page Performance | SEO | Admin',
    description:
        'Analyze page performance, filter by type, view trends, and get SEO recommendations from Google Search Console',
}

/**
 * SEO Page Performance page.
 *
 * Features:
 * - Filter pages by type (blog, procedures, marketing, other)
 * - Search pages by path
 * - Sortable table with clicks, impressions, CTR, position
 * - Expandable rows showing performance trends, queries, and SEO recommendations
 * - Time period selector (7/28/90 days)
 * - Quick actions for editing blog posts
 */
export default function PagesPage() {
    return <PagesPageClient />
}
