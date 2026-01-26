/**
 * Image Utility Functions
 *
 * Utility functions for working with images, including MIME type detection
 * for use in structured data schemas.
 */

/**
 * MIME type mapping for common image extensions
 */
const MIME_TYPE_MAP: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    gif: 'image/gif',
    svg: 'image/svg+xml',
    avif: 'image/avif',
    ico: 'image/x-icon',
    bmp: 'image/bmp',
    tiff: 'image/tiff',
    tif: 'image/tiff',
}

/**
 * Get the MIME type for an image based on its URL extension
 *
 * @param url - The image URL
 * @returns The MIME type string or undefined if not recognized
 *
 * @example
 * getImageMimeType('https://example.com/image.jpg') // 'image/jpeg'
 * getImageMimeType('https://example.com/photo.webp') // 'image/webp'
 * getImageMimeType('https://example.com/doc.pdf') // undefined
 */
export function getImageMimeType(url: string): string | undefined {
    // Handle URLs with query parameters
    const urlPath = url.split('?')[0] ?? url

    // Extract the file extension
    const extension = urlPath.split('.').pop()?.toLowerCase()

    if (!extension) {
        return undefined
    }

    return MIME_TYPE_MAP[extension]
}

/**
 * Check if a URL points to an image based on its extension
 *
 * @param url - The URL to check
 * @returns True if the URL appears to be an image
 */
export function isImageUrl(url: string): boolean {
    return getImageMimeType(url) !== undefined
}
