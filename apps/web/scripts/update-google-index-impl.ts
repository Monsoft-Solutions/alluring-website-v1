/**
 * Implementation of Google Index Update Script
 * This file is dynamically imported after environment variables are loaded
 */

import { parseString } from 'xml2js'
import { GoogleIndexingClient } from '@monsoft/google-indexing'

import { getSitemapChildUrls } from '@/lib/seo/sitemap-children'
import { seoDefaults } from '@/lib/data/site-config'

import type { ParsedSitemapXml } from './types/sitemap.types'

// Helper functions for credentials
function getClientEmail() {
    // eslint-disable-next-line no-restricted-properties
    if (!process.env.GOOGLE_CLIENT_EMAIL) {
        throw new Error('GOOGLE_CLIENT_EMAIL environment variable is not set')
    }
    // eslint-disable-next-line no-restricted-properties
    return process.env.GOOGLE_CLIENT_EMAIL
}

function getPrivateKey() {
    // eslint-disable-next-line no-restricted-properties
    if (!process.env.GOOGLE_PRIVATE_KEY) {
        throw new Error('GOOGLE_PRIVATE_KEY environment variable is not set')
    }
    // eslint-disable-next-line no-restricted-properties
    let key = process.env.GOOGLE_PRIVATE_KEY

    // Remove surrounding quotes and trailing comma if present
    // This handles cases like: "key value", or 'key value',
    key = key.trim().replace(/^["']|["'],?$/g, '')

    // Handle newlines in the private key (environment variables can strip newlines)
    key = key.replace(/\\n/g, '\n')

    return key
}

/**
 * Parse XML sitemap and extract URLs
 */
async function parseSitemapXml(xmlContent: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
        parseString(xmlContent, (err, result) => {
            if (err) {
                reject(new Error(String(err)))
                return
            }

            try {
                const urls: string[] = []
                const parsed = result as ParsedSitemapXml

                // Handle sitemap index format (contains sitemaps)
                if (parsed.sitemapindex?.sitemap) {
                    for (const sitemap of parsed.sitemapindex.sitemap) {
                        if (sitemap.loc?.[0]) {
                            urls.push(sitemap.loc[0])
                        }
                    }
                }

                // Handle regular sitemap format (contains URLs)
                if (parsed.urlset?.url) {
                    for (const url of parsed.urlset.url) {
                        if (url.loc?.[0]) {
                            urls.push(url.loc[0])
                        }
                    }
                }

                resolve(urls)
            } catch (error) {
                reject(
                    error instanceof Error ? error : new Error(String(error))
                )
            }
        })
    })
}

/**
 * Fetch and parse a sitemap from URL
 */
async function fetchSitemapUrls(sitemapUrl: string): Promise<string[]> {
    console.log(`   📄 Fetching: ${sitemapUrl}`)
    const response = await fetch(sitemapUrl)

    if (!response.ok) {
        throw new Error(
            `Failed to fetch sitemap: ${response.status} ${response.statusText}`
        )
    }

    const xmlContent = await response.text()
    return parseSitemapXml(xmlContent)
}

/**
 * Main execution function
 */
export async function main() {
    try {
        console.log('🚀 Starting Google indexing update...')

        // Get child sitemap URLs from the sitemap index
        console.log('📋 Fetching sitemap index...')
        const childSitemapUrls = getSitemapChildUrls()

        if (childSitemapUrls.length === 0) {
            console.error('❌ No child sitemaps found in sitemap index!')
            process.exit(1)
        }

        console.log(
            `✅ Found ${childSitemapUrls.length} child sitemaps to process\n`
        )

        // Fetch and parse each child sitemap to extract all page URLs
        console.log('📥 Fetching URLs from child sitemaps...')
        const allUrls: string[] = []

        for (const childSitemapUrl of childSitemapUrls) {
            try {
                const urls = await fetchSitemapUrls(childSitemapUrl)
                console.log(`      ✅ Found ${urls.length} URLs`)
                allUrls.push(...urls)
            } catch (error) {
                console.error(
                    `      ❌ Failed to fetch ${childSitemapUrl}:`,
                    error instanceof Error ? error.message : String(error)
                )
            }
        }

        if (allUrls.length === 0) {
            console.error('\n❌ No URLs found in any child sitemap!')
            process.exit(1)
        }

        console.log(`\n✅ Total URLs collected: ${allUrls.length}`)

        // Initialize Google Indexing client
        console.log('\n🔐 Initializing Google Indexing API client...')
        const client = new GoogleIndexingClient({
            clientEmail: getClientEmail(),
            privateKey: getPrivateKey(),
            baseUrl: seoDefaults.siteUrl,
        })

        await client.initialize()
        console.log('✅ Client initialized')

        // Create indexable URLs - ensure URLs are absolute
        const indexableUrls = allUrls.map((url) => {
            // Ensure URL is absolute
            const absoluteUrl =
                url.startsWith('http://') || url.startsWith('https://')
                    ? url
                    : `${seoDefaults.siteUrl}${url.startsWith('/') ? url : `/${url}`}`

            return {
                url: absoluteUrl,
                type: 'URL_UPDATED' as const,
            }
        })

        // Submit to Google for indexing
        console.log(
            `\n📤 Submitting ${indexableUrls.length} URLs to Google Indexing API...`
        )
        const results = await client.notifyUrlUpdates(indexableUrls)

        // Report results
        const successCount = results.filter((r) => r.success).length
        const failedCount = results.length - successCount

        console.log('\n📊 Google Indexing Results:')
        console.log(`   - Total URLs: ${results.length}`)
        console.log(`   - Successfully indexed: ${successCount} ✅`)
        console.log(`   - Failed: ${failedCount} ❌`)

        if (failedCount > 0) {
            console.log('\n❌ Failed URLs:')
            results
                .filter((r) => !r.success)
                .forEach((r) => {
                    console.log(`   - ${r.url}: ${r.error}`)
                })
        }

        console.log('\n✨ Google indexing update completed!')
        process.exit(0)
    } catch (error) {
        console.error('❌ Error updating Google index:', error)
        process.exit(1)
    }
}

// Run the script
void main()
