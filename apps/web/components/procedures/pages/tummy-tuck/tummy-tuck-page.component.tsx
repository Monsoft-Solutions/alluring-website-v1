import '@/components/procedures/module-kit/module-kit.css'

import { SectionViewTracker } from '@/components/analytics/section-view-tracker.component'
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
import {
    tummyTuckFigure,
    tummyTuckSources,
} from '@/lib/data/procedures/facts/tummy-tuck.facts'
import { siteConfig } from '@/lib/data/site-config'
import {
    KARLINSKY_NAME,
    KARLINSKY_SHORT_NAME,
} from '@/lib/data/surgeons/karlinsky-credentials.constant'
import { getBeforeAfterPairsByProcedure } from '@/lib/queries/gallery/before-after.query'
import { getGalleryMediaByProcedure } from '@/lib/queries/gallery/procedure-galleries.query'
import { getPublishedGoogleReviews } from '@/lib/queries/reviews/google-reviews.query'
import type { GalleryMediaCard } from '@/lib/types/gallery/gallery-group.type'
import type { ProcedurePageModuleProps } from '@/lib/types/procedure-page-module.type'

import { TummyTuckAtAGlance } from './tummy-tuck-at-a-glance.component'
import { TummyTuckCandidate } from './tummy-tuck-candidate.component'
import { TummyTuckCost } from './tummy-tuck-cost.component'
import { tummyTuckImages } from './tummy-tuck-page.constant'
import { TummyTuckProcedureSteps } from './tummy-tuck-procedure-steps.component'
import { TummyTuckRecovery } from './tummy-tuck-recovery.component'
import { TummyTuckSafety } from './tummy-tuck-safety.component'
import { TummyTuckSurgeon } from './tummy-tuck-surgeon.component'

/** Gallery items read for the results rail; the gallery link has the rest. */
const GALLERY_POOL = 24

/**
 * Reviews read to find the ones that mention a tummy tuck: all of them. The
 * query lists featured reviews first, and the ones that name a procedure can
 * sit far down that order.
 */
const REVIEW_POOL = 500

/**
 * An honest caption: what the gallery records about the photo, no more.
 * Several tummy tuck photos come from Instagram posts that show a combined
 * surgery (the 2026-09-28 asset audit), so the caption names what was
 * combined when the gallery says so.
 */
function captionOf(photo: GalleryMediaCard): string {
    const text = `${photo.title} ${photo.alt}`
    if (/mommy makeover/i.test(text)) {
        return 'Before and after a mommy makeover that included a tummy tuck'
    }
    // Two of the group's Instagram posts: "Tummy tuck + reducción de
    // senos" and "A tummy tuck and breast reduction".
    if (/breast reduction|reducci[oó]n de senos/i.test(text)) {
        return 'Before and after a tummy tuck with a breast reduction'
    }
    if (/breast lift|levantamiento de senos/i.test(text)) {
        return 'Before and after a tummy tuck with a breast lift'
    }
    if (/breast augmentation|implant/i.test(text)) {
        return 'Before and after a tummy tuck with breast augmentation'
    }
    if (/\bbbl\b|brazilian butt lift/i.test(text)) {
        return 'Before and after a tummy tuck with a BBL'
    }
    if (/lipo/i.test(text)) {
        return 'Before and after a tummy tuck with liposuction'
    }
    return 'Before and after a tummy tuck'
}

/**
 * The tummy tuck page body, registered for `tummy-tuck-miami`.
 *
 * The route keeps the metadata, the H1 text, the canonical URL and the
 * structured-data graph; this module lays out everything else, in the
 * 2026-09-28 brief's order (https://claude.ai/artifact/6SsAr3a8Zp7mzWUK4G8x2q,
 * the "Tummy tuck" tab): real results straight after the hero and a
 * two-field form after them, then the price by type, because which tummy
 * tuck she needs decides what she pays, then what a tummy tuck is and who
 * it suits, then the page's one dark band: what the surgery repairs, how
 * often it goes wrong and what Florida law sets for office surgery.
 *
 * Sections shared with other procedure pages come from
 * `components/procedures/module-kit/` and take this page's copy as props;
 * the tummy-tuck-only sections hold their own copy next to their markup.
 * Figures come from `tummy-tuck.facts.ts`; FAQs, the steps and the price
 * table come from the procedure data file, which the graph and the paid
 * landing page also read.
 *
 * Server components throughout. The client code is the before/after slider
 * (when the gallery has a pair), the results rail's two buttons, the
 * consultation form, rendered twice, and one `SectionViewTracker`. Motion is
 * CSS (`module-kit.css`).
 */
