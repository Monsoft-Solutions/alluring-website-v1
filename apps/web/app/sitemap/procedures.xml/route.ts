/**
 * Procedures Sitemap
 *
 * Generates sitemap XML for procedure content including:
 * - Main procedures listing page
 * - Individual procedure detail pages with images
 */
import { NextResponse } from 'next/server'

import { seoDefaults } from '@/lib/data/site-config'
import { procedures } from '@/lib/data/procedures.data'
import { isCrawlingAllowed } from '@/lib/utils/crawling'

type SitemapEntry = {
    url: string
    lastModified: string
    changeFrequency: string
    priority: number
    images?: Array<{ url: string; title?: string }>
}

/**
 * Last modified date for procedures
 * Update this when procedure content changes
 */
const PROCEDURES_LAST_MODIFIED = '2025-12-16'

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
 * GET handler for procedures sitemap
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

    try {
        // Procedures main listing page
        entries.push({
            url: `${baseUrl}/procedures`,
            lastModified: PROCEDURES_LAST_MODIFIED,
            changeFrequency: 'monthly',
            priority: 0.9,
        })

        // Individual procedure pages
        for (const procedure of procedures) {
            const entry: SitemapEntry = {
                url: `${baseUrl}/procedures/${procedure.slug}`,
                lastModified: PROCEDURES_LAST_MODIFIED,
                changeFrequency: 'monthly',
                priority: 0.8,
            }

            // Add procedure image if available
            if (procedure.image) {
                // Handle both relative and absolute URLs
                const imageUrl = procedure.image.startsWith('http')
                    ? procedure.image
                    : `${baseUrl}${procedure.image}`

                entry.images = [
                    {
                        url: imageUrl,
                        title: procedure.title,
                    },
                ]
            }

            entries.push(entry)
        }
    } catch (error) {
        console.error('Error generating procedures sitemap:', error)
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
