/**
 * Sitemap Children
 *
 * Single list of the child sitemaps referenced by /sitemap.xml, shared by the
 * index route handler and the Google indexing script so the two cannot drift.
 *
 * @module lib/seo/sitemap-children
 */
import { seoDefaults } from '@/lib/data/site-config'

/** Child sitemap names, in crawl-priority order. */
export const SITEMAP_CHILDREN = [
    'pages',
    'blog',
    'procedures',
    'gallery',
    'promotions',
] as const

/**
 * Absolute URLs of every child sitemap.
 *
 * @returns Child sitemap URLs
 */
export function getSitemapChildUrls(): string[] {
    const baseUrl = seoDefaults.siteUrl.replace(/\/$/, '')
    return SITEMAP_CHILDREN.map((name) => `${baseUrl}/sitemap/${name}.xml`)
}
