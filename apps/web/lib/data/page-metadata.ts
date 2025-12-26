/**
 * Page Metadata Configuration
 *
 * Tracks last modified dates for static pages to provide accurate
 * sitemap data. Update these dates when page content actually changes.
 */

/**
 * Last modified dates for static pages
 * Format: ISO date string (YYYY-MM-DD)
 *
 * Update these dates when you make content changes to the corresponding pages.
 */
export const pageLastModified: Record<string, string> = {
    // Main pages
    '/': '2025-12-18',
    '/about': '2025-12-16',
    '/contact-us': '2025-12-18',
    '/faq': '2025-12-18',
    '/plastic-surgery-financing-miami': '2025-12-16',
    '/miami-plastic-surgery-specials': '2025-12-18',

    // Gallery pages
    '/gallery': '2025-12-17',

    // Instagram pages
    '/instagram': '2025-12-21',

    // Listing pages
    '/procedures': '2025-12-17',
    '/blog': '2025-12-17',
    '/blog/categories': '2025-12-17',
    '/blog/tags': '2025-12-17',
    '/promotions': '2025-12-17',

    // Surgeon pages
    '/dr-karlinsky': '2025-12-16',
    '/dr-andrew-lofman': '2025-12-16',
    '/dr-rita-shats': '2025-12-16',

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
