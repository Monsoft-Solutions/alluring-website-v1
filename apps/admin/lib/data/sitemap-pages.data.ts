/**
 * Static Pages Data for URL Classification
 *
 * Contains the same static pages and surgeon slugs used in the web app's
 * sitemap generation. This data is used by the URL registry service to
 * classify pages from Google Search Console.
 *
 * @module @/lib/data/sitemap-pages.data
 */

/**
 * Static page paths from the pages.xml sitemap
 * These are non-dynamic marketing and legal pages.
 */
export const STATIC_PAGES = [
    '/',
    '/about',
    '/contact-us',
    '/faq',
    '/plastic-surgery-financing-miami',
    '/miami-plastic-surgery-specials',
    '/thank-you',
    '/privacy',
    '/terms',
    '/cookies',
] as const

/**
 * Surgeon profile page slugs
 * These are dynamic pages based on surgeon data.
 */
export const SURGEON_SLUGS = [
    '/dr-karlinsky',
    '/dr-andrew-lofman',
    '/dr-rita-shats',
] as const

/**
 * Type for static page paths
 */
export type StaticPagePath = (typeof STATIC_PAGES)[number]

/**
 * Type for surgeon slug paths
 */
export type SurgeonSlugPath = (typeof SURGEON_SLUGS)[number]
