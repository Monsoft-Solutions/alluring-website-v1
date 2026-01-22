/**
 * Google Reviews Admin Actions
 *
 * Server actions for managing Google Reviews in admin panel.
 *
 * @module lib/actions/google-reviews
 */
'use server'

import { db } from '@workspace/db/client'
import { googleReview, googleReviewsSettings } from '@workspace/db/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { revalidateTag } from 'next/cache'
import { CACHE_TAGS } from '@workspace/shared/cache'

import { requireAuth, UnauthorizedError } from '@/lib/utils/auth.util'
import { revalidateWebAppCache } from '@/lib/utils/revalidate-web.util'
import {
    exchangeCodeForTokens,
    calculateTokenExpiry,
    syncReviews as syncReviewsService,
    fetchBusinessAccounts,
    fetchBusinessLocations,
    type ReviewsSyncResult,
    type GoogleBusinessAccount,
    type GoogleBusinessLocation,
} from '@/lib/services/google-reviews'

// Re-export types for components
export type { ReviewsSyncResult, GoogleBusinessAccount, GoogleBusinessLocation }

// ============================================================================
// Types
// ============================================================================

type ActionResult = {
    success: boolean
    error?: string
}

// ============================================================================
// Settings Actions
// ============================================================================

/**
 * Get or create Google Reviews settings
 */
export async function getGoogleReviewsSettings() {
    await requireAuth()

    const settings = await db.select().from(googleReviewsSettings).limit(1)

    return settings[0] ?? null
}

/**
 * Handle OAuth callback
 * Exchange the authorization code for tokens
 */
export async function handleOAuthCallback(code: string): Promise<ActionResult> {
    try {
        await requireAuth()

        // Exchange code for tokens
        const tokens = await exchangeCodeForTokens(code)

        // Get existing settings or create new
        const existing = await db.select().from(googleReviewsSettings).limit(1)

        // Build token data - only include refreshToken if Google provided one,
        // otherwise preserve the existing stored value
        const tokenData: {
            accessToken: string
            refreshToken?: string | null
            tokenExpiresAt: Date
        } = {
            accessToken: tokens.access_token,
            tokenExpiresAt: calculateTokenExpiry(tokens.expires_in),
        }

        // Only set refreshToken if Google returned one (first auth only)
        // Otherwise, preserve the existing refresh token
        if (tokens.refresh_token) {
            tokenData.refreshToken = tokens.refresh_token
        }

        if (existing.length > 0) {
            await db
                .update(googleReviewsSettings)
                .set(tokenData)
                .where(eq(googleReviewsSettings.id, existing[0]!.id))
        } else {
            // For new records, set refreshToken (may be null on first insert)
            await db.insert(googleReviewsSettings).values({
                accessToken: tokenData.accessToken,
                refreshToken: tokens.refresh_token ?? null,
                tokenExpiresAt: tokenData.tokenExpiresAt,
                isEnabled: false,
            })
        }

        revalidatePath('/reviews')
        revalidatePath('/reviews/settings')

        return { success: true }
    } catch (error) {
        if (error instanceof UnauthorizedError) {
            return { success: false, error: 'Unauthorized' }
        }

        console.error('Error handling OAuth callback:', error)
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to complete OAuth',
        }
    }
}

/**
 * Get available Google Business accounts
 */
export async function getBusinessAccounts(): Promise<{
    success: boolean
    accounts?: GoogleBusinessAccount[]
    error?: string
}> {
    try {
        await requireAuth()

        const accounts = await fetchBusinessAccounts()
        return { success: true, accounts }
    } catch (error) {
        if (error instanceof UnauthorizedError) {
            return { success: false, error: 'Unauthorized' }
        }

        console.error('Error fetching business accounts:', error)
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to fetch accounts',
        }
    }
}

/**
 * Get locations for a business account
 */
export async function getBusinessLocations(accountId: string): Promise<{
    success: boolean
    locations?: GoogleBusinessLocation[]
    error?: string
}> {
    try {
        await requireAuth()

        const locations = await fetchBusinessLocations(accountId)
        return { success: true, locations }
    } catch (error) {
        if (error instanceof UnauthorizedError) {
            return { success: false, error: 'Unauthorized' }
        }

        console.error('Error fetching business locations:', error)
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to fetch locations',
        }
    }
}

/**
 * Save selected business location
 */
export async function saveBusinessLocation(
    accountId: string,
    locationId: string,
    locationName: string
): Promise<ActionResult> {
    try {
        await requireAuth()

        const existing = await db.select().from(googleReviewsSettings).limit(1)

        if (existing.length > 0) {
            await db
                .update(googleReviewsSettings)
                .set({
                    accountId,
                    locationId,
                    locationName,
                    isEnabled: true,
                })
                .where(eq(googleReviewsSettings.id, existing[0]!.id))
        } else {
            return {
                success: false,
                error: 'Please complete OAuth first',
            }
        }

        revalidatePath('/reviews')
        revalidatePath('/reviews/settings')

        return { success: true }
    } catch (error) {
        if (error instanceof UnauthorizedError) {
            return { success: false, error: 'Unauthorized' }
        }

        console.error('Error saving business location:', error)
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to save location',
        }
    }
}

