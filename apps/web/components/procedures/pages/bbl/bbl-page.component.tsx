import '@/components/procedures/module-kit/module-kit.css'

import { ModuleBook } from '@/components/procedures/module-kit/module-book.component'
import { ModuleFaq } from '@/components/procedures/module-kit/module-faq.component'
import { ModuleHero } from '@/components/procedures/module-kit/module-hero.component'
import {
    ModuleBand,
    ModuleFactRail,
    ModuleJumpNav,
    type ModuleJumpLink,
} from '@/components/procedures/module-kit/module-layout.component'
import { ModuleQuickQuote } from '@/components/procedures/module-kit/module-quick-quote.component'
import {
    BEFORE_AND_AFTER,
    ModuleResults,
    selectResultPhotos,
} from '@/components/procedures/module-kit/module-results.component'
import {
    ModuleReviews,
    selectProcedureReviews,
} from '@/components/procedures/module-kit/module-reviews.component'
import { ModuleSources } from '@/components/procedures/module-kit/module-sources.component'
import { ModuleStarSprite } from '@/components/procedures/module-kit/module-stars.component'
import { StickyCtaBar } from '@/components/procedures/sections/sticky-cta-bar.component'
import { bblFigure, bblSources } from '@/lib/data/procedures/facts/bbl.facts'
import { siteConfig } from '@/lib/data/site-config'
import { KARLINSKY_NAME } from '@/lib/data/surgeons/karlinsky-credentials.constant'
import { getBeforeAfterPairsByProcedure } from '@/lib/queries/gallery/before-after.query'
import { getGalleryMediaByProcedure } from '@/lib/queries/gallery/procedure-galleries.query'
import { getPublishedGoogleReviews } from '@/lib/queries/reviews/google-reviews.query'
import type { GalleryMediaCard } from '@/lib/types/gallery/gallery-group.type'
import type { ProcedurePageModuleProps } from '@/lib/types/procedure-page-module.type'

import { BblAtAGlance } from './bbl-at-a-glance.component'
import { BblCost } from './bbl-cost.component'
import { BblOptions } from './bbl-options.component'
import { bblImages } from './bbl-page.constant'
import { BblProcedureSteps } from './bbl-procedure-steps.component'
import { BblRecoveryTimeline } from './bbl-recovery-timeline.component'
import { BblSafety } from './bbl-safety.component'
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

const WITH_ARMS = /\barms?\b[^.]*\blipo|\blipo\w*[^.]*\barms?\b/i

function captionOf(photo: GalleryMediaCard): string {
    const procedure = WITH_ARMS.test(`${photo.title} ${photo.alt}`)
        ? 'a BBL with arm liposuction'
        : 'a BBL'
    return BEFORE_AND_AFTER.test(photo.alt)
        ? `Before and after ${procedure}`
        : `After ${procedure}`
}

/**
 * The BBL page body (#256), registered for `brazilian-butt-lift-bbl-miami`.
 *
 * The route keeps the metadata, the H1 text, the canonical URL and the
 * structured-data graph; this module lays out everything else. The order is
 * #253's with the 2026-09-22 review's changes: real results straight after
 * the hero, a two-field form after them, and the booking form ahead of the
 * source list. Sections shared with other procedure pages come from
 * `components/procedures/module-kit/` and take the page's copy as props;
 * the BBL-only sections hold their own copy next to their markup.
 * Figures come from `bbl.facts.ts`; FAQs and the price table come from the
 * procedure data file, which the graph and the paid landing page also read.
 *
 * Server components throughout. The client code is the before/after slider,
 * the results rail's two buttons and the consultation form, rendered twice
 * (compact after the results, in full at the end). Motion is CSS
 * (`module-kit.css`).
 */
