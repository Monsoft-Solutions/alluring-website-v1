/**
 * Instagram Sitemap
 *
 * Generates sitemap XML for Instagram content including:
 * - Main Instagram listing page
 * - Individual Instagram post pages with images and videos
 *
 * Supports both image and video sitemap extensions for comprehensive SEO.
 * Revalidates every 3 hours to balance freshness with performance
 */
import { NextResponse } from 'next/server'

// Revalidate every 3 hours (10800 seconds)
export const revalidate = 10800

import { pageLastModified } from '@/lib/data/page-metadata'
import { seoDefaults } from '@/lib/data/site-config'
import {
    getInstagramPostsForSitemap,
    getMostRecentInstagramPostDate,
} from '@/lib/queries/instagram/sitemap.query'
import type { SitemapEntry } from '@workspace/seo/types/sitemap/sitemap-entry.type'
import { generateSitemapXml } from '@workspace/seo/utils'

/**
 * GET handler for Instagram sitemap
 */
export async function GET(): Promise<NextResponse> {
    const baseUrl = seoDefaults.siteUrl
    const entries: SitemapEntry[] = []
    const today = new Date().toISOString().slice(0, 10)

    try {
        // Get most recent post date for listing page
        const mostRecentPostDate = await getMostRecentInstagramPostDate()
        const mostRecentPostDateStr = mostRecentPostDate
            ?.toISOString()
            .slice(0, 10)

        // Instagram main listing page
        entries.push({
            url: `${baseUrl}/instagram`,
            lastModified:
                mostRecentPostDateStr ??
                pageLastModified['/instagram'] ??
                today,
            changeFrequency: 'daily',
            priority: 0.8,
        })

        // Individual Instagram posts
        const posts = await getInstagramPostsForSitemap()
        for (const post of posts) {
            const entry: SitemapEntry = {
                url: `${baseUrl}/instagram/${post.code}`,
                lastModified: post.takenAt.toISOString().slice(0, 10),
                changeFrequency: 'monthly',
                priority: 0.5,
            }

            // Generate title: prefer seoTitle, fallback to caption, then default
            let imageTitle =
                post.seoTitle ??
                (post.caption
                    ? post.caption.substring(0, 100)
                    : `Instagram post ${post.code}`)

            imageTitle += ' | Alluring Plastic Surgery'

            // Add post image for image sitemap (uses thumbnail for videos)
            if (post.imageUrl) {
                entry.images = [
                    {
                        url: post.imageUrl,
                        title: imageTitle,
                    },
                ]
            }

            // Add video data for video sitemap (video posts only)
            if (post.mediaType === 'video' && post.videoUrl) {
                // Prefer SEO metadata, fallback to caption
                let videoTitle =
                    post.seoTitle ??
                    (post.caption
                        ? post.caption.substring(0, 100)
                        : `Instagram video post ${post.code}`)
                videoTitle += ' | Alluring Plastic Surgery'
                const videoDescription =
                    post.seoDescription ??
                    (post.caption
                        ? post.caption
                              .substring(0, 160)
                              .replace(/\s+/g, ' ')
                              .trim()
                        : `Instagram video from Alluring Plastic Surgery`)

                entry.videos = [
                    {
                        thumbnailUrl: post.thumbnailUrl ?? post.imageUrl,
                        title: videoTitle,
                        description: videoDescription,
                        contentUrl: post.videoUrl,
                        publicationDate: post.takenAt.toISOString(),
                    },
                ]
            }

            entries.push(entry)
        }
    } catch (error) {
        console.error('Error generating Instagram sitemap:', error)
        return new NextResponse(
            `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
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
