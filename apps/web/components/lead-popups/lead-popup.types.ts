/**
 * Shapes shared by the lead popup's trigger shim and its lazily loaded
 * dialog.
 *
 * Lives in its own module so the shim, which the root layout mounts on every
 * route, can share them without importing the dialog's module graph — which
 * is the whole point of the split (issue #199).
 *
 * @module components/lead-popups/lead-popup.types
 */

/** The live promotion the popup offers, trimmed to what the dialog shows. */
export type LeadPopupPromotion = {
    readonly id: string
    readonly title: string
    /** Markdown, as authored in the admin. */
    readonly excerpt: string | null
    readonly imageUrl: string | null
    readonly imageAlt: string | null
    readonly daysRemaining: number | null
    /** Seconds on the site before the timed trigger opens the popup. */
    readonly delaySeconds: number
}

/**
 * What opened the popup:
 * - `exit_intent`: the pointer left through the top of the window (desktop);
 * - `scroll_up`: a quick flick back up after reading (touch screens, where
 *   there is no pointer to leave);
 * - `timer`: time on the site.
 */
export type LeadPopupTrigger = 'exit_intent' | 'scroll_up' | 'timer'

/**
 * Which popup it is. With a promotion live, the popup is the offer; without
 * one, it is the text-consultation request. `popup_name` in analytics keeps
 * the names the two separate popups reported before they were merged.
 */
export type LeadPopupKind = 'exit_intent' | 'promo_modal'
