/**
 * Reviews Page
 *
 * The first page of approved Google reviews. Pages 2+ live at
 * `/reviews/page/[page]`; both render {@link ReviewsPageContent}.
 *
 * Features:
 * - SSR for SEO crawlability
 * - WebPage and Breadcrumb schemas for structured data
 * - Review JSON-LD for the reviews rendered on this page
 * - Hero section with rating stats
 * - Twelve reviews behind crawlable pagination
 * - Before & After gallery
 * - Surgeons section
 * - FAQ section
 * - Contact form
 */
import type { Metadata } from 'next'

import { ReviewsPageContent } from '@/components/reviews/reviews-page-content.component'
import { getPublishedGoogleReviewsPage } from '@/lib/queries/reviews/google-reviews.query'
import { buildReviewsMetadata } from '@/lib/seo/reviews-page'

export async function generateMetadata(): Promise<Metadata> {
    const { averageRating, totalCount } = await getPublishedGoogleReviewsPage(1)

    return buildReviewsMetadata({ averageRating, totalCount, page: 1 })
}

export default async function ReviewsPage() {
    const data = await getPublishedGoogleReviewsPage(1)

    return <ReviewsPageContent data={data} />
}
