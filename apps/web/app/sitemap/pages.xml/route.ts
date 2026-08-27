/**
 * Static Pages Sitemap
 *
 * Generates sitemap XML for static pages and surgeon pages with accurate lastModified dates
 * based on the page-metadata.ts configuration.
 */
import { NextResponse } from 'next/server'

// Revalidate every 3 hours (10800 seconds), matching sitemap/blog.xml
export const revalidate = 10800

import { seoDefaults } from '@/lib/data/site-config'
import { pageLastModified } from '@/lib/data/page-metadata'
import { getReviewsPageCount } from '@/lib/queries/reviews/google-reviews.query'
import { surgeons } from '@/lib/data/surgeons/surgeons-data'
import { isCrawlingAllowed } from '@/lib/utils/crawling'
import type { SitemapEntry } from '@workspace/seo/types/sitemap/sitemap-entry.type'
import { generateSitemapXml } from '@workspace/seo/utils'

/**
 * Static pages configuration with SEO metadata
 */
const STATIC_PAGES: Array<{
    path: string
    changeFrequency: SitemapEntry['changeFrequency']
    priority: number
}> = [
    { path: '/', changeFrequency: 'daily', priority: 1.0 },
    { path: '/about', changeFrequency: 'monthly', priority: 0.8 },
    { path: '/contact-us', changeFrequency: 'monthly', priority: 0.7 },
    { path: '/faqs', changeFrequency: 'monthly', priority: 0.7 },
    {
        path: '/plastic-surgery-financing-miami',
        changeFrequency: 'monthly',
        priority: 0.9,
    },
    {
        path: '/miami-plastic-surgery-specials',
        changeFrequency: 'weekly',
        priority: 0.9,
    },
    {
        path: '/bmi-calculator',
        changeFrequency: 'monthly',
        priority: 0.8,
    },
    { path: '/reviews', changeFrequency: 'weekly', priority: 0.9 },
    // Landing pages - General
    { path: '/free-consultation', changeFrequency: 'weekly', priority: 0.9 },
    {
        path: '/free-consultation/miami',
        changeFrequency: 'weekly',
        priority: 0.9,
    },
    { path: '/fly-in-consultation', changeFrequency: 'weekly', priority: 0.9 },
    // Landing pages - Audience-specific
    {
        path: '/mommy-makeover-consultation',
        changeFrequency: 'weekly',
        priority: 0.9,
    },
    {
        path: '/after-weight-loss-consultation',
        changeFrequency: 'weekly',
        priority: 0.9,
    },
    { path: '/consulta-gratis', changeFrequency: 'weekly', priority: 0.9 },
    { path: '/bbl-miami', changeFrequency: 'weekly', priority: 0.85 },
    { path: '/bridal-consultation', changeFrequency: 'weekly', priority: 0.9 },
    {
        path: '/new-beginning-consultation',
        changeFrequency: 'weekly',
        priority: 0.9,
    },
    {
        path: '/mens-plastic-surgery-miami',
        changeFrequency: 'weekly',
        priority: 0.9,
    },
    // Legal pages
    { path: '/privacy', changeFrequency: 'yearly', priority: 0.3 },
    { path: '/terms', changeFrequency: 'yearly', priority: 0.3 },
    { path: '/cookies', changeFrequency: 'yearly', priority: 0.3 },
    // Engagement pages
    { path: '/quiz', changeFrequency: 'monthly', priority: 0.7 },
    // Instagram hub — the only indexable Instagram page; the /instagram/[code]
    // detail pages are noindex and have no sitemap (issue #118)
    { path: '/instagram', changeFrequency: 'daily', priority: 0.8 },
    // Utility pages
    { path: '/html-sitemap', changeFrequency: 'weekly', priority: 0.4 },
    // Social/bio link pages
    { path: '/links', changeFrequency: 'weekly', priority: 0.5 },
]

/**
 * GET handler for static pages and surgeon pages sitemap
 */
export async function GET(): Promise<NextResponse> {
    // Return empty sitemap if crawling is not allowed
    if (!isCrawlingAllowed()) {
        return new NextResponse(
            `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
</urlset>`,
            {
                headers: {
                    'Content-Type': 'application/xml',
                    'Cache-Control': 'public, max-age=3600, s-maxage=3600',
                },
            }
        )
    }

    const baseUrl = seoDefaults.siteUrl
    const today = new Date().toISOString().slice(0, 10)

    try {
        // Generate static page entries with accurate lastModified dates
        const staticEntries: SitemapEntry[] = STATIC_PAGES.map((page) => ({
            url: `${baseUrl}${page.path === '/' ? '' : page.path}`,
            lastModified: pageLastModified[page.path] ?? today,
            changeFrequency: page.changeFrequency,
            priority: page.priority,
        }))

        // Generate surgeon page entries with images
        const surgeonEntries: SitemapEntry[] = surgeons.map((surgeon) => {
            const entry: SitemapEntry = {
                url: `${baseUrl}/${surgeon.slug}`,
                lastModified: pageLastModified[`/${surgeon.slug}`] ?? today,
                changeFrequency: 'monthly',
                priority: 0.8,
            }

            // Add surgeon image if available
            if (surgeon.images.featured) {
                const imageUrl = surgeon.images.featured.startsWith('http')
                    ? surgeon.images.featured
                    : `${baseUrl}${surgeon.images.featured}`

                entry.images = [
                    {
                        url: imageUrl,
                        title: surgeon.name,
                    },
                ]
            }

            return entry
        })

        // Reviews pages 2..N (`/reviews` itself is in STATIC_PAGES above).
        // The pagination nav already links them, but listing them here is what
        // gets the deeper pages crawled at a sensible rate rather than
        // whenever a crawler happens to walk the chain. Lower priority than
        // page 1 — the same set, further from the entry point.
        //
        // Isolated try/catch on purpose: this is the only database call in the
        // route, and every other entry here is static. Letting an intermittent
        // pooler timeout reach the outer handler would answer with an empty
        // <urlset> and drop all ~60 static and surgeon URLs over a few
        // paginated ones. Degrade to "no pagination entries" instead.
        let reviewsPaginationEntries: SitemapEntry[] = []
        try {
            const reviewsPageCount = await getReviewsPageCount()
            reviewsPaginationEntries = Array.from(
                { length: Math.max(0, reviewsPageCount - 1) },
                (_, i) => ({
                    url: `${baseUrl}/reviews/page/${i + 2}`,
                    lastModified: pageLastModified['/reviews'] ?? today,
                    changeFrequency: 'weekly' as const,
                    priority: 0.5,
                })
            )
        } catch (error) {
            console.error(
                'Could not read the reviews page count; omitting reviews pagination from the sitemap:',
                error
            )
        }

        // Combine all entries
        const entries = [
            ...staticEntries,
            ...reviewsPaginationEntries,
            ...surgeonEntries,
        ]

        const xml = generateSitemapXml(entries)

        return new NextResponse(xml, {
            headers: {
                'Content-Type': 'application/xml',
                'Cache-Control': 'public, max-age=3600, s-maxage=3600',
            },
        })
    } catch (error) {
        console.error('Error generating pages sitemap:', error)
        return new NextResponse(
            `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
</urlset>`,
            {
                status: 500,
                headers: {
                    'Content-Type': 'application/xml',
                },
            }
        )
    }
}
