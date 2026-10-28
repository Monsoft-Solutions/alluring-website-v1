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
    breastLiftFigure,
    breastLiftSources,
} from '@/lib/data/procedures/facts/breast-lift.facts'
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

import { BreastLiftAtAGlance } from './breast-lift-at-a-glance.component'
import { BreastLiftCandidate } from './breast-lift-candidate.component'
import { BreastLiftCost } from './breast-lift-cost.component'
import { breastLiftImages } from './breast-lift-page.constant'
import { BreastLiftProcedureSteps } from './breast-lift-procedure-steps.component'
import { BreastLiftRecovery } from './breast-lift-recovery.component'
import { BreastLiftSafety } from './breast-lift-safety.component'
import { BreastLiftSurgeon } from './breast-lift-surgeon.component'

/** Gallery items read for the results rail; the gallery link has the rest. */
const GALLERY_POOL = 24

/**
 * Reviews read to find the ones that mention a breast lift: all of them. The
 * query lists featured reviews first, and the ones that name a procedure can
 * sit far down that order (on 2026-09-30 one sat at position 71 of 83).
 */
const REVIEW_POOL = 500

/**
 * An honest caption: what the gallery records about the photo, no more. The
 * group holds a lift with implants and liposuction filed as a mommy
 * makeover (the 2026-09-30 asset audit), so the caption names what was
 * combined when the title or alt text says so.
 */
function captionOf(photo: GalleryMediaCard): string {
    const text = `${photo.title} ${photo.alt}`
    const implants =
        /implant|augment|aumento|silicon|saline/i.test(text) &&
        !/without implants|no implants/i.test(text)
    const lipo = /lipo/i.test(text)
    if (/tummy tuck|abdominoplast/i.test(text)) {
        return 'Before and after a breast lift with a tummy tuck'
    }
    if (implants && lipo) {
        return 'Before and after a breast lift with implants, with liposuction'
    }
    if (implants) return 'Before and after a breast lift with implants'
    if (/reduction|reducci[oó]n/i.test(text)) {
        return 'Before and after a breast lift with a reduction'
    }
    if (lipo) return 'Before and after a breast lift with liposuction'
    return 'Before and after a breast lift'
}

/**
 * Gallery files whose names credit another surgeon (2026-10-28 review: 7 of
 * the 9 breast-lift results photos are `…-breast-lift-lofman-0N-…`). The page
 * says Dr. Karlinsky performs every breast lift, so they stay off it until
 * the practice confirms who performed them and fixes the files in the admin.
 */
const CREDITED_ELSEWHERE = /lofman/i

function isCreditedElsewhere(...urls: string[]): boolean {
    return urls.some((url) => CREDITED_ELSEWHERE.test(url))
}

/**
 * The breast lift page body, registered for `breast-lift-miami`.
 *
 * The route keeps the metadata, the H1 text, the canonical URL and the
 * structured-data graph; this module lays out everything else, in the
 * 2026-09-30 brief's order
 * (`implementation-plans/2026-09-30-breast-lift-page-rebuild/README.md`):
 * real results straight after the hero and a two-field form after them,
 * then the four prices, because a lift alone or with implants decides what
 * she pays, then what a breast lift is and who it suits, then the page's
 * one dark band: the four incisions and the scar each leaves, how often a
 * lift goes wrong, and what Florida law and the FDA set.
 *
 * The page owns a lift with implants (augmentation-mastopexy); the breast
 * augmentation page owns implants alone and links here.
 *
 * Sections shared with other procedure pages come from
 * `components/procedures/module-kit/` and take this page's copy as props;
 * the breast-lift-only sections hold their own copy next to their markup.
 * Figures come from `breast-lift.facts.ts`; FAQs, the steps and the price
 * table come from the procedure data file, which the graph and the paid
 * landing page also read.
 *
 * Server components throughout. The client code is the before/after slider
 * (when the gallery has a pair), the results rail's two buttons, the
 * consultation form, rendered twice, and one `SectionViewTracker`. Motion is
 * CSS (`module-kit.css`).
 */
