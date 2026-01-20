/**
 * Inline Image Types for Blog Post Editor
 *
 * Re-exports from @workspace/ai for admin app usage.
 * Single source of truth is in the AI package.
 */

import {
    INLINE_IMAGE_TYPES as AI_INLINE_IMAGE_TYPES,
    getInlineImageTypeById,
    getInlineImageTypeGuidelines,
    PHOTO_STYLES as AI_PHOTO_STYLES,
    getPhotoStyleById,
    type InlineImageTypeId as AIInlineImageTypeId,
    type InlineImageTypeDefinition,
    type PhotoStyleId as AIPhotoStyleId,
    type PhotoStyleDefinition,
} from '@workspace/ai'

/**
 * Inline image types - re-exported from @workspace/ai
 */
export const INLINE_IMAGE_TYPES = AI_INLINE_IMAGE_TYPES

export type InlineImageTypeId = AIInlineImageTypeId

export type InlineImageType = InlineImageTypeDefinition

/**
 * Get image type configuration by ID
 */
export function getInlineImageType(
    id: InlineImageTypeId
): InlineImageType | undefined {
    return getInlineImageTypeById(id)
}

/**
 * Get prompt guidelines for a specific image type
 */
export function getPromptGuidelines(id: InlineImageTypeId): string {
    return getInlineImageTypeGuidelines(id)
}

/**
 * Photo style definitions for photo-type images
 *
 * These sub-types allow for varying the style of photorealistic images
 * based on content context (results showcase, lifestyle, or medical explanations).
 */
export const PHOTO_STYLES = AI_PHOTO_STYLES

export type PhotoStyleId = AIPhotoStyleId

export type PhotoStyle = PhotoStyleDefinition

/**
 * Get photo style configuration by ID
 */
export function getPhotoStyle(id: PhotoStyleId): PhotoStyle | undefined {
    return getPhotoStyleById(id)
}

/**
 * Get prompt guidelines for a specific photo style
 */
export function getPhotoStyleGuidelines(id: PhotoStyleId): string {
    const photoStyle = getPhotoStyle(id)
    return photoStyle?.promptGuidelines || ''
}
