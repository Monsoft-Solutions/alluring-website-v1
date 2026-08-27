/**
 * Paginated Reviews
 *
 * Pages 2..N of the approved Google reviews. Page 1 lives at `/reviews`.
 *
 * A path segment rather than `/reviews?page=2` on purpose: reading
 * `searchParams` opts a route into dynamic rendering, and `/reviews` is served
 * from the prerender cache today. Every page in this set is prerendered by
 * {@link generateStaticParams}, so paginating costs nothing at request time.
 *
 * @module app/reviews/page/[page]
 */
import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'

import { ReviewsPageContent } from '@/components/reviews/reviews-page-content.component'
import {
    getPublishedGoogleReviewsPage,
    getReviewsPageCount,
} from '@/lib/queries/reviews/google-reviews.query'
import { buildReviewsMetadata } from '@/lib/seo/reviews-page'

/**
 * Pages added between builds (reviews sync continuously) still render on
 * demand; `parsePageParam` is what keeps that from serving a page that does
 * not exist.
 */
export const dynamicParams = true

type PageProps = {
    params: Promise<{ page: string }>
}

export async function generateStaticParams() {
    const totalPages = await getReviewsPageCount()

    // Page 1 is `/reviews`, so this set starts at 2.
    return Array.from({ length: Math.max(0, totalPages - 1) }, (_, i) => ({
        page: String(i + 2),
    }))
}

/**
 * Turn the route param into a page number, or `null` when it is not one.
 *
 * Rejects non-integers and anything out of range rather than clamping. The
 * query clamps because a caller may reasonably ask for "the last page"; a URL
 * may not, because `/reviews/page/99` clamped to the last page would serve
 * real content under a URL that should be a 404.
 */
function parsePageParam(raw: string, totalPages: number): number | null {
    if (!/^[1-9]\d*$/.test(raw)) return null

    const page = Number(raw)
    if (page > totalPages) return null

    return page
}

export async function generateMetadata({
    params,
}: PageProps): Promise<Metadata> {
    const { page: rawPage } = await params
    const totalPages = await getReviewsPageCount()
    const page = parsePageParam(rawPage, totalPages)

    if (page === null) return {}

    const { averageRating, totalCount } =
        await getPublishedGoogleReviewsPage(page)

    return buildReviewsMetadata({ averageRating, totalCount, page })
}

export default async function PaginatedReviewsPage({ params }: PageProps) {
    const { page: rawPage } = await params
    const totalPages = await getReviewsPageCount()
    const page = parsePageParam(rawPage, totalPages)

    if (page === null) notFound()

    // `/reviews/page/1` and `/reviews` would otherwise be the same twelve
    // reviews at two URLs.
    if (page === 1) redirect('/reviews')

    const data = await getPublishedGoogleReviewsPage(page)

    return <ReviewsPageContent data={data} />
}
