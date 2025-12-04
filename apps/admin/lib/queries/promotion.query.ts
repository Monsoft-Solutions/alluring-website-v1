import { db } from '@workspace/db/client'
import { promotion, type Promotion } from '@workspace/db/schema/promotion'
import { desc, asc, eq, and, or, gte, lte, sql } from 'drizzle-orm'

export type PromotionSortBy = 'createdAt' | 'priority' | 'startsAt' | 'views'
export type PromotionSortOrder = 'asc' | 'desc'
export type PromotionStatus =
    | 'draft'
    | 'scheduled'
    | 'active'
    | 'paused'
    | 'expired'
export type PromotionType = 'discount' | 'seasonal' | 'bundle' | 'financing'

type GetPromotionsParams = {
    page?: number
    pageSize?: number
    sortBy?: PromotionSortBy
    sortOrder?: PromotionSortOrder
    status?: PromotionStatus
    type?: PromotionType
}

type PromotionListItem = {
    id: string
    slug: string
    title: string
    excerpt: string | null
    status: PromotionStatus
    type: PromotionType
    discountValue: number | null
    discountTypeValue: 'percentage' | 'fixed_amount' | null
    startsAt: Date | null
    endsAt: Date | null
    imageUrl: string | null
    priority: number
    views: number
    clicks: number
    createdAt: Date
}

/**
 * Get paginated list of promotions with optional filters
 */
export async function getPromotions({
    page = 1,
    pageSize = 10,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    status,
    type,
}: GetPromotionsParams = {}): Promise<{
    promotions: PromotionListItem[]
    total: number
}> {
    const offset = (page - 1) * pageSize

    // Build where conditions
    const conditions = []
    if (status) {
        conditions.push(eq(promotion.status, status))
    }
    if (type) {
        conditions.push(eq(promotion.type, type))
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined

    // Build order by
    const sortColumn = {
        createdAt: promotion.createdAt,
        priority: promotion.priority,
        startsAt: promotion.startsAt,
        views: promotion.views,
    }[sortBy]

    const orderByClause =
        sortOrder === 'asc' ? asc(sortColumn) : desc(sortColumn)

    // Execute queries
    const [promotions, countResult] = await Promise.all([
        db
            .select({
                id: promotion.id,
                slug: promotion.slug,
                title: promotion.title,
                excerpt: promotion.excerpt,
                status: promotion.status,
                type: promotion.type,
                discountValue: promotion.discountValue,
                discountTypeValue: promotion.discountTypeValue,
                startsAt: promotion.startsAt,
                endsAt: promotion.endsAt,
                imageUrl: promotion.imageUrl,
                priority: promotion.priority,
                views: promotion.views,
                clicks: promotion.clicks,
                createdAt: promotion.createdAt,
            })
            .from(promotion)
            .where(whereClause)
            .orderBy(orderByClause)
            .limit(pageSize)
            .offset(offset),
        db
            .select({ count: sql<number>`count(*)` })
            .from(promotion)
            .where(whereClause),
    ])

    return {
        promotions: promotions as PromotionListItem[],
        total: Number(countResult[0]?.count ?? 0),
    }
}

/**
 * Get a single promotion by ID
 */
export async function getPromotionById(id: string): Promise<Promotion | null> {
    const [result] = await db
        .select()
        .from(promotion)
        .where(eq(promotion.id, id))
        .limit(1)

    return result ?? null
}

/**
 * Get a single promotion by slug
 */
export async function getPromotionBySlug(
    slug: string
): Promise<Promotion | null> {
    const [result] = await db
        .select()
        .from(promotion)
        .where(eq(promotion.slug, slug))
        .limit(1)

    return result ?? null
}

/**
 * Get active promotions (for public display)
 * Returns promotions that are active and within their date range
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
 * Get promotions that need status updates based on dates
 * Used for automated status management
 */
export async function getPromotionsNeedingStatusUpdate(): Promise<{
    toActivate: Promotion[]
    toExpire: Promotion[]
}> {
    const now = new Date()

    // Find scheduled promotions that should be activated
    const toActivate = await db
        .select()
        .from(promotion)
        .where(
            and(
                eq(promotion.status, 'scheduled'),
                eq(promotion.isAutoActivate, true),
                lte(promotion.startsAt, now)
            )
        )

    // Find active promotions that should be expired
    const toExpire = await db
        .select()
        .from(promotion)
        .where(
            and(
                eq(promotion.status, 'active'),
                eq(promotion.isAutoExpire, true),
                lte(promotion.endsAt, now)
            )
        )

    return { toActivate, toExpire }
}

/**
 * Get promotion statistics
 */
export async function getPromotionStats(): Promise<{
    total: number
    active: number
    scheduled: number
    draft: number
    expired: number
}> {
    const results = await db
        .select({
            status: promotion.status,
            count: sql<number>`count(*)`,
        })
        .from(promotion)
        .groupBy(promotion.status)

    const stats = {
        total: 0,
        active: 0,
        scheduled: 0,
        draft: 0,
        expired: 0,
    }

    for (const row of results) {
        const count = Number(row.count)
        stats.total += count
        if (row.status === 'active') stats.active = count
        if (row.status === 'scheduled') stats.scheduled = count
        if (row.status === 'draft') stats.draft = count
        if (row.status === 'expired') stats.expired = count
    }

    return stats
}
