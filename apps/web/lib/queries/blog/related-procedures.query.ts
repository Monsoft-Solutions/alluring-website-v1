/**
 * Related Procedures Query
 *
 * Finds procedures related to a blog post based on:
 * 1. Primary keyword matching
 * 2. Category/tag matching
 * 3. Fallback to same category procedures
 */
import type { BlogPostDetail } from '@/lib/types/blog/post-detail.type'

import { getProceduresByCategory, procedures } from '@/lib/data/procedures.data'
import type { Procedure } from '@/lib/types/procedure.type'

/**
 * Procedure keyword mappings for matching blog content
 * Maps common keywords to procedure slugs
 */
const KEYWORD_TO_PROCEDURE: Record<string, string[]> = {
    // Breast procedures
    breast: [
        'breast-augmentation-miami',
        'breast-lift-miami',
        'breast-reduction-miami',
    ],
    'breast augmentation': ['breast-augmentation-miami'],
    'breast implants': ['breast-augmentation-miami'],
    'breast lift': ['breast-lift-miami'],
    'breast reduction': ['breast-reduction-miami'],
    boob: ['breast-augmentation-miami'],

    // Body procedures
    bbl: ['brazilian-butt-lift-bbl-miami'],
    'brazilian butt lift': ['brazilian-butt-lift-bbl-miami'],
    liposuction: ['liposuction-miami'],
    lipo: ['liposuction-miami'],
    'tummy tuck': ['tummy-tuck-miami'],
    abdominoplasty: ['tummy-tuck-miami'],
    'mommy makeover': ['mommy-makeover-miami'],
    'post-pregnancy': ['mommy-makeover-miami'],

    // Face procedures
    facelift: ['facelift-miami'],
    'face lift': ['facelift-miami'],
    blepharoplasty: ['blepharoplasty-miami'],
    eyelid: ['blepharoplasty-miami'],
    'eyelid surgery': ['blepharoplasty-miami'],

    // Categories
    body: [
        'liposuction-miami',
        'tummy-tuck-miami',
        'brazilian-butt-lift-bbl-miami',
    ],
    face: ['facelift-miami', 'blepharoplasty-miami'],
}

/**
 * Gets procedures related to a blog post
 *
 * Uses categories and tags to find matching procedures.
 * Falls back to procedures from the same category.
 *
 * @param post - The blog post detail object
 * @param limit - Maximum number of procedures to return (default: 3)
 * @returns Array of related procedures
 */
export function getRelatedProcedures(
    post: BlogPostDetail,
    limit = 3
): Procedure[] {
    const matchedSlugs = new Set<string>()
    const result: Procedure[] = []

    // Helper to add procedure by slug
    const addProcedure = (slug: string) => {
        if (matchedSlugs.has(slug)) return
        const procedure = procedures.find((p) => p.slug === slug)
        if (procedure) {
            matchedSlugs.add(slug)
            result.push(procedure)
        }
    }

    // 1. Check categories for keyword matches
    if (post.categories && post.categories.length > 0) {
        for (const category of post.categories) {
            if (result.length >= limit) break
            const categoryName = category.name.toLowerCase()
            const categorySlug = category.slug.toLowerCase()

            // Check if category name matches a keyword
            const slugs = KEYWORD_TO_PROCEDURE[categoryName]
            if (slugs) {
                slugs.forEach(addProcedure)
            }

            // Also check category slug
            const slugsFromSlug = KEYWORD_TO_PROCEDURE[categorySlug]
            if (slugsFromSlug) {
                slugsFromSlug.forEach(addProcedure)
            }

            // Also match category slug to procedure category
            const matchingProcedures = getProceduresByCategory(
                categorySlug as 'face' | 'breast' | 'body' | 'combined'
            )
            for (const procedure of matchingProcedures) {
                if (result.length >= limit) break
                addProcedure(procedure.slug)
            }
        }
    }

    // 2. Check tags for keyword matches
    if (result.length < limit && post.tags && post.tags.length > 0) {
        for (const tag of post.tags) {
            if (result.length >= limit) break
            const tagName = tag.name.toLowerCase()
            const tagSlug = tag.slug.toLowerCase()

            // Check if tag name matches a keyword
            const slugs = KEYWORD_TO_PROCEDURE[tagName]
            if (slugs) {
                slugs.forEach(addProcedure)
            }

            // Also check tag slug
            const slugsFromSlug = KEYWORD_TO_PROCEDURE[tagSlug]
            if (slugsFromSlug) {
                slugsFromSlug.forEach(addProcedure)
            }
        }
    }

    // 3. Fallback: If we have at least one match, add more from the same category
    if (result.length > 0 && result.length < limit) {
        const firstCategory = result[0]?.category
        if (firstCategory) {
            const sameCategoryProcedures =
                getProceduresByCategory(firstCategory)
            for (const procedure of sameCategoryProcedures) {
                if (result.length >= limit) break
                addProcedure(procedure.slug)
            }
        }
    }

    return result.slice(0, limit)
}
