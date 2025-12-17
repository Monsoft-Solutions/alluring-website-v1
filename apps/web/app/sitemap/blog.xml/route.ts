/**
 * Blog Sitemap
 *
 * Generates sitemap XML for blog content including:
 * - Blog posts with featured images (for image SEO)
 * - Category pages
 * - Tag pages
 */
import { NextResponse } from 'next/server'

import { pageLastModified } from '@/lib/data/page-metadata'
import { seoDefaults } from '@/lib/data/site-config'
import {
    getActiveCategorySlugs,
    getActiveTagSlugs,
    getPublishedPostSlugs,
} from '@/lib/queries/blog/sitemap.query'
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
 * GET handler for blog sitemap
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
        // Blog main listing page
        entries.push({
            url: `${baseUrl}/blog`,
            lastModified: pageLastModified['/blog'] ?? today,
            changeFrequency: 'daily',
            priority: 0.9,
        })

        // Blog posts (root-level URLs to match WordPress structure)
        const posts = await getPublishedPostSlugs()
        for (const post of posts) {
            const entry: SitemapEntry = {
                url: `${baseUrl}/${post.slug}`,
                lastModified: post.updatedAt.toISOString().slice(0, 10),
                changeFrequency: 'weekly',
                priority: 0.7,
            }

            // Add featured image if available
            if (post.featuredImageUrl) {
                entry.images = [
                    {
                        url: post.featuredImageUrl,
                        title: post.featuredImageTitle ?? undefined,
                    },
                ]
            }

            entries.push(entry)
        }

        // Categories listing page
        entries.push({
            url: `${baseUrl}/blog/categories`,
            lastModified: pageLastModified['/blog/categories'] ?? today,
            changeFrequency: 'weekly',
            priority: 0.8,
        })

        // Category detail pages
        const categories = await getActiveCategorySlugs()
        for (const category of categories) {
            const lastModified =
                category.updatedAt?.toISOString().slice(0, 10) ??
                category.createdAt?.toISOString().slice(0, 10) ??
                today

            entries.push({
                url: `${baseUrl}/blog/categories/${category.slug}`,
                lastModified,
                changeFrequency: 'weekly',
                priority: 0.7,
            })
        }

        // Tags listing page
        entries.push({
            url: `${baseUrl}/blog/tags`,
            lastModified: pageLastModified['/blog/tags'] ?? today,
            changeFrequency: 'weekly',
            priority: 0.8,
        })

        // Tag detail pages
        const tags = await getActiveTagSlugs()
        for (const tag of tags) {
            entries.push({
                url: `${baseUrl}/blog/tags/${tag.slug}`,
                lastModified: tag.createdAt.toISOString().slice(0, 10),
                changeFrequency: 'weekly',
                priority: 0.6,
            })
        }
    } catch (error) {
        console.error('Error generating blog sitemap:', error)
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
