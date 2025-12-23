/**
 * Google Search Console URL Inspection Service
 *
 * Inspects URLs for indexing status and mobile usability.
 *
 * @module @/lib/services/search-console/google-search-console-inspection
 */
import { google } from 'googleapis'

import { env } from '@/env'
import type { UrlInspectionResult } from '@/lib/types/search-console/search-console.type'

import {
    isSearchConsoleConfigured,
    getSiteUrl,
} from './google-search-console-client.service'

/**
 * Parse the private key to handle escaped newlines
 */
function parsePrivateKey(key: string): string {
    return key.replace(/\\n/g, '\n')
}

/**
 * Inspect a URL using the URL Inspection API
 * Note: This has quota limits (2,000 requests/day), use sparingly
 */
export async function inspectUrl(url: string): Promise<UrlInspectionResult> {
    if (!isSearchConsoleConfigured()) {
        throw new Error('Google Search Console is not configured')
    }

    try {
        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: env.GOOGLE_CLIENT_EMAIL,
                private_key: parsePrivateKey(env.GOOGLE_PRIVATE_KEY!),
            },
            scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
        })

        const searchConsole = google.searchconsole({
            version: 'v1',
            auth,
        })

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
