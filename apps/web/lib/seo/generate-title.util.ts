/**
 * Title Generation Utilities
 *
 * Industry-optimized title patterns for plastic surgery local SEO in Miami.
 * These utilities help create consistent, SEO-friendly page titles that:
 * - Include location keywords (Miami) for local search optimization
 * - Stay within the ~65 characters Google renders before truncating
 * - Follow plastic surgery industry best practices
 * - Ensure consistent formatting across all pages
 *
 * Note: there is no global brand suffix. The root layout deliberately sets no
 * title template — see the comment there — so what these helpers return is the
 * complete title as rendered.
 */

/**
 * Characters Google renders before truncating a title in search results.
 * Titles are built to fit this budget rather than being cut off mid-phrase.
 */
const TITLE_LIMIT = 65

/**
 * Generate a page title with optional location optimization
 *
 * @param title - The base title of the page
 * @param options - Configuration options
 * @returns Optimized page title
 *
 * @example
 * generatePageTitle('Board-Certified Plastic Surgeons', { includeLocation: true })
 * // Returns: "Board-Certified Plastic Surgeons in Miami"
 *
 * @example
 * generatePageTitle('Schedule Your Consultation')
 * // Returns: "Schedule Your Consultation"
 */
export function generatePageTitle(
    title: string,
    options?: {
        includeLocation?: boolean
    }
): string {
    const { includeLocation = false } = options ?? {}

    if (!includeLocation) {
        return title
    }

    // Check if title already contains "Miami" to avoid duplication
    if (title.toLowerCase().includes('miami')) {
        return title
    }

    // For questions or action-oriented titles, don't add location
    if (title.endsWith('?') || title.toLowerCase().startsWith('schedule')) {
        return title
    }

    // Add "in Miami" for informational pages
    return `${title} in Miami`
}

/**
 * Trust signals appended to procedure titles, longest first. The first one
 * that keeps the title inside {@link TITLE_LIMIT} wins — long procedure names
 * like "Blepharoplasty (Eyelid Surgery)" cannot carry the full phrase without
 * pushing the title past what Google renders.
 */
const PROCEDURE_TRUST_SIGNALS = [
    ' | Board-Certified Surgeons',
    ' | Board-Certified',
    '',
] as const

/**
 * Generate a procedure page title optimized for local SEO and CTR
 *
 * Appends "Miami {year}" plus the longest trust signal that still fits for:
 * - Local search optimization (Miami)
 * - Freshness signals (year)
 * - Trust signals (Board-Certified)
 *
 * The procedure name and location are never trimmed — they are the query
 * terms. Only the trust signal shortens.
 *
 * @param procedureName - The name of the procedure
 * @returns Optimized procedure title with location, year, and trust signal
 *
 * @example
 * generateProcedureTitle('Breast Augmentation')
 * // Returns: "Breast Augmentation Miami 2026 | Board-Certified Surgeons"
 *
 * @example
 * generateProcedureTitle('Blepharoplasty (Eyelid Surgery)')
 * // Returns: "Blepharoplasty (Eyelid Surgery) Miami 2026 | Board-Certified"
 */
export function generateProcedureTitle(procedureName: string): string {
    const currentYear = new Date().getFullYear()

    // Avoid duplicating the location when the procedure name already has it
    const base = procedureName.toLowerCase().includes('miami')
        ? `${procedureName} ${currentYear}`
        : `${procedureName} Miami ${currentYear}`

    const signal =
        PROCEDURE_TRUST_SIGNALS.find(
            (candidate) => base.length + candidate.length <= TITLE_LIMIT
        ) ?? ''

    return `${base}${signal}`
}

/**
 * Generate a blog post title
 *
 * Returns the post title as-is. Posts carry no brand suffix — the subject of
 * the post is what earns the click on an informational query.
 *
 * @param postTitle - The title of the blog post
 * @returns The post title unchanged
 *
 * @example
 * generateBlogPostTitle('Recovery Tips After BBL Surgery')
 * // Returns: "Recovery Tips After BBL Surgery"
 */
export function generateBlogPostTitle(postTitle: string): string {
    return postTitle
}

/**
 * Generate a gallery page title with location optimization
 *
 * @param galleryName - The name of the gallery or category
 * @returns Optimized gallery title
 *
 * @example
 * generateGalleryTitle('Before & After Photos')
 * // Returns: "Before & After Photos Miami"
 */
export function generateGalleryTitle(galleryName: string): string {
    if (galleryName.toLowerCase().includes('miami')) {
        return galleryName
    }

    return `${galleryName} Miami`
}

/**
 * Truncate title to fit within SEO best practices while preserving complete
 * words.
 *
 * @param title - The title to truncate
 * @param maxLength - Maximum length (default: 60)
 * @returns Truncated title
 */
export function truncateTitle(title: string, maxLength: number = 60): string {
    if (title.length <= maxLength) {
        return title
    }

    // Truncate at the last complete word before maxLength
    const truncated = title.substring(0, maxLength)
    const lastSpace = truncated.lastIndexOf(' ')

    if (lastSpace > 0) {
        return truncated.substring(0, lastSpace) + '...'
    }

    return truncated + '...'
}
