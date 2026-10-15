/**
 * The integration points for /lp/dr-karlinsky, Dr. Karlinsky's Instagram
 * bio-link page (#332): paths, how its leads are tagged, and the event names.
 * No copy, so client components can import it without pulling either copy
 * deck into the browser bundle.
 *
 * Her bio link is `/drk` (`next.config.mjs`), a temporary redirect here with
 * `utm_source=doctor&utm_medium=dr-karlinsky&utm_campaign=ig-bio`. The UTMs
 * matter: Instagram adds an fbclid to every bio-link tap, and without a
 * `utm_source` the lead would be filed as paid Meta.
 */

import type { ContactSource } from '@/lib/types/forms/contact-form.type'

import type { DrkHeroArm } from './drk-hero-variant'

export const DRK_PAGE_PATH = '/lp/dr-karlinsky'

/** Contains `thank-you`, which is what GTM's lead conversion tags fire on. */
export const DRK_THANK_YOU_PATH = `${DRK_PAGE_PATH}/thank-you`

/** The hero form's id. Every CTA on the page scrolls to it and focuses it. */
export const DRK_FORM_ID = 'drk-request'

/** The hero section, which the sticky CTA watches. */
export const DRK_HERO_ID = 'drk-hero'

/**
 * How her leads are told apart in `contact_submission`. Mirrors
 * `CONTACT_SOURCES.DR_KARLINSKY_IG`; written out rather than imported
 * because that module carries zod and libphonenumber, which this page's
 * client code otherwise never needs.
 */
export const DRK_SOURCE = 'dr-karlinsky-ig' satisfies ContactSource

/** `form_name` on the lead funnel events. */
export const DRK_FORM_NAME = 'dr_karlinsky_ig_form'

/**
 * The page's version. Bump it when the page changes enough to read before
 * and after apart. v1 (14 Oct 2026): the whole form on the phone's first
 * screen, with starting prices. v2: financing instead of prices, and the
 * hero under an A/B test between two new heroes, `arch` and `pick`
 * (`drk-hero-variant.ts`); v1's hero is not in it.
 */
export const DRK_PAGE_VERSION = 'drk-ig-v2'

/**
 * Stored on the lead (`page_variant`, sent to n8n too) and on every event:
 * the version and the hero arm, `drk-ig-v2-arch` or `drk-ig-v2-pick`.
 */
export function drkPageVariant(arm: DrkHeroArm): string {
    return `${DRK_PAGE_VERSION}-${arm}`
}

/** Stored on the lead (`form_variant`): the one-screen form. */
export const DRK_FORM_VARIANT = 'form'

/** Read by the thank-you page to greet the visitor and ask its questions. */
export const DRK_LEAD_STORAGE_KEY = 'drk_lead'

/** The page's own dataLayer events (GTM). */
export const DRK_EVENTS = {
    step: 'drk_step',
    attempt: 'drk_lead_attempt',
    submitted: 'drk_lead_submitted',
    videoOpen: 'drk_video_open',
    videoProgress: 'drk_video_progress',
    videoCta: 'drk_video_cta',
    videoError: 'drk_video_error',
    /** Once per page view, with the hero arm: the test's denominator. */
    view: 'drk_view',
    /** A section was seen (40% on screen), once per page view. */
    sectionView: 'drk_section_view',
    /** How far down the page the visitor got: 25 / 50 / 75 / 100 %. */
    scroll: 'drk_scroll',
    /** Any `data-cta` button or link: the hero, sticky and closing buttons, calls. */
    cta: 'drk_cta',
    /** A question opened in "Straight answers". */
    faqOpen: 'drk_faq_open',
} as const

/** Fills `{key}` placeholders in a copy string. */
export { fill } from '@/components/shared/consult-chat/consult-chat.util'

/** "0:46" from 46 seconds. */
export function formatDuration(seconds: number): string {
    const whole = Math.max(0, Math.round(seconds))
    return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`
}
