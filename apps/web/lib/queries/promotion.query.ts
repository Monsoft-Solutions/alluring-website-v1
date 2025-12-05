import { unstable_cache } from 'next/cache'

import { db } from '@workspace/db/client'
import { promotion, type Promotion } from '@workspace/db/schema/promotion'
import { desc, eq, and, or, lte, gte, sql, isNotNull } from 'drizzle-orm'

import { CACHE_TAGS } from '@/lib/cache'

export type PromotionType = 'discount' | 'seasonal' | 'bundle' | 'financing'

/** Cache revalidation time in seconds (1 hour fallback) */
const CACHE_TTL = 3600

// ============================================================================
// Internal Fetch Functions (not exported - wrapped with cache below)
// ============================================================================

/**
 * Internal: Fetch all active promotions within their date range
 */
async function fetchActivePromotions(limit: number): Promise<Promotion[]> {
    const now = new Date()

    const results = await db
        .select()
        .from(promotion)
        .where(
            and(
                eq(promotion.status, 'active'),
                or(
                    // No start date set (always valid)
                    sql`${promotion.startsAt} IS NULL`,
                    // Start date has passed
                    lte(promotion.startsAt, now)
                ),
                or(
                    // No end date set (never expires)
                    sql`${promotion.endsAt} IS NULL`,
                    // End date hasn't passed yet
                    gte(promotion.endsAt, now)
                )
            )
        )
        .orderBy(desc(promotion.priority), desc(promotion.createdAt))
        .limit(limit)

    return results
}

/**
 * Internal: Fetch active promotions filtered by type
 */
async function fetchActivePromotionsByType(
    type: PromotionType,
    limit: number
): Promise<Promotion[]> {
    const now = new Date()

    const results = await db
        .select()
        .from(promotion)
        .where(
            and(
                eq(promotion.status, 'active'),
                eq(promotion.type, type),
                or(
                    sql`${promotion.startsAt} IS NULL`,
                    lte(promotion.startsAt, now)
                ),
                or(sql`${promotion.endsAt} IS NULL`, gte(promotion.endsAt, now))
            )
        )
        .orderBy(desc(promotion.priority), desc(promotion.createdAt))
        .limit(limit)

    return results
}

/**
 * Internal: Fetch the highest priority active promotion
 */
async function fetchFeaturedPromotion(): Promise<Promotion | null> {
    const now = new Date()

    const [result] = await db
        .select()
        .from(promotion)
        .where(
            and(
                eq(promotion.status, 'active'),
                or(
                    sql`${promotion.startsAt} IS NULL`,
                    lte(promotion.startsAt, now)
                ),
                or(sql`${promotion.endsAt} IS NULL`, gte(promotion.endsAt, now))
            )
        )
        .orderBy(desc(promotion.priority), desc(promotion.createdAt))
        .limit(1)

    return result ?? null
}

/**
 * Internal: Fetch a single promotion by slug
 */
async function fetchPromotionBySlug(slug: string): Promise<Promotion | null> {
    const now = new Date()

    // Only return if it's active and within date range
    const [result] = await db
        .select()
        .from(promotion)
        .where(
            and(
                eq(promotion.slug, slug),
                eq(promotion.status, 'active'),
                or(
                    sql`${promotion.startsAt} IS NULL`,
                    lte(promotion.startsAt, now)
                ),
                or(sql`${promotion.endsAt} IS NULL`, gte(promotion.endsAt, now))
            )
        )
        .limit(1)

    return result ?? null
}

/**
 * Internal: Fetch the highest priority active promotion for modal display
 */
async function fetchFeaturedPromotionForModal(): Promise<Promotion | null> {
    const now = new Date()

    const [result] = await db
        .select()
        .from(promotion)
        .where(
            and(
                eq(promotion.status, 'active'),
                isNotNull(promotion.modalDelaySeconds),
                or(
                    sql`${promotion.startsAt} IS NULL`,
                    lte(promotion.startsAt, now)
                ),
                or(sql`${promotion.endsAt} IS NULL`, gte(promotion.endsAt, now))
            )
        )
        .orderBy(desc(promotion.priority), desc(promotion.createdAt))
        .limit(1)

    return result ?? null
}

// ============================================================================
// Cached Query Functions (exported)
// ============================================================================

/**
 * Get all active promotions that are within their date range.
 * Ordered by priority (highest first), then by creation date.
 *
 * Uses ISR caching with 'promotions' tag for on-demand revalidation.
 *
 * @param limit - Maximum number of promotions to return (default: 100)
 * @returns Array of active promotions
 */
export function getActivePromotions(limit: number = 100): Promise<Promotion[]> {
    return unstable_cache(
        () => fetchActivePromotions(limit),
        [`active-promotions-${limit}`],
        {
            tags: [CACHE_TAGS.PROMOTIONS],
            revalidate: CACHE_TTL,
        }
    )()
}

