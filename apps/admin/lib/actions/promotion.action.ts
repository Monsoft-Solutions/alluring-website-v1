'use server'

import { db } from '@workspace/db/client'
import { promotion } from '@workspace/db/schema/promotion'
import { eq, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

import {
    revalidateWebAppCache,
    getAllPromotionCacheTags,
} from '@/lib/utils/revalidate-web.util'
import { requireAuth, UnauthorizedError } from '@/lib/utils/auth.util'

export type PromotionFormData = {
    title: string
    slug: string
    description: string
    excerpt?: string | null
    status: 'draft' | 'scheduled' | 'active' | 'paused' | 'expired'
    type: 'discount' | 'seasonal' | 'bundle' | 'financing'
    discountValue?: number | null
    discountTypeValue?: 'percentage' | 'fixed_amount' | null
    startsAt?: Date | null
    endsAt?: Date | null
    isAutoActivate?: boolean
    isAutoExpire?: boolean
    imageUrl?: string | null
    imageAlt?: string | null
    videoUrl?: string | null
    thumbnailUrl?: string | null
    linkType: 'procedure' | 'custom_url' | 'contact'
    procedureSlug?: string | null
    customUrl?: string | null
    ctaText?: string
    priority?: number
    modalDelaySeconds?: number | null
}

type ActionResult = {
    success: boolean
    error?: string
    id?: string
}

/**
 * Create a new promotion
 */
export async function createPromotion(
    data: PromotionFormData
): Promise<ActionResult> {
    try {
        await requireAuth()

        // Validate required fields
        if (!data.title?.trim()) {
            return { success: false, error: 'Title is required' }
        }
        if (!data.slug?.trim()) {
            return { success: false, error: 'Slug is required' }
        }
        if (!data.description?.trim()) {
            return { success: false, error: 'Description is required' }
        }
        if (!data.type) {
            return { success: false, error: 'Promotion type is required' }
        }

        // Check if slug already exists
        const existingPromotion = await db
            .select({ id: promotion.id })
            .from(promotion)
            .where(eq(promotion.slug, data.slug))
            .limit(1)

        if (existingPromotion.length > 0) {
            return {
                success: false,
                error: 'A promotion with this slug already exists',
            }
        }

        // Create the promotion
        const [newPromotion] = await db
            .insert(promotion)
            .values({
                title: data.title,
                slug: data.slug,
                description: data.description,
                excerpt: data.excerpt ?? null,
                status: data.status,
                type: data.type,
                discountValue: data.discountValue ?? null,
                discountTypeValue: data.discountTypeValue ?? null,
                startsAt: data.startsAt ?? null,
                endsAt: data.endsAt ?? null,
                isAutoActivate: data.isAutoActivate ?? true,
                isAutoExpire: data.isAutoExpire ?? true,
                imageUrl: data.imageUrl ?? null,
                imageAlt: data.imageAlt ?? null,
                videoUrl: data.videoUrl ?? null,
                thumbnailUrl: data.thumbnailUrl ?? null,
                linkType: data.linkType,
                procedureSlug: data.procedureSlug ?? null,
                customUrl: data.customUrl ?? null,
                ctaText: data.ctaText ?? 'Learn More',
                priority: data.priority ?? 0,
                modalDelaySeconds: data.modalDelaySeconds ?? 60,
            })
            .returning({ id: promotion.id })

        // Revalidate admin dashboard paths
        revalidatePath('/promotions')
        revalidatePath('/')

        // Revalidate web app cache (announcement bar, homepage section, promotions page, modal)
        await revalidateWebAppCache(getAllPromotionCacheTags())

        return { success: true, id: newPromotion?.id }
    } catch (error) {
        console.error('Error creating promotion:', error)

        if (error instanceof UnauthorizedError) {
            return { success: false, error: 'Unauthorized' }
        }

        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to create promotion',
        }
    }
}

/**
 * Update an existing promotion
 */
