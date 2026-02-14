/**
 * Blog Sitemap
 *
 * Generates sitemap XML for blog content including:
 * - Blog posts with featured images (for image SEO)
 *
 * Category pages are excluded (noindexed to prevent cannibalization with procedure pages).
 *
 * Revalidates every 3 hours to balance freshness with performance
 */
import { NextResponse } from 'next/server'

// Revalidate every 3 hours (10800 seconds)
export const revalidate = 10800

import { pageLastModified } from '@/lib/data/page-metadata'
import { seoDefaults } from '@/lib/data/site-config'
import {
    getMostRecentPostDate,
    getPublishedPostSlugs,
} from '@/lib/queries/blog/sitemap.query'
import { isCrawlingAllowed } from '@/lib/utils/crawling'
import { getBlogPostAbsoluteUrl } from '@/lib/utils/blog-url.util'
import type { SitemapEntry } from '@workspace/seo/types/sitemap/sitemap-entry.type'
import { generateSitemapXml } from '@workspace/seo/utils'

/**
 * Slugs to exclude from the blog sitemap.
 * These are redirect source slugs from next.config.mjs — they redirect to
 * canonical blog posts or procedure pages, so they must not appear in the sitemap.
 */
const SITEMAP_EXCLUDED_SLUGS = new Set([
    // Duplicate blog content consolidation redirects
    'mommy-makeover-recovery-timeline',
    'mommy-makeover-recovery-guide',
    'mommy-makeover-recovery-time-miami',
    'mommy-makeover-recovery-pain-management',
    'mommy-makeover-recovery-pain-guide',
    'miami-liposuction-cost',
    'blepharoplasty-candidate-checklist',
    'blepharoplasty-miami-candidate',
    'best-blepharoplasty-age-miami',
    'liposuction-candidate-checklist-miami',
    'liposuction-miami-moms-faq',
    'breast-reduction-miami-recovery-candidates',
    // Anti-cannibalization redirects (blog → procedure pages)
    'what-is-the-mommy-makeover-procedure',
    'liposuction-cost-miami',
    'breast-reduction-cost-miami',
    'miami-breast-reduction-cost-weight-loss',
    'facelift-cost-miami',
    'breast-reduction-surgeons-miami',
    'best-breast-lift-surgeons-miami',
])

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
        // Get most recent post date for listing pages
        const mostRecentPostDate = await getMostRecentPostDate()
        const mostRecentPostDateStr = mostRecentPostDate
            ?.toISOString()
            .slice(0, 10)

        // Blog main listing page
        entries.push({
            url: `${baseUrl}/blog`,
            lastModified:
                mostRecentPostDateStr ?? pageLastModified['/blog'] ?? today,
            changeFrequency: 'daily',
            priority: 0.9,
        })

        // Blog posts (date-aware URLs: pre-2026 at root, post-2025 at /blog/)
        // Filter out redirect source slugs that should not appear in the sitemap
        const allPosts = await getPublishedPostSlugs()
        const posts = allPosts.filter(
            (post) => !SITEMAP_EXCLUDED_SLUGS.has(post.slug)
        )
        for (const post of posts) {
            const entry: SitemapEntry = {
                url: getBlogPostAbsoluteUrl(
                    baseUrl,
                    post.slug,
                    post.publishedAt
                ),
                lastModified: post.updatedAt.toISOString().slice(0, 10),
                changeFrequency: 'weekly',
                priority: 0.7,
            }

            // Add featured image if available (with caption for better image SEO)
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

        // Category pages are noindexed and excluded from the sitemap
        // to prevent keyword cannibalization with procedure pages.
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
