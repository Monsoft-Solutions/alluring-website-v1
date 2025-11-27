/**
 * Contact Constants for Seed Files
 *
 * Centralized contact information imported from site-config.
 * Provides formatted phone numbers for use in blog post seed files.
 */

/**
 * Phone number in display format with +1 prefix
 * Example: "+1 (786) 305-8649"
 */
export const PHONE_DISPLAY = '+1 (786) 305-8649'

/**
 * Phone number in display format without +1 prefix
 * Example: "(786) 305-8649"
 */
export function getPhoneDisplayWithoutPrefix(): string {
    return PHONE_DISPLAY.replace(/^\+1\s*/, '')
}

/**
 * Tel link with +1 prefix and no dashes
 * Example: "tel:+17863058649"
 */
export const PHONE_LINK = 'tel:+17863058649'

/**
 * Tel link without +1 prefix, with dashes
 * Example: "tel:786-305-8649"
 */
export function getPhoneLinkWithDashes(): string {
    // Remove tel: prefix, +1, and all non-digit characters
    const digits = '+17863058649'.replace(/[^\d]/g, '').replace(/^1/, '')
    // Format as tel:786-305-8649
    return `tel:${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`
}
