/**
 * Reviews Page SEO Helpers
 *
 * Shared by `/reviews` and `/reviews/page/[page]` so the two routes cannot
 * drift on copy, canonicals or prev/next.
 *
 * @module lib/seo/reviews-page
 */
import type { Metadata } from 'next'
import { getCanonicalUrl } from '@workspace/seo/utils'

import { siteConfig } from '@/lib/data/site-config'
import { seoConfig } from '@/lib/seo-config'
import { toNextMetadata } from '@/lib/seo/metadata'
import { env } from '@/env'

const siteUrl = env.NEXT_PUBLIC_SITE_URL ?? siteConfig.seo.siteUrl

/**
 * Path for a given page of reviews.
 *
 * Page 1 lives at `/reviews`, not `/reviews/page/1` — two URLs serving the
 * same twelve reviews is exactly the duplication canonicals exist to prevent.
 */
export function reviewsPagePath(page: number): string {
    return page <= 1 ? '/reviews' : `/reviews/page/${page}`
}

/**
 * Absolute URL for a given page of reviews.
 *
 * Shares `getCanonicalUrl` with {@link buildReviewsMetadata} so a page's
 * `rel="prev"`/`rel="next"` and its canonical resolve against the same origin.
 */
export function reviewsPageUrl(page: number): string {
    return getCanonicalUrl(reviewsPagePath(page))
}

/**
 * Title and description for the reviews page.
 *
 * Both quote a rating and a review count, so they are built from the same
 * synced Google figures the page renders in its AggregateRating schema rather
 * than hardcoded. They previously claimed "4.9 stars / 100+ reviews" against a
 * live profile of 4.7 across 81 — a number a reader can check in one click.
 */
export function buildReviewsCopy(
    averageRating: number | null,
    totalCount: number,
    page = 1
) {
    const hasFigures = averageRating !== null && totalCount > 0
    const pageSuffix = page > 1 ? ` - Page ${page}` : ''

    const title = hasFigures
        ? `Patient Reviews | ${averageRating.toFixed(1)} Stars | Alluring Plastic Surgery${pageSuffix}`
        : `Patient Reviews | Alluring Plastic Surgery Miami${pageSuffix}`

    const description = hasFigures
        ? `Read real Google reviews from our patients. ${averageRating.toFixed(1)} stars across ${totalCount} reviews. See why patients trust Alluring Plastic Surgery for BBL, breast augmentation and more.`
        : 'Read real Google reviews from our patients. See why patients trust Alluring Plastic Surgery for BBL, breast augmentation and mommy makeover.'

    return { title, description }
}

type ReviewsMetadataInput = {
    readonly averageRating: number | null
    readonly totalCount: number
    readonly page: number
}

/**
 * Metadata for one page of reviews.
 *
 * Every page is indexable on purpose: paginating exists to shrink the document,
 * not to hide 63 reviews of first-party content from search. Each page carries
 * its own canonical so the set reads as a sequence rather than as
 * near-duplicates.
 *
 * `rel="prev"`/`rel="next"` are deliberately **not** set here — Next's
 * `alternates` has no such fields and silently drops them. They are rendered as
 * real `<link>` elements by `PaginationLinks` instead.
 */
export function buildReviewsMetadata({
    averageRating,
    totalCount,
    page,
}: ReviewsMetadataInput): Metadata {
    const { title, description } = buildReviewsCopy(
        averageRating,
        totalCount,
        page
    )

    const pageUrl = reviewsPageUrl(page)

    return toNextMetadata(seoConfig, {
        title,
        description,

        openGraph: {
            type: 'website',
            url: pageUrl,
            title,
            description,
            siteName: siteConfig.business.name,
            images: [
                {
                    url: `${siteUrl}/og-image.jpg`,
                    width: 1200,
                    height: 630,
                    alt: `${siteConfig.business.name} - Patient Reviews`,
                },
            ],
        },

        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [`${siteUrl}/og-image.jpg`],
        },

        // Carried over verbatim from the pre-pagination page so the rendered
        // robots/googlebot directives are byte-identical to what production
        // serves today. `toNextMetadata` merges shallowly: dropping the
        // explicit `googleBot` block lets the base config's version through,
        // which differs whenever NEXT_PUBLIC_ALLOW_CRAWLING is off.
        robots: {
            index: true,
            follow: true,
            googleBot: {
                index: true,
                follow: true,
                'max-video-preview': -1,
                'max-image-preview': 'large',
                'max-snippet': -1,
            },
        },

        alternates: { canonical: pageUrl },
    })
}
