import {
    getFeaturedPromotion,
    formatDiscount,
} from '@/lib/queries/promotion.query'
import { AnnouncementBarClient } from './announcement-bar-client.component'

/**
 * AnnouncementBar Component
 *
 * Server component that fetches the highest priority active promotion
 * and renders it as a slim announcement bar at the top of the page.
 *
 * Design: Subtle, luxurious, and unobtrusive - complements the brand aesthetic.
 */
export async function AnnouncementBar() {
    const promotion = await getFeaturedPromotion()

    // Don't render if no active promotion
    if (!promotion) {
        return null
    }

    const link = '/miami-plastic-surgery-specials'
    const discount = formatDiscount(promotion)

    return (
        <AnnouncementBarClient
            promotionId={promotion.id}
            title={promotion.title}
            discount={discount}
            ctaText={promotion.ctaText}
            link={link}
        />
    )
}