/**
 * Toggle Google Reviews integration enabled/disabled
 */
export async function toggleGoogleReviewsEnabled(
    enabled: boolean
): Promise<ActionResult> {
    try {
        await requireAuth()

        const existing = await db.select().from(googleReviewsSettings).limit(1)

        if (existing.length > 0) {
            await db
                .update(googleReviewsSettings)
                .set({ isEnabled: enabled })
                .where(eq(googleReviewsSettings.id, existing[0]!.id))
        }

        revalidatePath('/reviews')
        revalidatePath('/reviews/settings')

        return { success: true }
    } catch (error) {
        if (error instanceof UnauthorizedError) {
            return { success: false, error: 'Unauthorized' }
        }

        console.error('Error toggling Google Reviews:', error)
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to update setting',
        }
    }
}

// ============================================================================
// Sync Actions
// ============================================================================

/**
 * Sync reviews from Google Business Profile
 */
export async function syncGoogleReviews(): Promise<ReviewsSyncResult> {
    try {
        await requireAuth()

        const result = await syncReviewsService()

        if (result.success) {
            revalidatePath('/reviews')
            revalidateTag(CACHE_TAGS.GOOGLE_REVIEWS as string, { expire: 0 })
            await revalidateWebAppCache([CACHE_TAGS.GOOGLE_REVIEWS])
        }

        return result
    } catch (error) {
        if (error instanceof UnauthorizedError) {
            return {
                success: false,
                newCount: 0,
                updatedCount: 0,
                totalCount: 0,
                averageRating: null,
                error: 'Unauthorized',
            }
        }

        console.error('Error syncing Google Reviews:', error)
        return {
            success: false,
            newCount: 0,
            updatedCount: 0,
            totalCount: 0,
            averageRating: null,
            error: error instanceof Error ? error.message : 'Sync failed',
        }
    }
}

// ============================================================================
// Review Management Actions
// ============================================================================

/**
 * Toggle review published status
 */
export async function toggleReviewPublished(
    reviewId: string,
    isPublished: boolean
): Promise<ActionResult> {
    try {
        await requireAuth()

        await db
            .update(googleReview)
            .set({ isPublished })
            .where(eq(googleReview.id, reviewId))

        revalidatePath('/reviews')
        revalidateTag(CACHE_TAGS.GOOGLE_REVIEWS as string, { expire: 0 })
        await revalidateWebAppCache([CACHE_TAGS.GOOGLE_REVIEWS])

        return { success: true }
    } catch (error) {
        if (error instanceof UnauthorizedError) {
            return { success: false, error: 'Unauthorized' }
        }

        console.error('Error toggling review published:', error)
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to update review',
        }
    }
}

/**
 * Toggle review featured status
 */
export async function toggleReviewFeatured(
    reviewId: string,
    isFeatured: boolean
): Promise<ActionResult> {
    try {
        await requireAuth()

        await db
            .update(googleReview)
            .set({ isFeatured })
            .where(eq(googleReview.id, reviewId))

        revalidatePath('/reviews')
        revalidateTag(CACHE_TAGS.GOOGLE_REVIEWS as string, { expire: 0 })
        await revalidateWebAppCache([CACHE_TAGS.GOOGLE_REVIEWS])

        return { success: true }
    } catch (error) {
        if (error instanceof UnauthorizedError) {
            return { success: false, error: 'Unauthorized' }
        }

        console.error('Error toggling review featured:', error)
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to update review',
        }
    }
}

/**
 * Update review display order
 */
export async function updateReviewDisplayOrder(
    reviewId: string,
    displayOrder: number
): Promise<ActionResult> {
    try {
        await requireAuth()

        await db
            .update(googleReview)
            .set({ displayOrder })
            .where(eq(googleReview.id, reviewId))

        revalidatePath('/reviews')
        revalidateTag(CACHE_TAGS.GOOGLE_REVIEWS as string, { expire: 0 })
        await revalidateWebAppCache([CACHE_TAGS.GOOGLE_REVIEWS])

        return { success: true }
    } catch (error) {
        if (error instanceof UnauthorizedError) {
            return { success: false, error: 'Unauthorized' }
        }

        console.error('Error updating review display order:', error)
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to update review',
        }
    }
}

/**
 * Disconnect Google Reviews (clear OAuth tokens)
 */
export async function disconnectGoogleReviews(): Promise<ActionResult> {
    try {
        await requireAuth()

        const existing = await db.select().from(googleReviewsSettings).limit(1)

        if (existing.length > 0) {
            await db
                .update(googleReviewsSettings)
                .set({
                    accessToken: null,
                    refreshToken: null,
                    tokenExpiresAt: null,
                    accountId: null,
                    locationId: null,
                    locationName: null,
                    isEnabled: false,
                })
                .where(eq(googleReviewsSettings.id, existing[0]!.id))
        }

        revalidatePath('/reviews')
        revalidatePath('/reviews/settings')

        return { success: true }
    } catch (error) {
        if (error instanceof UnauthorizedError) {
            return { success: false, error: 'Unauthorized' }
        }

        console.error('Error disconnecting Google Reviews:', error)
        return {
            success: false,
            error:
                error instanceof Error ? error.message : 'Failed to disconnect',
        }
    }
}
