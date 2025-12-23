import { SeoDashboard } from './seo-dashboard.component'

export const metadata = {
    title: 'SEO Insights | Admin',
    description:
        'Google Search Console analytics with search queries, page performance, and content opportunities',
}

/**
 * SEO Insights page with Google Search Console data.
 *
 * Features a tabbed interface with:
 * - Overview: Stats, trends, opportunities, queries, pages
 * - Position Tracking: Keyword ranking changes
 * - Blog Audit: SEO health for all blog posts
 * - Index Status: Sitemap and URL indexing status
 */
export default function SeoPage() {
    return <SeoDashboard />
}
