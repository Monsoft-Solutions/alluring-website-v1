'use server'

import { db } from '@workspace/db/client'
import { galleryMedia } from '@workspace/db/schema/gallery'
import type {
    GalleryMediaAIAnalysis,
    SEOContent,
    VisitorContent,
    GroupSuggestion,
} from '@workspace/shared/schemas/gallery'
import {
    analyzeGalleryImage,
    generateGallerySEOContent,
    generateGalleryVisitorContent,
    suggestGalleryGroups,
} from '@workspace/ai'
import { eq } from 'drizzle-orm'

import { getGalleryGroupsForAI } from '@/lib/queries/gallery.query'
import { requireAuth } from '@/lib/utils/auth.util'

// ============================================================================
// Types
// ============================================================================

type AnalyzeResult = {
    success: boolean
    error?: string
    analysis?: GalleryMediaAIAnalysis
}

type SEOContentResult = {
    success: boolean
    error?: string
    content?: SEOContent
}

type VisitorContentResult = {
    success: boolean
    error?: string
    content?: VisitorContent
}

type GroupSuggestionResult = {
    success: boolean
    error?: string
    suggestion?: GroupSuggestion
    /** Group IDs that match the suggested slugs */
    suggestedGroupIds?: string[]
}

// ============================================================================
// Image Analysis Actions
// ============================================================================

/**
 * Analyze a gallery image using AI vision
 *
 * This function:
 * 1. Calls GPT-4o vision to analyze the image
 * 2. Saves the analysis to the database
 * 3. Returns the analysis result
 *
 * @param imageUrl - The URL of the image to analyze
 * @param mediaId - Optional media ID to save analysis to DB (for existing media)
 * @returns Analysis result with structured metadata
 */
export async function analyzeGalleryMediaImage(
    imageUrl: string,
    mediaId?: string
): Promise<AnalyzeResult> {
    try {
        await requireAuth()

        // Validate input
        if (!imageUrl?.trim()) {
            return { success: false, error: 'Image URL is required' }
        }

        // Call AI to analyze the image
        const analysis = await analyzeGalleryImage({
            imageUrl,
        })

        // If mediaId is provided, save to database
        if (mediaId) {
            await db
                .update(galleryMedia)
                .set({
                    aiAnalysis: analysis,
                    // Auto-set isBeforeAfter if detected with high confidence
                    ...(analysis.isBeforeAfter && {
                        isBeforeAfter: true,
                    }),
                })
                .where(eq(galleryMedia.id, mediaId))
        }

        return { success: true, analysis }
    } catch (error) {
        if (error instanceof Error && error.message === 'Unauthorized') {
            return { success: false, error: 'Unauthorized' }
        }

        console.error('Error analyzing gallery image:', error)
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to analyze image',
        }
    }
}

/**
 * Save AI analysis to a gallery media record
 *
 * Used when analysis was done during upload (before media ID exists)
 * and needs to be saved after the media record is created.
 *
 * @param mediaId - The media record ID
 * @param analysis - The AI analysis to save
 * @returns Success/error result
 */
export async function saveGalleryMediaAnalysis(
    mediaId: string,
    analysis: GalleryMediaAIAnalysis
): Promise<{ success: boolean; error?: string }> {
    try {
        if (!mediaId?.trim()) {
            return { success: false, error: 'Media ID is required' }
        }

        await db
            .update(galleryMedia)
            .set({
                aiAnalysis: analysis,
                // Auto-set isBeforeAfter if detected
                ...(analysis.isBeforeAfter && {
                    isBeforeAfter: true,
                }),
            })
            .where(eq(galleryMedia.id, mediaId))

        return { success: true }
    } catch (error) {
        if (error instanceof Error && error.message === 'Unauthorized') {
            return { success: false, error: 'Unauthorized' }
        }

        console.error('Error saving gallery analysis:', error)
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to save analysis',
        }
    }
}

// ============================================================================
// Content Generation Actions
// ============================================================================

