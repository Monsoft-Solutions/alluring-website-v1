/**
 * Sitemap Index
 *
 * Returns a sitemap index referencing the child sitemaps, organised by content
 * type so Search Console reports coverage per section.
 *
 * This is a route handler rather than Next's `sitemap.ts` convention because
 * that convention only emits `<urlset><url>`, which is the wrong element for an
 * index — the protocol requires `<sitemapindex><sitemap>`. Crawlers mostly
 * tolerate the mismatch, but it is a spec violation and cheap to get right.
 *
 * Child sitemaps:
 * - /sitemap/pages.xml - Static pages and surgeon profiles
 * - /sitemap/blog.xml - Blog posts, categories, and tags
 * - /sitemap/procedures.xml - Procedure listings and details
 * - /sitemap/gallery.xml - Gallery groups and media
 * - /sitemap/promotions.xml - Special offers and promotions
 */
import { NextResponse } from 'next/server'

import { getSitemapChildUrls } from '@/lib/seo/sitemap-children'
import { isCrawlingAllowed } from '@/lib/utils/crawling'

const XML_HEADERS = {
    'Content-Type': 'application/xml',
    'Cache-Control': 'public, max-age=3600, s-maxage=3600',
} as const

const EMPTY_INDEX = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</sitemapindex>`

/**
 * GET handler for the sitemap index
 */
export function GET(): NextResponse {
    if (!isCrawlingAllowed()) {
        return new NextResponse(EMPTY_INDEX, { headers: XML_HEADERS })
    }

    const lastModified = new Date().toISOString()

    const children = getSitemapChildUrls()
        .map(
            (url) => `    <sitemap>
        <loc>${url}</loc>
        <lastmod>${lastModified}</lastmod>
    </sitemap>`
        )
        .join('\n')

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${children}
</sitemapindex>`

    return new NextResponse(xml, { headers: XML_HEADERS })
}
