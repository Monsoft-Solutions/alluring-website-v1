/**
 * Sitemap Generator Utility
 *
 * Provides utilities for generating XML sitemaps with support for dynamic routes,
 * multi-page sitemaps, and proper SEO attributes.
 */
import type { MetadataRoute } from 'next'

import type { SitemapEntry } from '../types/sitemap/sitemap-entry.type'
import type { SitemapRoute } from '../types/sitemap/sitemap-route.type'

/**
 * Configuration for sitemap generation
 */
export type SitemapConfig = {
    /** Base URL for the site */
    baseUrl: string
    /** Maximum number of URLs per sitemap file (default: 50000) */
    maxUrlsPerSitemap?: number
    /** Default change frequency for routes */
    defaultChangeFrequency?: SitemapEntry['changeFrequency']
    /** Default priority for routes */
    defaultPriority?: number
}

/**
 * Generate sitemap entries from route configurations
 *
 * @param routes - Array of route configurations
 * @param config - Sitemap generation configuration
 * @returns Promise resolving to array of sitemap entries
 *
 * @example
 * ```typescript
 * const routes: SitemapRoute[] = [
 *   {
 *     path: '/',
 *     getEntries: () => [{
 *       url: '/',
 *       changeFrequency: 'daily',
 *       priority: 1.0
 *     }]
 *   }
 * ]
 *
 * const entries = await generateSitemapEntries(routes, {
 *   baseUrl: 'https://example.com'
 * })
 * ```
 */
export async function generateSitemapEntries(
    routes: SitemapRoute[],
    config: SitemapConfig
): Promise<SitemapEntry[]> {
    const allEntries: SitemapEntry[] = []

    for (const route of routes) {
        try {
            const entries = await route.getEntries()

            // Process each entry to ensure proper formatting
            const processedEntries = entries.map((entry) => ({
                ...entry,
                url: entry.url.startsWith('http')
                    ? entry.url
                    : `${config.baseUrl.replace(/\/$/, '')}${entry.url.startsWith('/') ? entry.url : '/' + entry.url}`,
                changeFrequency:
                    entry.changeFrequency ||
                    config.defaultChangeFrequency ||
                    'weekly',
                priority:
                    entry.priority !== undefined
                        ? entry.priority
                        : config.defaultPriority || 0.5,
                lastModified: entry.lastModified || new Date().toISOString(),
            }))

            allEntries.push(...processedEntries)
        } catch (error) {
            console.error(
                `Error generating entries for route ${route.path}:`,
                error
            )
            // Continue with other routes even if one fails
        }
    }

    return allEntries
}

/**
 * Convert sitemap entries to Next.js MetadataRoute.Sitemap format
 *
 * @param entries - Array of sitemap entries
 * @returns Array in Next.js sitemap format
 *
 * @example
 * ```typescript
 * const entries: SitemapEntry[] = [
 *   {
 *     url: 'https://example.com/',
 *     changeFrequency: 'daily',
 *     priority: 1.0,
 *     lastModified: '2023-10-15T00:00:00.000Z'
 *   }
 * ]
 *
 * const sitemap = convertToNextjsSitemap(entries)
 * ```
 */
export function convertToNextjsSitemap(
    entries: SitemapEntry[]
): MetadataRoute.Sitemap {
    return entries.map((entry) => ({
        url: entry.url,
        lastModified: entry.lastModified
            ? new Date(entry.lastModified)
            : new Date(),
        changeFrequency: entry.changeFrequency,
        priority: entry.priority,
        alternates: entry.alternates
            ? {
                  languages: entry.alternates.reduce(
                      (acc, alt) => {
                          acc[alt.hreflang] = alt.href
                          return acc
                      },
                      {} as Record<string, string>
                  ),
              }
            : undefined,
    }))
}

/**
 * Split sitemap entries into multiple sitemaps if needed
 *
 * @param entries - Array of sitemap entries
 * @param maxUrlsPerSitemap - Maximum URLs per sitemap (default: 50000)
 * @returns Array of sitemap chunks
 *
 * @example
 * ```typescript
 * const entries: SitemapEntry[] = [...] // Large array
 * const chunks = splitSitemapEntries(entries, 1000)
 * console.log(`Split into ${chunks.length} sitemaps`)
 * ```
 */
