/**
 * Google Search Console Client Service
 *
 * Handles authentication and client creation for Google Search Console API.
 *
 * @module @/lib/services/search-console/google-search-console-client
 */
import { google } from 'googleapis'

import { env } from '@/env'

/**
 * Check if Google Search Console credentials are configured
 */
export function isSearchConsoleConfigured(): boolean {
    return Boolean(
        env.GOOGLE_CLIENT_EMAIL &&
            env.GOOGLE_PRIVATE_KEY &&
            env.GOOGLE_SEARCH_CONSOLE_SITE_URL
    )
}

/**
 * Get the site URL for Search Console queries
 *
 * Supports both property types:
 * - Domain properties: "sc-domain:example.com"
 * - URL-prefix properties: "https://example.com"
 */
export function getSiteUrl(): string {
    const siteUrl = env.GOOGLE_SEARCH_CONSOLE_SITE_URL
    if (!siteUrl) {
        throw new Error('GOOGLE_SEARCH_CONSOLE_SITE_URL is not configured')
    }
    // For URL-prefix properties, remove trailing slash if present
    if (siteUrl.startsWith('http') && siteUrl.endsWith('/')) {
        return siteUrl.slice(0, -1)
    }
    return siteUrl
}

/**
 * Parse the private key to handle escaped newlines
 */
function parsePrivateKey(key: string): string {
    // Handle newlines in the private key (environment variables can escape them)
    return key.replace(/\\n/g, '\n')
}

/**
 * Get an authenticated Search Console client with specific scope
 */
function createClient(scope: string) {
    if (!isSearchConsoleConfigured()) {
        throw new Error('Google Search Console credentials are not configured')
    }

    const auth = new google.auth.GoogleAuth({
        credentials: {
            client_email: env.GOOGLE_CLIENT_EMAIL,
            private_key: parsePrivateKey(env.GOOGLE_PRIVATE_KEY!),
        },
        scopes: [scope],
    })

    return google.searchconsole({
        version: 'v1',
        auth,
    })
}

/**
 * Get an authenticated Search Console client (readonly scope)
 * Uses service account credentials for server-to-server authentication
 */
export function getSearchConsoleClient() {
    return createClient('https://www.googleapis.com/auth/webmasters.readonly')
}

/**
 * Get an authenticated Search Console client with write access
 * Required for operations like submitting sitemaps
 */
export function getSearchConsoleWriteClient() {
    return createClient('https://www.googleapis.com/auth/webmasters')
}
