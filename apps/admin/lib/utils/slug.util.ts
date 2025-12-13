/**
 * Slug Utility Functions
 *
 * Helper functions for ensuring slug uniqueness in the database.
 *
 * @module @/lib/utils/slug
 */

import { db } from '@workspace/db/client'
import { galleryMedia } from '@workspace/db/schema/gallery'
import { and, like, ne } from 'drizzle-orm'

/**
 * Ensures a gallery media slug is unique by appending a counter if necessary
 *
 * Strategy:
 * 1. Check if the base slug exists
 * 2. If it exists, query for all slugs matching the pattern "baseSlug" or "baseSlug-N"
 * 3. Find the highest counter and increment it
 * 4. Return the unique slug
 *
 * @param baseSlug - The AI-generated slug to make unique
 * @param excludeMediaId - Optional media ID to exclude from collision check (for updates)
 * @returns A unique slug (original or with suffix like -2, -3, etc.)
 *
 * @example
 * ```typescript
 * // First image: breast-augmentation-before-after
 * await ensureUniqueSlug('breast-augmentation-before-after')
 * // Returns: 'breast-augmentation-before-after'
 *
 * // Second image with same AI-generated slug:
 * await ensureUniqueSlug('breast-augmentation-before-after')
 * // Returns: 'breast-augmentation-before-after-2'
 *
 * // Third image:
 * await ensureUniqueSlug('breast-augmentation-before-after')
 * // Returns: 'breast-augmentation-before-after-3'
 * ```
 */
export async function ensureUniqueSlug(
    baseSlug: string,
    excludeMediaId?: string
): Promise<string> {
    // Sanitize the base slug
    const sanitizedSlug = baseSlug.toLowerCase().trim()

    // Build the WHERE clause
    const whereConditions = [like(galleryMedia.slug, `${sanitizedSlug}%`)]
    if (excludeMediaId) {
        whereConditions.push(ne(galleryMedia.id, excludeMediaId))
    }

    // Query for existing slugs that match the pattern
    const existingSlugs = await db
        .select({ slug: galleryMedia.slug })
        .from(galleryMedia)
        .where(and(...whereConditions))

    // If no conflicts, return the original slug
    if (existingSlugs.length === 0) {
        return sanitizedSlug
    }

    // Check if the exact slug exists
    const exactMatch = existingSlugs.find((s) => s.slug === sanitizedSlug)

    // If no exact match, the slug is available
    if (!exactMatch) {
        return sanitizedSlug
    }

    // Find all numbered variants (baseSlug-2, baseSlug-3, etc.)
    const numberedSlugs = existingSlugs
        .map((s) => {
            // Match pattern: baseSlug-N where N is a number
            const match = s.slug.match(new RegExp(`^${sanitizedSlug}-(\\d+)$`))
            return match ? Number.parseInt(match[1] ?? '0', 10) : null
        })
        .filter((n): n is number => n !== null)

    // Find the next available number
    // Start from 2 (since the base slug without number is considered "1")
    let nextNumber = 2
    if (numberedSlugs.length > 0) {
        const maxNumber = Math.max(...numberedSlugs)
        nextNumber = maxNumber + 1
    }

    return `${sanitizedSlug}-${nextNumber}`
}

/**
 * Generate a basic slug from a string
 *
 * Converts a string to a URL-friendly slug format:
 * - Lowercase
 * - Replaces spaces and underscores with hyphens
 * - Removes special characters
 * - Removes consecutive hyphens
 *
 * Note: This does NOT ensure uniqueness. Use `ensureUniqueSlug` for that.
 *
 * @param text - The text to convert to a slug
 * @returns A basic slug (not guaranteed to be unique)
 *
 * @example
 * ```typescript
 * generateBasicSlug('Beautiful Breast Augmentation!')
 * // Returns: 'beautiful-breast-augmentation'
 *
 * generateBasicSlug('BBL Before & After - Miami')
 * // Returns: 'bbl-before-after-miami'
 * ```
 */
export function generateBasicSlug(text: string): string {
    return text
        .toLowerCase()
        .trim()
        .replace(/[_\s]+/g, '-') // Replace spaces and underscores with hyphens
        .replace(/[^\w-]+/g, '') // Remove non-word chars except hyphens
        .replace(/--+/g, '-') // Replace multiple hyphens with single hyphen
        .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
}