export function splitSitemapEntries(
    entries: SitemapEntry[],
    maxUrlsPerSitemap: number = 50000
): SitemapEntry[][] {
    if (entries.length <= maxUrlsPerSitemap) {
        return [entries]
    }

    const chunks: SitemapEntry[][] = []
    for (let i = 0; i < entries.length; i += maxUrlsPerSitemap) {
        chunks.push(entries.slice(i, i + maxUrlsPerSitemap))
    }

    return chunks
}

/**
 * Generate sitemap index entries for multiple sitemaps
 *
 * @param baseUrl - Base URL for the site
 * @param sitemapCount - Number of sitemap files
 * @returns Array of sitemap index entries
 *
 * @example
 * ```typescript
 * const indexEntries = generateSitemapIndex('https://example.com', 3)
 * // Returns:
 * // [
 * //   { url: 'https://example.com/sitemap-0.xml', lastModified: '...' },
 * //   { url: 'https://example.com/sitemap-1.xml', lastModified: '...' },
 * //   { url: 'https://example.com/sitemap-2.xml', lastModified: '...' }
 * // ]
 * ```
 */
export function generateSitemapIndex(
    baseUrl: string,
    sitemapCount: number
): Array<{ url: string; lastModified: string }> {
    const indexEntries: Array<{ url: string; lastModified: string }> = []
    const now = new Date().toISOString()

    for (let i = 0; i < sitemapCount; i++) {
        indexEntries.push({
            url: `${baseUrl.replace(/\/$/, '')}/sitemap-${i}.xml`,
            lastModified: now,
        })
    }

    return indexEntries
}

/**
 * Create static route entries for common pages
 *
 * @param config - Sitemap configuration
 * @returns Array of static route configurations
 *
 * @example
 * ```typescript
 * const staticRoutes = createStaticRoutes({
 *   baseUrl: 'https://example.com'
 * })
 * ```
 */
export function createStaticRoutes(): SitemapRoute[] {
    return [
        {
            path: '/',
            getEntries: () => [
                {
                    url: '/',
                    changeFrequency: 'daily',
                    priority: 1.0,
                    lastModified: new Date().toISOString(),
                },
            ],
        },
        {
            path: '/about',
            getEntries: () => [
                {
                    url: '/about',
                    changeFrequency: 'monthly',
                    priority: 0.8,
                    lastModified: new Date().toISOString(),
                },
            ],
        },
    ]
}

/**
 * Validate sitemap entries for common issues
 *
 * @param entries - Array of sitemap entries to validate
 * @returns Array of validation errors (empty if valid)
 *
 * @example
 * ```typescript
 * const entries: SitemapEntry[] = [...]
 * const errors = validateSitemapEntries(entries)
 * if (errors.length > 0) {
 *   console.error('Sitemap validation errors:', errors)
 * }
 * ```
 */
export function validateSitemapEntries(entries: SitemapEntry[]): string[] {
    const errors: string[] = []

    for (const [index, entry] of entries.entries()) {
        // Validate URL format
        try {
            new URL(entry.url)
        } catch {
            errors.push(`Entry ${index}: Invalid URL format: ${entry.url}`)
        }

        // Validate priority range
        if (
            entry.priority !== undefined &&
            (entry.priority < 0 || entry.priority > 1)
        ) {
            errors.push(
                `Entry ${index}: Priority must be between 0 and 1, got: ${entry.priority}`
            )
        }

        // Validate lastModified format
        if (entry.lastModified) {
            const d = new Date(entry.lastModified)
            if (isNaN(d.getTime())) {
                errors.push(
                    `Entry ${index}: Invalid lastModified date format: ${entry.lastModified}`
                )
            }
        }

        // Validate alternates
        if (entry.alternates) {
            for (const alt of entry.alternates) {
                try {
                    new URL(alt.href)
                } catch {
                    errors.push(
                        `Entry ${index}: Invalid alternate URL: ${alt.href}`
                    )
                }
            }
        }
    }

    return errors
}