/**
 * Get active promotions filtered by type.
 *
 * Uses ISR caching with 'promotions' tag for on-demand revalidation.
 *
 * @param type - The promotion type to filter by
 * @param limit - Maximum number of promotions to return (default: 100)
 * @returns Array of active promotions of the specified type
 */
export function getActivePromotionsByType(
    type: PromotionType,
    limit: number = 100
): Promise<Promotion[]> {
    return unstable_cache(
        () => fetchActivePromotionsByType(type, limit),
        [`active-promotions-${type}-${limit}`],
        {
            tags: [CACHE_TAGS.PROMOTIONS],
            revalidate: CACHE_TTL,
        }
    )()
}

/**
 * Get the highest priority active promotion for homepage banner and announcement bar.
 *
 * Uses ISR caching with 'promotions' and 'promotion-featured' tags
 * for targeted on-demand revalidation.
 *
 * @returns The featured promotion or null if none active
 */
export function getFeaturedPromotion(): Promise<Promotion | null> {
    return unstable_cache(fetchFeaturedPromotion, ['featured-promotion'], {
        tags: [CACHE_TAGS.PROMOTIONS, CACHE_TAGS.PROMOTION_FEATURED],
        revalidate: CACHE_TTL,
    })()
}

/**
 * Get a single promotion by slug for detail pages.
 * Only returns active promotions within their date range.
 *
 * Uses ISR caching with 'promotions' and slug-specific tags
 * for targeted on-demand revalidation.
 *
 * @param slug - The promotion slug
 * @returns The promotion or null if not found/not active
 */
export function getPromotionBySlug(slug: string): Promise<Promotion | null> {
    return unstable_cache(
        () => fetchPromotionBySlug(slug),
        [`promotion-${slug}`],
        {
            tags: [CACHE_TAGS.PROMOTIONS, CACHE_TAGS.promotionBySlug(slug)],
            revalidate: CACHE_TTL,
        }
    )()
}

/**
 * Get the highest priority active promotion for the timed modal.
 * Only returns promotions that have modalDelaySeconds set.
 *
 * Uses ISR caching with 'promotions' and 'promotion-modal' tags
 * for targeted on-demand revalidation.
 *
 * @returns The modal promotion or null if none configured
 */
export function getFeaturedPromotionForModal(): Promise<Promotion | null> {
    return unstable_cache(
        fetchFeaturedPromotionForModal,
        ['featured-promotion-modal'],
        {
            tags: [CACHE_TAGS.PROMOTIONS, CACHE_TAGS.PROMOTION_MODAL],
            revalidate: CACHE_TTL,
        }
    )()
}

// ============================================================================
// Non-Cached Functions (mutations and utilities)
// ============================================================================

/**
 * Increment view count for a promotion.
 * Not cached as this is a write operation.
 */
export async function incrementPromotionViews(id: string): Promise<void> {
    await db.execute(
        sql`UPDATE promotion SET views = views + 1 WHERE id = ${id}`
    )
}

/**
 * Increment click count for a promotion.
 * Not cached as this is a write operation.
 */
export async function incrementPromotionClicks(id: string): Promise<void> {
    await db.execute(
        sql`UPDATE promotion SET clicks = clicks + 1 WHERE id = ${id}`
    )
}

/**
 * Get promotion CTA link based on link type.
 * Pure function - no caching needed.
 */
export function getPromotionLink(promo: Promotion): string {
    switch (promo.linkType) {
        case 'procedure':
            return promo.procedureSlug
                ? `/procedures/${promo.procedureSlug}`
                : '/contact-us'
        case 'custom_url':
            return promo.customUrl ?? '/contact-us'
        case 'contact':
        default:
            return '/contact-us'
    }
}

/**
 * Format discount for display.
 * Pure function - no caching needed.
 */
export function formatDiscount(promo: Promotion): string | null {
    if (promo.type !== 'discount' || !promo.discountValue) {
        return null
    }

    if (promo.discountTypeValue === 'percentage') {
        return `${promo.discountValue}% OFF`
    }

    return `$${promo.discountValue} OFF`
}

/**
 * Check if promotion is expiring soon (within 7 days).
 * Pure function - no caching needed.
 */
export function isExpiringSoon(promo: Promotion): boolean {
    if (!promo.endsAt) return false

    const now = new Date()
    const endsAt = new Date(promo.endsAt)
    const daysUntilEnd = Math.ceil(
        (endsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    )

    return daysUntilEnd > 0 && daysUntilEnd <= 7
}

/**
 * Get remaining days for a promotion.
 * Pure function - no caching needed.
 */
export function getRemainingDays(promo: Promotion): number | null {
    if (!promo.endsAt) return null

    const now = new Date()
    const endsAt = new Date(promo.endsAt)
    const daysRemaining = Math.ceil(
        (endsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    )

    return daysRemaining > 0 ? daysRemaining : 0
}
