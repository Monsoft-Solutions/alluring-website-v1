/**
 * Google Search Console URL Inspection Service
 *
 * Inspects URLs for indexing status and mobile usability.
 *
 * @module @/lib/services/search-console/google-search-console-inspection
 */
import type { UrlInspectionResult } from '@/lib/types/search-console/search-console.type'

import {
    isSearchConsoleConfigured,
    getSiteUrl,
    getSearchConsoleClient,
} from './google-search-console-client.service'

/**
 * Inspect a URL using the URL Inspection API
 * Note: This has quota limits (2,000 requests/day), use sparingly
 */
export async function inspectUrl(url: string): Promise<UrlInspectionResult> {
    if (!isSearchConsoleConfigured()) {
        throw new Error('Google Search Console is not configured')
    }

    try {
        const searchConsole = getSearchConsoleClient()

        const siteUrl = getSiteUrl()

        const response = await searchConsole.urlInspection.index.inspect({
            requestBody: {
                inspectionUrl: url,
                siteUrl,
            },
        })

        const result = response.data.inspectionResult
        const indexStatus = result?.indexStatusResult
        const mobileUsability = result?.mobileUsabilityResult

        return {
            url,
            indexingState: indexStatus?.indexingState ?? 'UNKNOWN',
            coverageState: indexStatus?.coverageState ?? 'UNKNOWN',
            robotsTxtState: indexStatus?.robotsTxtState ?? 'UNKNOWN',
            lastCrawlTime: indexStatus?.lastCrawlTime ?? null,
            pageFetchState: indexStatus?.pageFetchState ?? 'UNKNOWN',
            referringUrls: indexStatus?.referringUrls ?? [],
            mobileUsability:
                mobileUsability?.verdict ?? 'MOBILE_USABILITY_UNSPECIFIED',
        }
    } catch (error) {
        console.error('Error inspecting URL:', error)
        throw error
    }
}

/**
 * Inspect multiple URLs (batch inspection)
 * Respects quota by limiting concurrent requests
 */
export async function inspectUrls(
    urls: string[]
): Promise<UrlInspectionResult[]> {
    if (!isSearchConsoleConfigured()) {
        return []
    }

    // Process URLs sequentially to avoid rate limiting
    const results: UrlInspectionResult[] = []

    for (const url of urls) {
        try {
            const result = await inspectUrl(url)
            results.push(result)
            // Small delay between requests to avoid rate limiting
            await new Promise((resolve) => setTimeout(resolve, 200))
        } catch (err) {
            console.error(`Failed to inspect URL: ${url}`, err)
            // Add a placeholder result for failed inspections
            results.push({
                url,
                indexingState: 'ERROR',
                coverageState: 'ERROR',
                robotsTxtState: 'UNKNOWN',
                lastCrawlTime: null,
                pageFetchState: 'ERROR',
                referringUrls: [],
                mobileUsability: 'MOBILE_USABILITY_UNSPECIFIED',
            })
        }
    }

    return results
}