export async function BblPage({ procedure }: ProcedurePageModuleProps) {
    const [pairs, gallery, reviewData] = await Promise.all([
        // One pair leads the results section with its slider.
        getBeforeAfterPairsByProcedure(procedure.slug, 1),
        getGalleryMediaByProcedure(procedure.slug, GALLERY_POOL),
        getPublishedGoogleReviews(REVIEW_POOL),
    ])
    const pair = pairs[0]
    const photos = selectResultPhotos(gallery.media, procedure.slug)

    // The synced Google Business Profile figure, falling back to the one
    // siteConfig keeps in step with it.
    const rating = {
        value:
            reviewData.averageRating ??
            Number.parseFloat(siteConfig.trustStats?.rating ?? '0'),
        count: reviewData.totalCount,
    }
    const reviews = selectProcedureReviews(reviewData.reviews, procedure.slug)
    const hasResults = Boolean(pair) || photos.length > 0

    const jumpLinks: ModuleJumpLink[] = [
        ...(hasResults
            ? [{ label: 'Results', href: '#results' } as const]
            : []),
        { label: 'Cost', href: '#pricing' },
        { label: 'Safety', href: '#safety' },
        { label: 'Surgeon', href: '#surgeon' },
        { label: 'Recovery', href: '#recovery' },
        { label: 'FAQ', href: '#faq' },
    ]

    const rail = (label: string) => (
        <ModuleFactRail
            label={label}
            startingAt={bblFigure('price-starting-at')}
            priceNote={
                <>
                    Most patients {bblFigure('price-most-patients')}, set for
                    each patient
                </>
            }
            surgeonName={KARLINSKY_NAME}
            updatedOn={procedure.dateModified}
        />
    )

    return (
        <div className='bbl-page pm-page bg-stone-50 pb-[5.5rem] md:pb-0'>
            <ModuleStarSprite />
            <ModuleHero
                title={procedure.title}
                headingId='bbl-hero-heading'
                breadcrumb='BBL'
                lede={
                    <>
                        A BBL moves your own fat to your buttocks for more shape
                        and fullness, with no implants. At Alluring, one surgeon
                        performs every BBL: {KARLINSKY_NAME}, who places the fat
                        under the skin with ultrasound guidance, as Florida law
                        requires.
                    </>
                }
                rating={rating}
                // Surgery length and the law are in the lede and the fact
                // table; the chips answer the next two questions: can I pay
                // over time, and will someone speak my language.
                chips={[
                    { label: `Starting at ${bblFigure('price-starting-at')}` },
                    { label: 'Financing available' },
                    { label: 'Hablamos español', lang: 'es' },
                ]}
                chipsLabel='BBL at Alluring in brief'
                image={bblImages.hero}
                cardNote='Ultrasound-guided under Florida law'
            />
            <ModuleJumpNav links={jumpLinks} />

            <ModuleResults
                pair={pair}
                photos={photos}
                gallerySlug={gallery.groupSlug}
                question='BBL before and after: what do real results look like?'
                answer='These are photos of real Alluring patients, shared with their consent. Results differ from person to person, and your final shape shows 3 to 6 months after surgery, once swelling settles and the grafted fat that will survive has taken hold.'
                railId='bbl-results-rail'
                railLabel='BBL before and after photos from the gallery'
                galleryLinkLabel='See every BBL photo and video in the gallery'
                captionOf={captionOf}
            />
            <ModuleQuickQuote
                procedureSlug={procedure.slug}
                heading='Get your personal BBL plan and price'
                className={hasResults ? undefined : 'pt-12 md:pt-24'}
            />

            <ModuleBand rail={rail('BBL at Alluring, key facts')}>
                <BblAtAGlance />
                {procedure.pricing && <BblCost pricing={procedure.pricing} />}
            </ModuleBand>

            <BblSafety />

            <ModuleBand rail={rail('BBL at Alluring, key facts, repeated')}>
                <BblSurgeon />
                <BblOptions />
                <BblProcedureSteps />
                <BblRecoveryTimeline />
            </ModuleBand>

            <ModuleReviews
                reviews={reviews}
                procedureSlug={procedure.slug}
                named={{
                    question: 'What do BBL patients say about Alluring?',
                    answer: "These reviews come from Alluring's public Google Business Profile, and each one is from a patient who mentions a BBL in their own words. Reviews written in another language show Google's translation. You can read every review, and see the overall rating, on Google at any time.",
                }}
                mixedAnswer="These reviews come from Alluring's public Google Business Profile. Reviews that mention a BBL appear first, followed by recent featured reviews from patients who had other procedures with us. You can read every review, and see the overall rating, on Google at any time."
            />
            <ModuleFaq
                faqs={procedure.faqs ?? []}
                heading='BBL questions, answered'
            />
            <ModuleBook
                procedureSlug={procedure.slug}
                question='How do I book a BBL consultation in Miami?'
                answer='Send the form below or call us. A patient coordinator contacts you to set a time, and at the consultation your surgeon examines you, talks through your goals, recommends a type of BBL and confirms your price. If you go ahead, your surgery, pre-op and follow-up dates are confirmed in writing.'
            />
            <ModuleSources
                sources={bblSources}
                answer="Every recovery, results and safety figure on this page, and the national average cost, comes from the sources below, checked in September 2026. Where a figure is one surgeon's advice rather than a society's guidance, we say so. Your own surgeon's instructions always come first, and they may differ from these general ranges."
                updatedOn={procedure.dateModified}
            />

            {/* Right padding keeps the bar clear of the chat launcher, which
                lives in a closed shadow root and cannot be moved from here. */}
            <StickyCtaBar className='pm-sticky-bar pr-[4.75rem]' />
        </div>
    )
}
