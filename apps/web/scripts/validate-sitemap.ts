/**
 * Sitemap Validation Script
 *
 * Validates all sitemap endpoints for proper XML structure and content.
 * Run this script to verify sitemaps before or after deployment.
 *
 * Usage: pnpm validate:sitemap [baseUrl]
 *
 * If baseUrl is not provided, it defaults to the site URL from environment.
 */

import { parseStringPromise } from 'xml2js'

// Sitemap endpoints to validate
const SITEMAP_ENDPOINTS = [
    '/sitemap.xml',
    '/sitemap/pages.xml',
    '/sitemap/blog.xml',
    '/sitemap/procedures.xml',
    '/sitemap/gallery.xml',
    '/sitemap/promotions.xml',
]

type ValidationResult = {
    endpoint: string
    valid: boolean
    urlCount: number
    errors: string[]
}

/**
 * Fetch and validate a sitemap endpoint
 */
async function validateSitemap(
    baseUrl: string,
    endpoint: string
): Promise<ValidationResult> {
    const result: ValidationResult = {
        endpoint,
        valid: false,
        urlCount: 0,
        errors: [],
    }

    try {
        const url = `${baseUrl}${endpoint}`
        console.log(`  Fetching ${url}...`)

        const response = await fetch(url)

        if (!response.ok) {
            result.errors.push(
                `HTTP error: ${response.status} ${response.statusText}`
            )
            return result
        }

        const xml = await response.text()

        // Check for empty response
        if (!xml.trim()) {
            result.errors.push('Empty response')
            return result
        }

        // Parse XML
        const parsed = await parseStringPromise(xml)

        // Validate structure
        if (!parsed.urlset && !parsed.sitemapindex) {
            result.errors.push(
                'Invalid sitemap: missing urlset or sitemapindex root element'
            )
            return result
        }

        // Check for sitemap index (main sitemap.xml)
        if (parsed.sitemapindex) {
            const sitemaps = parsed.sitemapindex.sitemap || []
            result.urlCount = sitemaps.length
            result.valid = true

            // Validate each sitemap reference
            for (const sitemap of sitemaps) {
                if (!sitemap.loc?.[0]) {
                    result.errors.push('Sitemap reference missing loc element')
                }
            }
            return result
        }

        // Check for urlset (child sitemaps)
        if (parsed.urlset) {
            const urls = parsed.urlset.url || []
            result.urlCount = urls.length

            // Validate each URL entry
            for (const [index, urlEntry] of urls.entries()) {
                // Required: loc
                if (!urlEntry.loc?.[0]) {
                    result.errors.push(`Entry ${index}: missing loc element`)
                    continue
                }

                const loc = urlEntry.loc[0]

                // Validate URL format
                try {
                    new URL(loc)
                } catch {
                    result.errors.push(`Entry ${index}: invalid URL: ${loc}`)
                }

                // Validate priority if present
                if (urlEntry.priority?.[0]) {
                    const priority = parseFloat(urlEntry.priority[0])
                    if (isNaN(priority) || priority < 0 || priority > 1) {
                        result.errors.push(
                            `Entry ${index}: invalid priority: ${urlEntry.priority[0]}`
                        )
                    }
                }

                // Validate lastmod if present
                if (urlEntry.lastmod?.[0]) {
                    const date = new Date(urlEntry.lastmod[0])
                    if (isNaN(date.getTime())) {
                        result.errors.push(
                            `Entry ${index}: invalid lastmod date: ${urlEntry.lastmod[0]}`
                        )
                    }
                }

                // Validate changefreq if present
                const validFrequencies = [
                    'always',
                    'hourly',
                    'daily',
                    'weekly',
                    'monthly',
                    'yearly',
                    'never',
                ]
                if (
                    urlEntry.changefreq?.[0] &&
                    !validFrequencies.includes(urlEntry.changefreq[0])
                ) {
                    result.errors.push(
                        `Entry ${index}: invalid changefreq: ${urlEntry.changefreq[0]}`
                    )
                }

                // Validate image entries if present
                if (urlEntry['image:image']) {
                    for (const [imgIndex, image] of urlEntry[
                        'image:image'
                    ].entries()) {
                        if (!image['image:loc']?.[0]) {
                            result.errors.push(
                                `Entry ${index}, Image ${imgIndex}: missing image:loc`
                            )
                        } else {
                            try {
                                new URL(image['image:loc'][0])
                            } catch {
                                result.errors.push(
                                    `Entry ${index}, Image ${imgIndex}: invalid image URL: ${image['image:loc'][0]}`
                                )
                            }
                        }
                    }
                }
            }

            result.valid = result.errors.length === 0
        }
    } catch (error) {
        result.errors.push(
            `Error: ${error instanceof Error ? error.message : String(error)}`
        )
    }

    return result
}

/**
 * Main execution function
 */
async function main() {
    // Get base URL from arguments or environment
    // eslint-disable-next-line no-restricted-properties
    const baseUrl = process.argv[2] || process.env.NEXT_PUBLIC_SITE_URL

    if (!baseUrl) {
        console.error(
            '❌ Error: No base URL provided. Use: pnpm validate:sitemap <baseUrl>'
        )
        console.error('   Or set NEXT_PUBLIC_SITE_URL environment variable.')
        process.exit(1)
    }

    console.log('🔍 Validating sitemaps...')
    console.log(`   Base URL: ${baseUrl}\n`)

    const results: ValidationResult[] = []

    for (const endpoint of SITEMAP_ENDPOINTS) {
        const result = await validateSitemap(baseUrl, endpoint)
        results.push(result)
    }

    // Print summary
    console.log('\n📊 Validation Results:')
    console.log('='.repeat(60))

    let hasErrors = false

    for (const result of results) {
        const status = result.valid ? '✅' : '❌'
        console.log(`\n${status} ${result.endpoint}`)
        console.log(`   URLs: ${result.urlCount}`)

        if (result.errors.length > 0) {
            hasErrors = true
            console.log('   Errors:')
            for (const error of result.errors) {
                console.log(`     - ${error}`)
            }
        }
    }

    console.log('\n' + '='.repeat(60))

    const validCount = results.filter((r) => r.valid).length
    const totalUrls = results.reduce((sum, r) => sum + r.urlCount, 0)

    console.log(`\n📈 Summary:`)
    console.log(`   Sitemaps validated: ${validCount}/${results.length}`)
    console.log(`   Total URLs: ${totalUrls}`)

    if (hasErrors) {
        console.log('\n❌ Validation failed with errors!')
        process.exit(1)
    } else {
        console.log('\n✅ All sitemaps validated successfully!')
        process.exit(0)
    }
}

// Run the script
main()
