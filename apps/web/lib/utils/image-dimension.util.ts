/**
 * Image Dimension Utility
 *
 * Normalizes the width/height values that reach content components from MDX.
 * Attributes written as raw HTML (`<img width="1200">`) arrive as strings,
 * while JSX expressions (`<Figure width={1200} />`) arrive as numbers.
 */

/**
 * Default rendered width for content images that ship no explicit dimensions.
 * Matches the max readable column width of the article layout.
 */
export const DEFAULT_CONTENT_IMAGE_WIDTH = 800

/**
 * Default rendered height for content images that ship no explicit dimensions.
 */
export const DEFAULT_CONTENT_IMAGE_HEIGHT = 400

/**
 * Responsive `sizes` hint for images rendered inside the article column.
 * Full viewport width on mobile, capped at the content column on desktop.
 */
export const CONTENT_IMAGE_SIZES = '(max-width: 768px) 100vw, 800px'

/**
 * Converts an MDX-supplied dimension to a positive integer.
 *
 * @param value - Raw attribute value (number, numeric string or undefined)
 * @param fallback - Dimension used when the value is missing or unusable
 * @returns A positive integer suitable for next/image
 */
export function toImageDimension(value: unknown, fallback: number): number {
    if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
        return Math.round(value)
    }

    if (typeof value === 'string') {
        const parsed = Number.parseInt(value, 10)
        if (Number.isFinite(parsed) && parsed > 0) {
            return parsed
        }
    }

    return fallback
}
