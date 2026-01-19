/**
 * Insert Inline Images Utility
 *
 * Utility for inserting generated inline images into markdown content.
 * Works from end to beginning to avoid position shifts.
 *
 * @module @admin/lib/utils/insert-inline-images
 */

import type { GeneratedInlineImage } from '@workspace/ai'

/**
 * Insert inline images into markdown content
 *
 * Inserts images after the specified text markers, working from
 * end to beginning to avoid position shifts.
 *
 * @param content - Original markdown content
 * @param images - Array of generated inline images with insertion markers
 * @returns Updated markdown content with images inserted
 */
export function insertInlineImagesIntoMarkdown(
    content: string,
    images: GeneratedInlineImage[]
): string {
    // Filter successful images with URLs and markers
    const successfulImages = images.filter(
        (img) => img.status === 'success' && img.imageUrl && img.insertAfterText
    )

    if (successfulImages.length === 0) return content

    // Sort by position (end to beginning) to avoid position shifts
    const sortedImages = [...successfulImages].sort((a, b) => {
        const posA = content.indexOf(a.insertAfterText)
        const posB = content.indexOf(b.insertAfterText)
        return posB - posA
    })

    let updatedContent = content

    for (const image of sortedImages) {
        if (!image.imageUrl || !image.insertAfterText) continue

        const insertPos = updatedContent.indexOf(image.insertAfterText)
        if (insertPos === -1) {
            console.warn(
                `[Insert Images] Could not find marker: "${image.insertAfterText.slice(0, 50)}..."`
            )
            continue
        }

        const insertPoint = insertPos + image.insertAfterText.length
        const imageMarkdown = `\n\n![${image.altText || 'Generated image'}](${image.imageUrl})\n\n`

        updatedContent =
            updatedContent.slice(0, insertPoint) +
            imageMarkdown +
            updatedContent.slice(insertPoint)
    }

    return updatedContent
}
