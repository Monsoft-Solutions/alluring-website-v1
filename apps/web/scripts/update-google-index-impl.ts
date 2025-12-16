/**
 * Implementation of Google Index Update Script
 * This file is dynamically imported after environment variables are loaded
 */

import { GoogleIndexingClient } from '@monsoft/google-indexing'

import sitemap from '@/app/sitemap'
import { seoDefaults } from '@/lib/data/site-config'

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
 * Main execution function
 */
export async function main() {
    try {
        console.log('🚀 Starting Google indexing update...')

        // Get URLs from the dynamic sitemap
        console.log('📋 Fetching URLs from dynamic sitemap...')
        const sitemapData = await sitemap()
        const urls = sitemapData.map((item) => item.url)

        if (urls.length === 0) {
            console.error('❌ No URLs found in sitemap!')
            process.exit(1)
        }

        console.log(`✅ Found ${urls.length} URLs in sitemap:`)
        urls.forEach((url) => console.log(`   - ${url}`))

        // Initialize Google Indexing client
        const client = new GoogleIndexingClient({
            clientEmail: getClientEmail(),
            privateKey: getPrivateKey(),
            baseUrl: seoDefaults.siteUrl,
        })

        await client.initialize()

        // Create indexable URLs - ensure URLs are absolute
        const indexableUrls = urls.map((url) => {
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
main()