export async function updatePromotion(
    id: string,
    data: PromotionFormData
): Promise<ActionResult> {
    try {
        await requireAuth()

        // Validate required fields
        if (!data.title?.trim()) {
            return { success: false, error: 'Title is required' }
        }
        if (!data.slug?.trim()) {
            return { success: false, error: 'Slug is required' }
        }
        if (!data.description?.trim()) {
            return { success: false, error: 'Description is required' }
        }

        // Check if slug already exists for another promotion
        const existingPromotion = await db
            .select({ id: promotion.id, slug: promotion.slug })
            .from(promotion)
            .where(eq(promotion.slug, data.slug))
            .limit(1)

        if (existingPromotion.length > 0 && existingPromotion[0]?.id !== id) {
            return {
                success: false,
                error: 'A promotion with this slug already exists',
            }
        }

        // Verify promotion exists and get current slug for cache invalidation
        const currentPromotion = await db
            .select({ id: promotion.id, slug: promotion.slug })
            .from(promotion)
            .where(eq(promotion.id, id))
            .limit(1)

        if (!currentPromotion.length) {
            return { success: false, error: 'Promotion not found' }
        }

        const oldSlug = currentPromotion[0]?.slug

        // Update the promotion
        await db
            .update(promotion)
            .set({
                title: data.title,
                slug: data.slug,
                description: data.description,
                excerpt: data.excerpt ?? null,
                status: data.status,
                type: data.type,
                discountValue: data.discountValue ?? null,
                discountTypeValue: data.discountTypeValue ?? null,
                startsAt: data.startsAt ?? null,
                endsAt: data.endsAt ?? null,
                isAutoActivate: data.isAutoActivate ?? true,
                isAutoExpire: data.isAutoExpire ?? true,
                imageUrl: data.imageUrl ?? null,
                imageAlt: data.imageAlt ?? null,
                videoUrl: data.videoUrl ?? null,
                thumbnailUrl: data.thumbnailUrl ?? null,
                linkType: data.linkType,
                procedureSlug: data.procedureSlug ?? null,
                customUrl: data.customUrl ?? null,
                ctaText: data.ctaText ?? 'Learn More',
                priority: data.priority ?? 0,
                modalDelaySeconds: data.modalDelaySeconds ?? 60,
            })
            .where(eq(promotion.id, id))

        // Revalidate admin dashboard paths
        revalidatePath('/promotions')
        revalidatePath(`/promotions/${id}/edit`)
        revalidatePath('/')

        // Revalidate web app cache - include slug-specific tags for detail pages
        const cacheTags = getAllPromotionCacheTags()
        if (oldSlug) {
            cacheTags.push(`promotion-${oldSlug}`)
        }
        if (data.slug !== oldSlug) {
            cacheTags.push(`promotion-${data.slug}`)
        }
        await revalidateWebAppCache(cacheTags)

        return { success: true, id }
    } catch (error) {
        console.error('Error updating promotion:', error)

        if (error instanceof UnauthorizedError) {
            return { success: false, error: 'Unauthorized' }
        }

        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to update promotion',
        }
    }
}

/**
 * Delete a promotion
 */
export async function deletePromotion(id: string): Promise<ActionResult> {
    try {
        await requireAuth()

        // Get the promotion slug before deleting for cache invalidation
        const currentPromotion = await db
            .select({ slug: promotion.slug })
            .from(promotion)
            .where(eq(promotion.id, id))
            .limit(1)

        const slug = currentPromotion[0]?.slug

        await db.delete(promotion).where(eq(promotion.id, id))

        // Revalidate admin dashboard paths
        revalidatePath('/promotions')
        revalidatePath('/')

        // Revalidate web app cache - include slug-specific tag
        const cacheTags = getAllPromotionCacheTags()
        if (slug) {
            cacheTags.push(`promotion-${slug}`)
        }
        await revalidateWebAppCache(cacheTags)

        return { success: true }
    } catch (error) {
        console.error('Error deleting promotion:', error)

        if (error instanceof UnauthorizedError) {
            return { success: false, error: 'Unauthorized' }
        }

        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to delete promotion',
        }
    }
}

/**
 * Update promotion status
 */
export async function updatePromotionStatus(
    id: string,
    status: 'draft' | 'scheduled' | 'active' | 'paused' | 'expired'
): Promise<ActionResult> {
    try {
        await requireAuth()

        const currentPromotion = await db
            .select({ id: promotion.id, slug: promotion.slug })
            .from(promotion)
            .where(eq(promotion.id, id))
            .limit(1)

        if (!currentPromotion.length) {
            return { success: false, error: 'Promotion not found' }
        }

        const slug = currentPromotion[0]?.slug

        await db.update(promotion).set({ status }).where(eq(promotion.id, id))

        // Revalidate admin dashboard paths
        revalidatePath('/promotions')
        revalidatePath('/')

        // Revalidate web app cache - status changes affect visibility
        const cacheTags = getAllPromotionCacheTags()
        if (slug) {
            cacheTags.push(`promotion-${slug}`)
        }
        await revalidateWebAppCache(cacheTags)

        return { success: true }
    } catch (error) {
        console.error('Error updating promotion status:', error)

        if (error instanceof UnauthorizedError) {
            return { success: false, error: 'Unauthorized' }
        }

        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to update status',
        }
    }
}

/**
 * Increment promotion views
 */
export async function incrementPromotionViews(
    id: string
): Promise<ActionResult> {
    try {
        await requireAuth()

        // Use parameterized query for atomic increment
        await db.execute(
            sql`UPDATE promotion SET views = views + 1 WHERE id = ${id}`
        )

        return { success: true }
    } catch (error) {
        console.error('Error incrementing promotion views:', error)

        if (error instanceof UnauthorizedError) {
            return { success: false, error: 'Unauthorized' }
        }

        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to increment views',
        }
    }
}

/**
 * Increment promotion clicks
 */
export async function incrementPromotionClicks(
    id: string
): Promise<ActionResult> {
    try {
        await requireAuth()

        // Use parameterized query for atomic increment
        await db.execute(
            sql`UPDATE promotion SET clicks = clicks + 1 WHERE id = ${id}`
        )

        return { success: true }
    } catch (error) {
        console.error('Error incrementing promotion clicks:', error)

        if (error instanceof UnauthorizedError) {
            return { success: false, error: 'Unauthorized' }
        }

        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to increment clicks',
        }
    }
}
