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

type SitemapEntry = {
    url: string
    lastModified: string
    changeFrequency: string
    priority: number
    images?: Array<{ url: string; title?: string }>
}

/**
 * Static pages configuration with SEO metadata
 */
const STATIC_PAGES: Array<{
    path: string
    changeFrequency: string
    priority: number
}> = [
    { path: '/', changeFrequency: 'daily', priority: 1.0 },
    { path: '/about', changeFrequency: 'monthly', priority: 0.8 },
    { path: '/contact-us', changeFrequency: 'monthly', priority: 0.7 },
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
    { path: '/thank-you', changeFrequency: 'yearly', priority: 0.3 },
    { path: '/privacy', changeFrequency: 'yearly', priority: 0.3 },
    { path: '/terms', changeFrequency: 'yearly', priority: 0.3 },
    { path: '/cookies', changeFrequency: 'yearly', priority: 0.3 },
]

/**
 * Escape special XML characters
 */
function escapeXml(str: string): string {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;')
}

/**
 * Generate XML sitemap string from entries with image support
 */
function generateSitemapXml(entries: SitemapEntry[]): string {
    const urls = entries
        .map((entry) => {
            const imageXml = entry.images?.length
                ? entry.images
                      .map(
                          (img) => `
    <image:image>
      <image:loc>${escapeXml(img.url)}</image:loc>${
          img.title
              ? `
      <image:title>${escapeXml(img.title)}</image:title>`
              : ''
      }
    </image:image>`
                      )
                      .join('')
                : ''

            return `
  <url>
    <loc>${escapeXml(entry.url)}</loc>
    <lastmod>${entry.lastModified}</lastmod>
    <changefreq>${entry.changeFrequency}</changefreq>
    <priority>${entry.priority}</priority>${imageXml}
  </url>`
        })
        .join('')

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls}
</urlset>`
}

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
}
