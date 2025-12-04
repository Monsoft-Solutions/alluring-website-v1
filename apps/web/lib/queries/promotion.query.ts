import { db } from '@workspace/db/client'
import { promotion, type Promotion } from '@workspace/db/schema/promotion'
import { desc, eq, and, or, lte, gte, sql } from 'drizzle-orm'

export type PromotionType = 'discount' | 'seasonal' | 'bundle' | 'financing'

/**
 * Get all active promotions that are within their date range
 * Ordered by priority (highest first), then by creation date
 */
export async function getActivePromotions(
    limit?: number
): Promise<Promotion[]> {
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
        .limit(limit ?? 100)

    return results
}

/**
 * Get active promotions filtered by type
 */
export async function getActivePromotionsByType(
    type: PromotionType,
    limit?: number
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
        .limit(limit ?? 100)

    return results
}

/**
 * Get the highest priority active promotion (for homepage banner)
 */
export async function getFeaturedPromotion(): Promise<Promotion | null> {
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
 * Get a single promotion by slug (for detail pages)
 */
export async function getPromotionBySlug(
    slug: string
): Promise<Promotion | null> {
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
 * Increment view count for a promotion
 */
export async function incrementPromotionViews(id: string): Promise<void> {
    await db.execute(
        sql`UPDATE promotion SET views = views + 1 WHERE id = ${id}`
    )
}

/**
 * Increment click count for a promotion
 */
export async function incrementPromotionClicks(id: string): Promise<void> {
    await db.execute(
        sql`UPDATE promotion SET clicks = clicks + 1 WHERE id = ${id}`
    )
}

/**
 * Get promotion CTA link based on link type
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
 * Format discount for display
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
 * Check if promotion is expiring soon (within 7 days)
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
 * Get remaining days for a promotion
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
