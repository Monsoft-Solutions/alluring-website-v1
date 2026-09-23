/**
 * The integration points for /landing/melissa-juvier — paths, the lead
 * source and the images — kept free of copy so the client components can
 * import them without pulling either copy deck into the browser bundle.
 */

import type { ContactSource } from '@/lib/types/forms/contact-form.type'

export const MJ_PAGE_PATH = '/landing/melissa-juvier'
export const MJ_THANK_YOU_PATH = `${MJ_PAGE_PATH}/thank-you`

/** Anchor of the chat form. Every CTA on the page points here. */
export const MJ_CHAT_ID = 'message-melissa'

/**
 * How her leads are told apart in `contact_submission`. Mirrors
 * `CONTACT_SOURCES.MELISSA_JUVIER_LANDING`; written out rather than imported
 * because that module carries zod and libphonenumber, which this page's
 * client code otherwise never needs.
 */
export const MJ_SOURCE = 'melissa-juvier-landing' satisfies ContactSource

/** Read by the thank-you page to greet the visitor by name. */
export const MJ_LEAD_STORAGE_KEY = 'mj_lead'

export const MJ_PORTRAIT = {
    src: '/images/team/melissa-juvier.webp',
    width: 1320,
    height: 2346,
} as const

export const MJ_AVATAR = {
    src: '/images/team/melissa-juvier-avatar.webp',
    width: 240,
    height: 240,
} as const

/** Fills `{key}` placeholders in a copy string. */
export function fill(template: string, values: Record<string, string>): string {
    return template.replace(/\{(\w+)\}/g, (match, key: string) =>
        key in values ? (values[key] ?? match) : match
    )
}
