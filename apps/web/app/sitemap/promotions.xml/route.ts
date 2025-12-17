/**
 * Promotions Sitemap
 *
 * Generates sitemap XML for promotion content including:
 * - Main promotions listing page
 * - Individual promotion detail pages with images
 */
import { NextResponse } from 'next/server'

import { pageLastModified } from '@/lib/data/page-metadata'
import { seoDefaults } from '@/lib/data/site-config'
import { getPromotionsForSitemap } from '@/lib/queries/promotion/sitemap.query'
import { isCrawlingAllowed } from '@/lib/utils/crawling'

type SitemapEntry = {
    url: string
    lastModified: string
    changeFrequency: string
    priority: number
    images?: Array<{ url: string; title?: string }>
}

/**
 * Generate XML sitemap string with image support
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
 * GET handler for promotions sitemap
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
    const entries: SitemapEntry[] = []
    const today = new Date().toISOString().slice(0, 10)

    try {
        // Promotions main listing page
        entries.push({
            url: `${baseUrl}/promotions`,
            lastModified: pageLastModified['/promotions'] ?? today,
            changeFrequency: 'weekly',
            priority: 0.9,
        })

        // Individual promotion pages
        const promotions = await getPromotionsForSitemap()
        for (const promo of promotions) {
            const entry: SitemapEntry = {
                url: `${baseUrl}/promotions/${promo.slug}`,
                lastModified: promo.updatedAt.toISOString().slice(0, 10),
                changeFrequency: 'weekly',
                priority: 0.8,
            }

            // Add promotion image if available
            if (promo.imageUrl) {
                entry.images = [
                    {
                        url: promo.imageUrl,
                        title: promo.imageAlt ?? promo.title,
                    },
                ]
            }

            entries.push(entry)
        }
    } catch (error) {
        console.error('Error generating promotions sitemap:', error)
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

    const xml = generateSitemapXml(entries)

    return new NextResponse(xml, {
        headers: {
            'Content-Type': 'application/xml',
            'Cache-Control': 'public, max-age=3600, s-maxage=3600',
        },
    })
}
