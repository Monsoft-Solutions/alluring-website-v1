/**
 * Google Search Console Sitemaps Service
 *
 * Manages sitemap submissions and status.
 *
 * @module @workspace/seo/search-console — sitemaps
 */
import type { SitemapInfo } from './search-console.type.js'

import {
    isSearchConsoleConfigured,
    getSearchConsoleClient,
    getSearchConsoleWriteClient,
    getSiteUrl,
} from './search-console-client.service.js'

/**
 * Get submitted sitemaps and their status
 */
export async function getSitemaps(): Promise<SitemapInfo[]> {
    if (!isSearchConsoleConfigured()) {
        return []
    }

    try {
        const client = getSearchConsoleClient()
        const siteUrl = getSiteUrl()

        const response = await client.sitemaps.list({
            siteUrl,
        })

        const sitemaps = response.data.sitemap ?? []

        return sitemaps.map((sitemap) => ({
            path: sitemap.path ?? '',
            lastSubmitted: sitemap.lastSubmitted ?? null,
            lastDownloaded: sitemap.lastDownloaded ?? null,
            isPending: sitemap.isPending ?? false,
            isSitemapsIndex: sitemap.isSitemapsIndex ?? false,
            type: sitemap.type ?? 'unknown',
            warnings: sitemap.warnings ? Number(sitemap.warnings) : 0,
            errors: sitemap.errors ? Number(sitemap.errors) : 0,
            contents:
                sitemap.contents?.map((c) => ({
                    type: c.type ?? 'unknown',
                    submitted: c.submitted ? Number(c.submitted) : 0,
                    indexed: c.indexed ? Number(c.indexed) : 0,
                })) ?? [],
        }))
    } catch (error) {
        console.error('Error fetching sitemaps:', error)
        throw error
    }
}

/**
 * Submit (or resubmit) a sitemap to Google Search Console
 *
 * This notifies Google that the sitemap should be re-crawled.
 * Note: Uses full webmasters scope (not readonly) for write access.
 *
 * @param sitemapPath - The full URL of the sitemap (e.g., https://example.com/sitemap.xml)
 */
export async function submitSitemap(sitemapPath: string): Promise<void> {
    if (!isSearchConsoleConfigured()) {
        throw new Error('Google Search Console is not configured')
    }

    try {
        const client = getSearchConsoleWriteClient()
        const siteUrl = getSiteUrl()

        await client.sitemaps.submit({
            siteUrl,
            feedpath: sitemapPath,
        })
    } catch (error) {
        console.error('Error submitting sitemap:', error)
        throw error
    }
}