/**
 * Generate SEO-optimized content for a gallery media item
 *
 * Uses the stored AI analysis to generate search-optimized
 * seoTitle, seoDescription, and slug.
 *
 * @param mediaId - The media record ID
 * @param currentTitle - Optional current title for context
 * @returns SEO content result
 */
export async function generateGalleryMediaSEOContent(
    mediaId: string,
    currentTitle?: string
): Promise<SEOContentResult> {
    try {
        await requireAuth()

        if (!mediaId?.trim()) {
            return { success: false, error: 'Media ID is required' }
        }

        // Get the media record with AI analysis
        const [media] = await db
            .select({
                aiAnalysis: galleryMedia.aiAnalysis,
                title: galleryMedia.title,
            })
            .from(galleryMedia)
            .where(eq(galleryMedia.id, mediaId))
            .limit(1)

        if (!media) {
            return { success: false, error: 'Media not found' }
        }

        if (!media.aiAnalysis) {
            return {
                success: false,
                error: 'No AI analysis found. Please analyze the image first.',
            }
        }

        // Generate SEO content
        const content = await generateGallerySEOContent({
            aiAnalysis: media.aiAnalysis,
            currentTitle: currentTitle ?? media.title,
        })

        return { success: true, content }
    } catch (error) {
        if (error instanceof Error && error.message === 'Unauthorized') {
            return { success: false, error: 'Unauthorized' }
        }

        console.error('Error generating SEO content:', error)
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to generate SEO content',
        }
    }
}

/**
 * Generate SEO content from provided analysis (without DB lookup)
 *
 * Useful when generating content before the media is saved,
 * or when you already have the analysis in memory.
 *
 * @param analysis - The AI analysis
 * @param currentTitle - Optional current title for context
 * @returns SEO content result
 */
export async function generateSEOContentFromAnalysis(
    analysis: GalleryMediaAIAnalysis,
    currentTitle?: string
): Promise<SEOContentResult> {
    try {
        await requireAuth()

        const content = await generateGallerySEOContent({
            aiAnalysis: analysis,
            currentTitle,
        })

        return { success: true, content }
    } catch (error) {
        if (error instanceof Error && error.message === 'Unauthorized') {
            return { success: false, error: 'Unauthorized' }
        }

        console.error('Error generating SEO content:', error)
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to generate SEO content',
        }
    }
}

/**
 * Generate visitor-focused content for a gallery media item
 *
 * Uses the stored AI analysis to generate engaging
 * title, description, and alt text.
 *
 * @param mediaId - The media record ID
 * @param currentTitle - Optional current title for context
 * @returns Visitor content result
 */
export async function generateGalleryMediaVisitorContent(
    mediaId: string,
    currentTitle?: string
): Promise<VisitorContentResult> {
    try {
        await requireAuth()

        if (!mediaId?.trim()) {
            return { success: false, error: 'Media ID is required' }
        }

        // Get the media record with AI analysis
        const [media] = await db
            .select({
                aiAnalysis: galleryMedia.aiAnalysis,
                title: galleryMedia.title,
            })
            .from(galleryMedia)
            .where(eq(galleryMedia.id, mediaId))
            .limit(1)

        if (!media) {
            return { success: false, error: 'Media not found' }
        }

        if (!media.aiAnalysis) {
            return {
                success: false,
                error: 'No AI analysis found. Please analyze the image first.',
            }
        }

        // Generate visitor content
        const content = await generateGalleryVisitorContent({
            aiAnalysis: media.aiAnalysis,
            currentTitle: currentTitle ?? media.title,
        })

        return { success: true, content }
    } catch (error) {
        if (error instanceof Error && error.message === 'Unauthorized') {
            return { success: false, error: 'Unauthorized' }
        }

        console.error('Error generating visitor content:', error)
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to generate visitor content',
        }
    }
}

/**
 * Generate visitor content from provided analysis (without DB lookup)
 *
 * Useful when generating content before the media is saved,
 * or when you already have the analysis in memory.
 *
 * @param analysis - The AI analysis
 * @param currentTitle - Optional current title for context
 * @returns Visitor content result
 */
