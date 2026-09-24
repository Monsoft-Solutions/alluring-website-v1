import {
    getFeaturedPromotionForModal,
    getRemainingDays,
} from '@/lib/queries/promotion.query'

import type { LeadPopupPromotion } from './lead-popup.types'
import { LeadPopups } from './lead-popups.component'

/**
 * LeadPopupsWrapper
 *
 * Server component for the root layout: reads the highest-priority active
 * promotion with its modal switched on and hands the client shim only what
 * the popup shows. With no such promotion the popup is the text-consultation
 * request.
 */
export async function LeadPopupsWrapper() {
    const promotion = await getFeaturedPromotionForModal()
    const delaySeconds = promotion?.modalDelaySeconds ?? null

    const live: LeadPopupPromotion | null =
        promotion && delaySeconds !== null
            ? {
                  id: promotion.id,
                  title: promotion.title,
                  excerpt: promotion.excerpt,
                  imageUrl: promotion.imageUrl,
                  imageAlt: promotion.imageAlt,
                  daysRemaining: getRemainingDays(promotion),
                  delaySeconds,
              }
            : null

    return <LeadPopups promotion={live} />
}
