/**
 * Instagram Sitemap (retired)
 *
 * The ~800 /instagram/[code] detail pages were noindexed in issue #118
 * (thin-content consolidation) and are intentionally no longer listed in
 * any sitemap. Only the /instagram hub remains indexable, and it is
 * listed in /sitemap/pages.xml.
 *
 * This route deliberately keeps returning an EMPTY urlset with HTTP 200
 * instead of being deleted: the URL was previously submitted to Google
 * Search Console, and a 404 on a submitted sitemap shows as a persistent
 * "Couldn't fetch" error rather than a clean de-listing. Once Search
 * Console reports 0 discovered URLs and the submission has been removed
 * there, this route can be deleted.
 */
import { NextResponse } from 'next/server'

// Revalidate every 3 hours (10800 seconds), matching sitemap/blog.xml
export const revalidate = 10800

/**
 * GET handler — always returns an empty urlset
 */
export function GET(): NextResponse {
    return new NextResponse(
        `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>`,
        {
            headers: {
                'Content-Type': 'application/xml',
                'Cache-Control': 'public, max-age=3600, s-maxage=3600',
            },
        }
    )
}
