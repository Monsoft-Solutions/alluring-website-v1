/**
 * Title Generation Utilities
 *
 * Industry-optimized title patterns for plastic surgery local SEO in Miami.
 * These utilities help create consistent, SEO-friendly page titles that:
 * - Include location keywords (Miami) for local search optimization
 * - Keep titles under 60 characters (before brand suffix)
 * - Follow plastic surgery industry best practices
 * - Ensure consistent formatting across all pages
 */

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
 * Generate a procedure page title optimized for local SEO
 *
 * Appends "Miami" to procedure titles for local search optimization.
 * This targets searches like "BBL Miami", "Breast Augmentation Miami", etc.
 *
 * @param procedureName - The name of the procedure
 * @returns Optimized procedure title with location
 *
 * @example
 * generateProcedureTitle('Brazilian Butt Lift (BBL)')
 * // Returns: "Brazilian Butt Lift (BBL) Miami"
 *
 * @example
 * generateProcedureTitle('Breast Augmentation')
 * // Returns: "Breast Augmentation Miami"
 */
export function generateProcedureTitle(procedureName: string): string {
    // Check if procedure name already contains "Miami"
    if (procedureName.toLowerCase().includes('miami')) {
        return procedureName
    }

    // Append Miami for local SEO
    return `${procedureName} Miami`
}

/**
 * Generate a blog post title
 *
 * Returns the post title as-is since the global template will
 * automatically append "| Alluring Plastic Surgery".
 *
 * @param postTitle - The title of the blog post
 * @returns The post title unchanged
 *
 * @example
 * generateBlogPostTitle('Recovery Tips After BBL Surgery')
 * // Returns: "Recovery Tips After BBL Surgery"
 * // Final rendered: "Recovery Tips After BBL Surgery | Alluring Plastic Surgery"
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
 * Truncate title to fit within SEO best practices (60 characters)
 * while preserving complete words.
 *
 * Note: The brand suffix "| Alluring Plastic Surgery" (29 chars including separators)
 * will be added by the template, so keep titles under 60 chars to stay within
 * the recommended 60-70 character total title length.
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
