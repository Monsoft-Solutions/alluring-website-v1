/**
 * Seed Constants
 *
 * Centralized constants for seed data.
 * These values should match apps/web/lib/data/site-config.ts
 *
 * Note: This file exists in the db package because seed files cannot
 * directly import from apps/web due to package boundaries.
 */

/**
 * Contact phone number for display in content
 * Matches: siteConfig.contact.phoneDisplay
 */
export const CONTACT_PHONE_DISPLAY = '+1 (786) 305-8649'

/**
 * Contact phone number for tel: links (formatted without spaces/parentheses)
 * Matches: siteConfig.contact.phone (formatted for tel: links)
 */
export const CONTACT_PHONE_LINK = 'tel:+17863058649'

/**
 * Helper function to generate phone link from display format
 * Returns format suitable for markdown links: [text](tel:786-305-8649)
 */
export function getPhoneLink(): string {
    // Remove spaces, parentheses, and +1 prefix for tel: link
    return `tel:${CONTACT_PHONE_DISPLAY.replace(/[\s()+1-]/g, '')}`
}

/**
 * Helper function to get phone display text
 * Returns the formatted phone number for display in content
 */
export function getPhoneDisplay(): string {
    return CONTACT_PHONE_DISPLAY
}
