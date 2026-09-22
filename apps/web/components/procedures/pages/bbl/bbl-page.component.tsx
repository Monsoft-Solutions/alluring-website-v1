import './bbl-page.css'

import { StickyCtaBar } from '@/components/procedures/sections/sticky-cta-bar.component'
import { siteConfig } from '@/lib/data/site-config'
import { getBeforeAfterPairsByProcedure } from '@/lib/queries/gallery/before-after.query'
import { getGalleryMediaByProcedure } from '@/lib/queries/gallery/procedure-galleries.query'
import { getPublishedGoogleReviews } from '@/lib/queries/reviews/google-reviews.query'
import type { ProcedurePageModuleProps } from '@/lib/types/procedure-page-module.type'

import { BblAtAGlance } from './bbl-at-a-glance.component'
import { BblBook } from './bbl-book.component'
import { BblCost } from './bbl-cost.component'
import { BblFaq } from './bbl-faq.component'
import { BblHero } from './bbl-hero.component'
import { BblBand, BblJumpNav, type BblJumpLink } from './bbl-layout.component'
import { BblOptions } from './bbl-options.component'
import { BblProcedureSteps } from './bbl-procedure-steps.component'
import { BblQuickQuote } from './bbl-quick-quote.component'
import { BblRecoveryTimeline } from './bbl-recovery-timeline.component'
import { BblResults, selectBblPhotos } from './bbl-results.component'
import { BblReviews, selectBblReviews } from './bbl-reviews.component'
import { BblSafety } from './bbl-safety.component'
import { BblSources } from './bbl-sources.component'
import { BblStarSprite } from './bbl-stars.component'
import { BblSurgeon } from './bbl-surgeon.component'

/** Gallery items read for the results rail; the gallery link has the rest. */
const GALLERY_POOL = 24

/**
 * Reviews read to find the ones that mention a BBL: all of them. The query
 * lists featured reviews first, and on 2026-09-22 the three that name a BBL
 * sat at positions 58, 62 and 69 of 75, past the 40 this used to read, so
 * the page showed none of them. Only the three picked are rendered.
 */
const REVIEW_POOL = 500

/**
 * The BBL page body (#256), registered for `brazilian-butt-lift-bbl-miami`.
 *
 * The route keeps the metadata, the H1 text, the canonical URL and the
 * structured-data graph; this module lays out everything else. The order is
 * #253's with the 2026-09-22 review's changes: real results straight after
 * the hero, a two-field form after them, and the booking form ahead of the
 * source list. Each section holds its own copy next to its markup.
 * Figures come from `bbl.facts.ts`; FAQs and the price table come from the
 * procedure data file, which the graph and the paid landing page also read.
 *
 * Server components throughout. The client code is the before/after slider,
 * the results rail's two buttons and the consultation form, rendered twice
 * (compact after the results, in full at the end). Motion is CSS
 * (`bbl-page.css`).
 */
export async function BblPage({ procedure }: ProcedurePageModuleProps) {
    const [pairs, gallery, reviewData] = await Promise.all([
        // One pair leads the results section with its slider.
        getBeforeAfterPairsByProcedure(procedure.slug, 1),
        getGalleryMediaByProcedure(procedure.slug, GALLERY_POOL),
        getPublishedGoogleReviews(REVIEW_POOL),
    ])
    const pair = pairs[0]
    const photos = selectBblPhotos(gallery.media)

    // The synced Google Business Profile figure, falling back to the one
    // siteConfig keeps in step with it.
    const rating = {
        value:
            reviewData.averageRating ??
            Number.parseFloat(siteConfig.trustStats?.rating ?? '0'),
        count: reviewData.totalCount,
    }
    const reviews = selectBblReviews(reviewData.reviews)
    const hasResults = Boolean(pair) || photos.length > 0

    const jumpLinks: BblJumpLink[] = [
        ...(hasResults
            ? [{ label: 'Results', href: '#results' } as const]
            : []),
        { label: 'Cost', href: '#pricing' },
        { label: 'Safety', href: '#safety' },
        { label: 'Surgeon', href: '#surgeon' },
        { label: 'Recovery', href: '#recovery' },
        { label: 'FAQ', href: '#faq' },
    ]

    return (
        <div className='bbl-page bg-stone-50 pb-[5.5rem] md:pb-0'>
            <BblStarSprite />
            <BblHero title={procedure.title} rating={rating} />
            <BblJumpNav links={jumpLinks} />

            <BblResults
                pair={pair}
                photos={photos}
                gallerySlug={gallery.groupSlug}
            />
            <BblQuickQuote
                procedureSlug={procedure.slug}
                className={hasResults ? undefined : 'pt-12 md:pt-24'}
            />

            <BblBand
                railLabel='BBL at Alluring, key facts'
                updatedOn={procedure.dateModified}
            >
                <BblAtAGlance />
                {procedure.pricing && <BblCost pricing={procedure.pricing} />}
            </BblBand>

            <BblSafety />

            <BblBand
                railLabel='BBL at Alluring, key facts, repeated'
                updatedOn={procedure.dateModified}
            >
                <BblSurgeon />
                <BblOptions />
                <BblProcedureSteps />
                <BblRecoveryTimeline />
            </BblBand>

            <BblReviews reviews={reviews} />
            <BblFaq faqs={procedure.faqs ?? []} />
            <BblBook procedureSlug={procedure.slug} />
            <BblSources updatedOn={procedure.dateModified} />

            {/* Right padding keeps the bar clear of the chat launcher, which
                lives in a closed shadow root and cannot be moved from here. */}
            <StickyCtaBar className='bbl-sticky-bar pr-[4.75rem]' />
        </div>
    )
}
