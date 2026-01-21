/**
 * Procedures Sitemap
 *
 * Generates sitemap XML for procedure content including:
 * - Main procedures listing page
 * - Individual procedure detail pages with images
 */
import { NextResponse } from 'next/server'

import { pageLastModified } from '@/lib/data/page-metadata'
import { seoDefaults } from '@/lib/data/site-config'
import { procedures } from '@/lib/data/procedures.data'
import { isCrawlingAllowed } from '@/lib/utils/crawling'
import type { SitemapEntry } from '@workspace/seo/types/sitemap/sitemap-entry.type'
import { generateSitemapXml } from '@workspace/seo/utils'

/**
 * Get last modified date for a procedure page
 * Uses pageLastModified if available, otherwise falls back to the procedures listing page date
 */
function getProcedureLastModified(slug: string): string {
    const procedurePath = `/procedures/${slug}`
    return (
        pageLastModified[procedurePath] ??
        pageLastModified['/procedures'] ??
        new Date().toISOString().split('T')[0]!
    )
}

/**
 * GET handler for procedures sitemap
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
    const entries: SitemapEntry[] = []

    try {
        // Procedures main listing page
        entries.push({
            url: `${baseUrl}/procedures`,
            lastModified:
                pageLastModified['/procedures'] ??
                new Date().toISOString().split('T')[0]!,
            changeFrequency: 'monthly',
            priority: 0.9,
        })

        // Individual procedure pages
        for (const procedure of procedures) {
            const entry: SitemapEntry = {
                url: `${baseUrl}/procedures/${procedure.slug}`,
                lastModified: getProcedureLastModified(procedure.slug),
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
