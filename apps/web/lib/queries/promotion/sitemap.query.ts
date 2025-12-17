/**
 * Promotion Sitemap Query
 *
 * Fetches data needed for sitemap generation:
 * - All active promotions with image URLs and updatedAt
 */
import { db } from '@workspace/db/client'
import { promotion } from '@workspace/db/schema/promotion'
import { and, eq, or, lte, gte, sql } from 'drizzle-orm'
import { cache } from 'react'

/**
 * Promotion sitemap entry
 */
export type PromotionSitemapEntry = {
    slug: string
    imageUrl: string | null
    imageAlt: string | null
    title: string
    updatedAt: Date
}

/**
 * Get all active promotions for sitemap
 * Includes image URL, title, and last modified date
 */
export const getPromotionsForSitemap = cache(
    async (): Promise<PromotionSitemapEntry[]> => {
        const now = new Date()

        const rows = await db
            .select({
                slug: promotion.slug,
                imageUrl: promotion.imageUrl,
                imageAlt: promotion.imageAlt,
                title: promotion.title,
                updatedAt: promotion.updatedAt,
            })
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

        return rows.map((r) => ({
            slug: r.slug,
            imageUrl: r.imageUrl,
            imageAlt: r.imageAlt,
            title: r.title,
            updatedAt: r.updatedAt,
        }))
    }
)
