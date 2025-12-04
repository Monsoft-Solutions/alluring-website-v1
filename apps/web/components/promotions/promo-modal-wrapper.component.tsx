import {
    getFeaturedPromotionForModal,
    formatDiscount,
    getRemainingDays,
} from '@/lib/queries/promotion.query'

import { PromoModal } from './promo-modal.component'

/**
 * PromoModalWrapper Component
 *
 * Server component that fetches the highest-priority active promotion
 * with modal display enabled and passes it to the client-side modal.
 *
 * Should be placed in the root layout for site-wide display.
 */
export async function PromoModalWrapper() {
    const promotion = await getFeaturedPromotionForModal()

    if (!promotion || promotion.modalDelaySeconds === null) {
        return null
    }

    const discount = formatDiscount(promotion)
    const daysRemaining = getRemainingDays(promotion)

    return (
        <PromoModal
            promotion={{
                id: promotion.id,
                title: promotion.title,
                excerpt: promotion.excerpt,
                discount,
                imageUrl: promotion.imageUrl,
                imageAlt: promotion.imageAlt,
                ctaText: promotion.ctaText,
                daysRemaining,
                modalDelaySeconds: promotion.modalDelaySeconds,
            }}
        />
    )
}
