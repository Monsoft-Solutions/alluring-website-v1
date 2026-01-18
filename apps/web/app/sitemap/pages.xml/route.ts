/**
 * Static Pages Sitemap
 *
 * Generates sitemap XML for static pages and surgeon pages with accurate lastModified dates
 * based on the page-metadata.ts configuration.
 */
import { NextResponse } from 'next/server'

import { seoDefaults } from '@/lib/data/site-config'
import { pageLastModified } from '@/lib/data/page-metadata'
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
    { path: '/bbl-miami', changeFrequency: 'weekly', priority: 0.9 },
    { path: '/bridal-consultation', changeFrequency: 'weekly', priority: 0.9 },
    {
        path: '/new-beginning-consultation',
        changeFrequency: 'weekly',
        priority: 0.9,
    },
    // Legal pages
    { path: '/privacy', changeFrequency: 'yearly', priority: 0.3 },
    { path: '/terms', changeFrequency: 'yearly', priority: 0.3 },
    { path: '/cookies', changeFrequency: 'yearly', priority: 0.3 },
]

/**
 * GET handler for static pages and surgeon pages sitemap
 */
export function GET(): NextResponse {
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

        // Combine all entries
        const entries = [...staticEntries, ...surgeonEntries]

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
