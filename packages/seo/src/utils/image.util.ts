/**
 * Image Metadata Utilities
 *
 * Framework-agnostic helpers to standardize image metadata used by social
 * previews (Open Graph, Twitter). Avoids coupling to Next.js Metadata types.
 */
import type { ImageMetadata } from '../config'
import { getAbsoluteUrl } from './url.util'

/**
 * Normalize an image input into ImageMetadata with absolute URL.
 */
export function generateImageMetadata(
    image: string | ImageMetadata
): ImageMetadata {
    if (typeof image === 'string') {
        return { url: getAbsoluteUrl(image), alt: '' }
    }

    const url = getAbsoluteUrl(image.url)
    const { alt = '', width, height, type } = image
    return { url, alt, width, height, type }
}
