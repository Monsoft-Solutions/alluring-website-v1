/**
 * Utility for inserting generated inline images into the TipTap editor
 *
 * @module @/components/blog/editor/insert-generated-inline-images
 */
import type { Editor } from '@tiptap/react'
import type { GeneratedInlineImage } from '@workspace/ai'

/**
 * Strip markdown syntax from text for accurate searching in parsed ProseMirror content
 */
function stripMarkdown(text: string): string {
    return (
        text
            // Remove bold/italic markers
            .replace(/\*\*([^*]+)\*\*/g, '$1')
            .replace(/\*([^*]+)\*/g, '$1')
            .replace(/__([^_]+)__/g, '$1')
            .replace(/_([^_]+)_/g, '$1')
            // Remove link syntax [text](url) -> text
            .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
            // Remove inline code
            .replace(/`([^`]+)`/g, '$1')
            // Remove strikethrough
            .replace(/~~([^~]+)~~/g, '$1')
    )
}

/**
 * Insert generated inline images into the TipTap editor at their designated positions
 *
 * This function:
 * 1. Filters images to only those successfully generated
 * 2. Sorts by position in markdown (descending) to minimize position shifts
 * 3. Searches for each insertion marker in the current editor state
 * 4. Inserts images as new paragraphs after the marker text
 *
 * @param editor - TipTap editor instance
 * @param images - Array of generated inline images
 * @returns Number of images successfully inserted
 *
 * @example
 * ```typescript
 * const insertedCount = insertGeneratedInlineImages(editor, generatedImages)
 * console.log(`Inserted ${insertedCount} of ${generatedImages.length} images`)
 * ```
 */
export function insertGeneratedInlineImages(
    editor: Editor,
    images: GeneratedInlineImage[]
): number {
    // Filter successful images
    const successfulImages = images.filter(
        (img) => img.status === 'success' && img.imageUrl && img.insertAfterText
    )

    if (successfulImages.length === 0) {
        console.warn(
            '[insertGeneratedInlineImages] No successful images to insert'
        )
        return 0
    }

    // Sort by position in current markdown (descending - end to beginning)
    // This minimizes position shift issues when inserting
    const currentMarkdown = editor.getMarkdown()
    const sortedImages = [...successfulImages].sort((a, b) => {
        const posA = currentMarkdown.indexOf(a.insertAfterText)
        const posB = currentMarkdown.indexOf(b.insertAfterText)
        return posB - posA
    })

    // Insert each image one at a time, re-searching the document each time
    let insertedCount = 0
    for (const image of sortedImages) {
        if (!image.imageUrl || !image.insertAfterText) continue

        // Strip markdown from search text since ProseMirror textContent is plain text
        const searchText = stripMarkdown(image.insertAfterText)

        // Search in the CURRENT editor state (fresh for each iteration)
        let insertionPos = -1

        // Strategy: Search at block level using textContent (handles split text nodes)
        editor.state.doc.descendants((node, pos) => {
            if (insertionPos !== -1) return false

            if (node.isTextblock) {
                const blockText = node.textContent
                const markerIdx = blockText.indexOf(searchText)

                if (markerIdx !== -1) {
                    // Found the marker in this block's text content
                    // Calculate position: block start + 1 (for opening tag) + marker end position
                    insertionPos = pos + 1 + markerIdx + searchText.length
                    return false
                }
            }
            return true
        })

        if (insertionPos !== -1) {
            // Ensure position is within valid bounds
            const maxPos = editor.state.doc.content.size
            if (insertionPos > maxPos) {
                insertionPos = maxPos
            }

            // Insert image node after the found position
            editor
                .chain()
                .insertContentAt(insertionPos, [
                    { type: 'paragraph' },
                    {
                        type: 'image',
                        attrs: {
                            src: image.imageUrl,
                            alt: image.altText || 'Generated image',
                        },
                    },
                ])
                .run()
            insertedCount++
            console.log(
                `[insertGeneratedInlineImages] Inserted image ${insertedCount} at pos ${insertionPos}: "${searchText.slice(0, 30)}..."`
            )
        } else {
            console.warn(
                `[insertGeneratedInlineImages] Could not find marker: "${searchText.slice(0, 50)}..." (original: "${image.insertAfterText.slice(0, 50)}...")`
            )
        }
    }

    console.log(
        `[insertGeneratedInlineImages] Inserted ${insertedCount} of ${successfulImages.length} images`
    )
    return insertedCount
}
