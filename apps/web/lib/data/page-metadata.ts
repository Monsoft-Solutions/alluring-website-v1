/**
 * Page Metadata Configuration
 *
 * Tracks last modified dates for static pages to provide accurate
 * sitemap data. Update these dates when page content actually changes.
 *
 * NOTE: Individual procedure pages use dateModified from their procedure data files.
 * Only the main /procedures listing page should be tracked here.
 */

/**
 * Last modified dates for static pages
 * Format: ISO date string (YYYY-MM-DD)
 *
 * Update these dates when you make content changes to the corresponding pages.
 */
export const pageLastModified: Record<string, string> = {
    // Main pages
    '/': '2026-01-22',
    '/about': '2026-01-21',
    '/contact-us': '2026-01-21',
    '/faqs': '2026-01-21',
    '/plastic-surgery-financing-miami': '2026-01-21',
    '/miami-plastic-surgery-specials': '2026-01-22',
    '/bmi-calculator': '2026-01-17',
    '/reviews': '2026-01-22',

    // Landing pages
    '/free-consultation': '2026-01-22',
    '/free-consultation/miami': '2026-01-22',
    '/fly-in-consultation': '2026-01-22',
    '/consulta-gratis': '2026-01-22',
    '/mommy-makeover-consultation': '2026-01-26',
    '/bridal-consultation': '2026-01-26',
    '/after-weight-loss-consultation': '2026-01-26',
    '/new-beginning-consultation': '2026-01-26',
    '/bbl-miami': '2026-01-26',
    '/mens-plastic-surgery-miami': '2026-01-26',

    // Gallery pages
    '/gallery': '2025-12-17',

    // Instagram pages
    '/instagram': '2026-01-21',

    // Listing pages
    '/procedures': '2026-01-21',
    '/blog': '2026-01-21',
    '/blog/categories': '2026-01-21',
    '/blog/tags': '2026-01-21',
    '/promotions': '2026-01-21',

    // Surgeon pages
    '/dr-karlinsky': '2026-01-22',
    '/dr-andrew-lofman': '2026-01-22',
    '/dr-rita-shats': '2026-01-22',

    // Legal pages (rarely change)
    '/privacy': '2025-12-16',
    '/terms': '2025-12-16',
    '/cookies': '2025-12-16',
} as const

/**
 * Get last modified date for a static page
 *
 * @param path - The page path (e.g., '/about')
 * @returns ISO date string or undefined if not found
 */
export function getPageLastModified(path: string): string | undefined {
    return pageLastModified[path]
}

/**
 * Get last modified date as Date object for a static page
 *
 * @param path - The page path (e.g., '/about')
 * @returns Date object or current date if not found
 */
export function getPageLastModifiedDate(path: string): Date {
    const dateStr = pageLastModified[path]
    return dateStr ? new Date(dateStr) : new Date()
}
