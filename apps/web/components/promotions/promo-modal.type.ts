/**
 * Shape of the promotion the timed modal renders.
 *
 * Lives in its own module so the trigger shim and the lazily-loaded dialog
 * can share it without the shim importing the dialog's module graph — which
 * is the whole point of the split (issue #199).
 *
 * @module components/promotions/promo-modal.type
 */

export type PromoModalData = {
    id: string
    title: string
    excerpt: string | null
    discount: string | null
    imageUrl: string | null
    imageAlt: string | null
    ctaText: string
    daysRemaining: number | null
    modalDelaySeconds: number
}