export async function generateVisitorContentFromAnalysis(
    analysis: GalleryMediaAIAnalysis,
    currentTitle?: string
): Promise<VisitorContentResult> {
    try {
        await requireAuth()

        const content = await generateGalleryVisitorContent({
            aiAnalysis: analysis,
            currentTitle,
        })

        return { success: true, content }
    } catch (error) {
        if (error instanceof Error && error.message === 'Unauthorized') {
            return { success: false, error: 'Unauthorized' }
        }

        console.error('Error generating visitor content:', error)
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to generate visitor content',
        }
    }
}

// ============================================================================
// Group Suggestion Actions
// ============================================================================

/**
 * Suggest gallery groups for a media item using AI
 *
 * Uses the stored AI analysis to suggest appropriate groups
 * based on detected procedure, body area, and other metadata.
 *
 * @param mediaId - The media record ID
 * @returns Group suggestion result with suggested group IDs
 */
export async function suggestGroupsForMedia(
    mediaId: string
): Promise<GroupSuggestionResult> {
    try {
        await requireAuth()

        if (!mediaId?.trim()) {
            return { success: false, error: 'Media ID is required' }
        }

        // Get the media record with AI analysis
        const [media] = await db
            .select({
                aiAnalysis: galleryMedia.aiAnalysis,
            })
            .from(galleryMedia)
            .where(eq(galleryMedia.id, mediaId))
            .limit(1)

        if (!media) {
            return { success: false, error: 'Media not found' }
        }

        if (!media.aiAnalysis) {
            return {
                success: false,
                error: 'No AI analysis found. Please analyze the image first.',
            }
        }

        // Get all available groups with details
        const groups = await getGalleryGroupsForAI()

        if (groups.length === 0) {
            return {
                success: false,
                error: 'No gallery groups available.',
            }
        }

        // Call AI to suggest groups
        const suggestion = await suggestGalleryGroups({
            aiAnalysis: media.aiAnalysis,
            availableGroups: groups,
        })

        // Map suggested slugs to group IDs
        const slugToId = new Map(groups.map((g) => [g.slug, g.id]))
        const suggestedGroupIds = suggestion.suggestedGroups
            .filter((sg) => slugToId.has(sg.slug))
            .map((sg) => slugToId.get(sg.slug)!)

        return {
            success: true,
            suggestion,
            suggestedGroupIds,
        }
    } catch (error) {
        if (error instanceof Error && error.message === 'Unauthorized') {
            return { success: false, error: 'Unauthorized' }
        }

        console.error('Error suggesting groups:', error)
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to suggest groups',
        }
    }
}

/**
 * Suggest groups from provided analysis (without DB lookup)
 *
 * Useful when suggesting groups before the media is saved,
 * or when you already have the analysis in memory.
 *
 * @param analysis - The AI analysis
 * @returns Group suggestion result with suggested group IDs
 */
export async function suggestGroupsFromAnalysis(
    analysis: GalleryMediaAIAnalysis
): Promise<GroupSuggestionResult> {
    try {
        await requireAuth()

        // Get all available groups with details
        const groups = await getGalleryGroupsForAI()

        if (groups.length === 0) {
            return {
                success: false,
                error: 'No gallery groups available.',
            }
        }

        // Call AI to suggest groups
        const suggestion = await suggestGalleryGroups({
            aiAnalysis: analysis,
            availableGroups: groups,
        })

        // Map suggested slugs to group IDs
        const slugToId = new Map(groups.map((g) => [g.slug, g.id]))
        const suggestedGroupIds = suggestion.suggestedGroups
            .filter((sg) => slugToId.has(sg.slug))
            .map((sg) => slugToId.get(sg.slug)!)

        return {
            success: true,
            suggestion,
            suggestedGroupIds,
        }
    } catch (error) {
        if (error instanceof Error && error.message === 'Unauthorized') {
            return { success: false, error: 'Unauthorized' }
        }

        console.error('Error suggesting groups:', error)
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to suggest groups',
        }
    }
}