export async function BreastLiftPage({ procedure }: ProcedurePageModuleProps) {
    const [pairs, gallery, reviewData] = await Promise.all([
        // One pair leads the results section with its slider; a few are
        // fetched so one credited elsewhere can be skipped.
        getBeforeAfterPairsByProcedure(procedure.slug, 4),
        getGalleryMediaByProcedure(procedure.slug, GALLERY_POOL),
        getPublishedGoogleReviews(REVIEW_POOL),
    ])
    const pair = pairs.find(
        (p) => !isCreditedElsewhere(p.beforeImage.url, p.afterImage.url)
    )
    const photos = selectResultPhotos(
        gallery.media.filter((m) => !isCreditedElsewhere(m.url)),
        procedure.slug
    )

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
            startingAt={breastLiftFigure('price-lift')}
            priceNote={`A breast lift without implants; with implants from ${breastLiftFigure('price-lift-saline')}. Your surgeon confirms your price at consultation`}
            surgeonName={KARLINSKY_NAME}
            updatedOn={procedure.dateModified}
        />
    )

    return (
        <div className='breast-lift-page pm-page bg-stone-50 pb-[5.5rem] md:pb-0'>
            <ModuleStarSprite />
            <ModuleHero
                title={procedure.title}
                headingId='breast-lift-hero-heading'
                breadcrumb='Breast lift'
                lede={
                    <>
                        A breast lift raises breasts that have dropped after
                        pregnancy, nursing, weight loss or with age, by removing
                        loose skin and moving the nipple higher. It can be done
                        on its own or with implants. At Alluring, one surgeon
                        performs every breast lift: {KARLINSKY_NAME}.
                    </>
                }
                rating={rating}
                chips={[
                    { label: `Lift from ${breastLiftFigure('price-lift')}` },
                    { label: 'Financing available' },
                    { label: 'Hablamos español', lang: 'es' },
                ]}
                chipsLabel='Breast lift at Alluring in brief'
                image={breastLiftImages.hero}
                cardNote={`Every breast lift by ${KARLINSKY_SHORT_NAME}`}
            />
            <ModuleJumpNav links={jumpLinks} />

            <ModuleResults
                pair={pair}
                photos={photos}
                gallerySlug={gallery.groupSlug}
                question='Breast lift before and after: what do real results look like?'
                answer='These are photos of real Alluring patients, shared with their consent. Some had a breast lift on its own and some had it with implants or another procedure, as each caption says. Results differ from person to person, and ASPS says the final shape and position settle over the next few months.'
                railId='breast-lift-results-rail'
                railLabel='Breast lift before and after photos from the gallery'
                galleryLinkLabel='See every breast lift photo in the gallery'
                captionOf={captionOf}
            />
            <ModuleQuickQuote
                procedureSlug={procedure.slug}
                heading='Get your personal breast lift plan and price'
                className={hasResults ? undefined : 'pt-12 md:pt-24'}
            />

            <ModuleBand rail={rail('Breast lift at Alluring, key facts')}>
                {procedure.pricing && (
                    <BreastLiftCost pricing={procedure.pricing} />
                )}
                <BreastLiftAtAGlance />
                <BreastLiftCandidate />
            </ModuleBand>

            <BreastLiftSafety />

            <ModuleBand
                rail={rail('Breast lift at Alluring, key facts, repeated')}
            >
                <BreastLiftSurgeon />
                <BreastLiftProcedureSteps process={procedure.process ?? []} />
                <BreastLiftRecovery />
            </ModuleBand>

            <ModuleReviews
                reviews={reviews}
                procedureSlug={procedure.slug}
                named={{
                    question:
                        'What do breast lift patients say about Alluring?',
                    answer: "These reviews come from Alluring's public Google Business Profile, and each one is from a patient who mentions a breast lift in their own words, sometimes alongside another procedure. Reviews written in another language show Google's translation. You can read every review, and see the overall rating, on Google at any time.",
                }}
                mixedAnswer="These reviews come from Alluring's public Google Business Profile. Reviews that mention a breast lift appear first, followed by recent featured reviews from patients who had other procedures with us. You can read every review, and see the overall rating, on Google at any time."
            />
            <ModuleFaq
                faqs={procedure.faqs ?? []}
                heading='Breast lift questions, answered'
            />
            <ModuleBook
                procedureSlug={procedure.slug}
                question='How do I book a breast lift consultation in Miami?'
                answer='Send the form below or call us. A patient coordinator contacts you to set a time, and at the consultation your surgeon examines you, talks through your goals, tells you whether a lift alone or a lift with implants fits and confirms your price. If you go ahead, your surgery, pre-op and follow-up dates are confirmed in writing.'
            />
            <ModuleSources
                sources={breastLiftSources}
                answer="Every recovery, results and safety figure on this page, the Florida rules, the FDA's implant rules and the national average fee come from the sources below, checked in September 2026. Our own figures, the prices, are stated as ours. Your surgeon's instructions always come first, and they may differ from these general ranges."
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