export async function TummyTuckPage({ procedure }: ProcedurePageModuleProps) {
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
            startingAt={tummyTuckFigure('price-mini')}
            priceNote={`Mini tummy tuck; a full tummy tuck from ${tummyTuckFigure('price-full')}. Set for each patient after an exam`}
            surgeonName={KARLINSKY_NAME}
            updatedOn={procedure.dateModified}
        />
    )

    return (
        <div className='tummy-tuck-page pm-page bg-stone-50 pb-[5.5rem] md:pb-0'>
            <ModuleStarSprite />
            <ModuleHero
                title={procedure.title}
                headingId='tummy-tuck-hero-heading'
                breadcrumb='Tummy tuck'
                lede={
                    <>
                        A tummy tuck removes loose skin and fat from the abdomen
                        and, when they have separated, repairs the muscles
                        underneath. At Alluring, one surgeon performs every
                        tummy tuck: {KARLINSKY_NAME}.
                    </>
                }
                rating={rating}
                chips={[
                    { label: `Mini from ${tummyTuckFigure('price-mini')}` },
                    { label: 'Financing available' },
                    { label: 'Hablamos español', lang: 'es' },
                ]}
                chipsLabel='Tummy tuck at Alluring in brief'
                image={tummyTuckImages.hero}
                cardNote={`Every tummy tuck by ${KARLINSKY_SHORT_NAME}`}
            />
            <ModuleJumpNav links={jumpLinks} />

            <ModuleResults
                pair={pair}
                photos={photos}
                gallerySlug={gallery.groupSlug}
                question='Tummy tuck before and after: what do real results look like?'
                answer={`These are photos of real Alluring patients, shared with their consent. Some had a tummy tuck on its own and some combined it with another procedure, as each caption says. Results differ from person to person, and the final result can take up to ${tummyTuckFigure('results-3-months')} to show, once the swelling has gone.`}
                railId='tummy-tuck-results-rail'
                railLabel='Tummy tuck before and after photos from the gallery'
                galleryLinkLabel='See every tummy tuck photo and video in the gallery'
                captionOf={captionOf}
            />
            <ModuleQuickQuote
                procedureSlug={procedure.slug}
                heading='Get your personal tummy tuck plan and price'
                className={hasResults ? undefined : 'pt-12 md:pt-24'}
            />

            <ModuleBand rail={rail('Tummy tuck at Alluring, key facts')}>
                {procedure.pricing && (
                    <TummyTuckCost pricing={procedure.pricing} />
                )}
                <TummyTuckAtAGlance />
                <TummyTuckCandidate />
            </ModuleBand>

            <TummyTuckSafety />

            <ModuleBand
                rail={rail('Tummy tuck at Alluring, key facts, repeated')}
            >
                <TummyTuckSurgeon />
                <TummyTuckProcedureSteps process={procedure.process ?? []} />
                <TummyTuckRecovery />
            </ModuleBand>

            <ModuleReviews
                reviews={reviews}
                procedureSlug={procedure.slug}
                named={{
                    question: 'What do tummy tuck patients say about Alluring?',
                    answer: "These reviews come from Alluring's public Google Business Profile, and each one is from a patient who mentions a tummy tuck in their own words, sometimes alongside another procedure. Reviews written in another language show Google's translation. You can read every review, and see the overall rating, on Google at any time.",
                }}
                mixedAnswer="These reviews come from Alluring's public Google Business Profile. Reviews that mention a tummy tuck appear first, followed by recent featured reviews from patients who had other procedures with us. You can read every review, and see the overall rating, on Google at any time."
            />
            <ModuleFaq
                faqs={procedure.faqs ?? []}
                heading='Tummy tuck questions, answered'
            />
            <ModuleBook
                procedureSlug={procedure.slug}
                question='How do I book a tummy tuck consultation in Miami?'
                answer='Send the form below or call us. A patient coordinator contacts you to set a time, and at the consultation your surgeon examines you, talks through your goals, tells you which tummy tuck fits and confirms your price. If you go ahead, your surgery, pre-op and follow-up dates are confirmed in writing.'
            />
            <ModuleSources
                sources={tummyTuckSources}
                answer="Every recovery, results and safety figure on this page, the Florida rules and the national average fee come from the sources below, checked in September 2026. Our own figures, the prices, are stated as ours. Your surgeon's instructions always come first, and they may differ from these general ranges."
                updatedOn={procedure.dateModified}
            />

            {/* Right padding keeps the bar clear of the chat launcher, which
                lives in a closed shadow root and cannot be moved from here. */}
            <StickyCtaBar className='pm-sticky-bar pr-[4.75rem]' />

            {/* `section_view` for every section with an id (results,
                pricing, safety, surgeon, recovery, reviews, faq, book and
                the page's own). The event carries the page's procedure
                from its URL (`lib/analytics/page-context.ts`). */}
            <SectionViewTracker />
        </div>
    )
}
