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
import {
    breastAugmentationFigure as figure,
    breastAugmentationSources,
} from '@/lib/data/procedures/facts/breast-augmentation.facts'
import { siteConfig } from '@/lib/data/site-config'
import {
    KARLINSKY_NAME,
    KARLINSKY_SHORT_NAME,
} from '@/lib/data/surgeons/karlinsky-credentials.constant'
import { getBeforeAfterPairsByProcedure } from '@/lib/queries/gallery/before-after.query'
import { getGalleryMediaByProcedure } from '@/lib/queries/gallery/procedure-galleries.query'
import { getPublishedGoogleReviews } from '@/lib/queries/reviews/google-reviews.query'
import type { BeforeAfterPairCard } from '@/lib/types/gallery/before-after.type'
import type { GalleryMediaCard } from '@/lib/types/gallery/gallery-group.type'
import type { ProcedurePageModuleProps } from '@/lib/types/procedure-page-module.type'

import { BreastAugmentationAtAGlance } from './breast-augmentation-at-a-glance.component'
import { BreastAugmentationCost } from './breast-augmentation-cost.component'
import { BreastAugmentationImplants } from './breast-augmentation-implants.component'
import { breastAugmentationImages } from './breast-augmentation-page.constant'
import { BreastAugmentationPlacement } from './breast-augmentation-placement.component'
import { BreastAugmentationProcedureSteps } from './breast-augmentation-procedure-steps.component'
import { BreastAugmentationRecovery } from './breast-augmentation-recovery.component'
import { BreastAugmentationSafety } from './breast-augmentation-safety.component'
import { BreastAugmentationSize } from './breast-augmentation-size.component'
import { BreastAugmentationSurgeon } from './breast-augmentation-surgeon.component'

/** Gallery items read for the results rail; the gallery link has the rest. */
const GALLERY_POOL = 24

/**
 * Reviews read to find the ones that mention a breast augmentation: all of
 * them. The query lists featured reviews first, and the ones that name a
 * procedure can sit far down that order (positions 10 to 51 of 83 on
 * 2026-09-28).
 */
const REVIEW_POOL = 500

/**
 * The breast augmentation gallery group also holds Instagram posts that are
 * not before and after photos: a patient's selfie and a photo taken on the
 * operating table (the 2026-09-30 build review). The rail shows side-by-side
 * before and after photos only, as the liposuction page does, so every
 * caption below is true of its photo.
 */
function isBeforeAndAfter(photo: GalleryMediaCard): boolean {
    return BEFORE_AND_AFTER.test(photo.alt)
}

/**
 * Instagram posts whose images credit another surgeon. The gallery's one
 * before and after pair (Instagram post DS2h3qbjlra) carries the caption
 * "Breast Augmentation @dr.andrewlofman" on both images, on a page that
 * says Dr. Karlinsky performs every breast augmentation, so it stays off
 * this page until the practice removes it in the admin or confirms it.
 */
const CREDITED_ELSEWHERE = ['DS2h3qbjlra']

function isOurPair(pair: BeforeAfterPairCard): boolean {
    return ![pair.beforeImage.url, pair.afterImage.url].some((url) =>
        CREDITED_ELSEWHERE.some((code) => url.includes(code))
    )
}

/**
 * An honest caption: what the gallery records about the photo, no more.
 * When the gallery's title or alt text says another procedure was part of
 * the same surgery, the caption says so.
 */
function captionOf(photo: GalleryMediaCard): string {
    const text = `${photo.title} ${photo.alt}`
    if (/mommy makeover/i.test(text)) {
        return 'Before and after a mommy makeover that included breast augmentation'
    }
    if (/breast lift|mastopex|levantamiento de senos/i.test(text)) {
        return 'Before and after a breast lift with implants'
    }
    if (/tummy tuck|abdominoplast/i.test(text)) {
        return 'Before and after a breast augmentation with a tummy tuck'
    }
    if (/\bbbl\b|brazilian butt lift/i.test(text)) {
        return 'Before and after a breast augmentation with a BBL'
    }
    if (/lipo/i.test(text)) {
        return 'Before and after a breast augmentation with liposuction'
    }
    return 'Before and after a breast augmentation'
}

/**
 * The breast augmentation page body, registered for
 * `breast-augmentation-miami`.
 *
 * The route keeps the metadata, the H1 text, the canonical URL and the
 * structured-data graph; this module lays out everything else, in the
 * 2026-09-28 brief's order (https://claude.ai/artifact/6SsAr3a8Zp7mzWUK4G8x2q,
 * the "Breast augmentation" tab): real results straight after the hero and
 * a two-field form after them, then the price, because the two prices are
 * what she came to compare, then the two choices that decide it (saline or
 * silicone, and the size), then the page's one dark band: the next ten
 * years with implants, the FDA's rules and the makers' long-term studies.
 * The surgeon, the placement and incision, surgery day and recovery follow.
 *
 * Sections shared with other procedure pages come from
 * `components/procedures/module-kit/` and take this page's copy as props;
 * the breast-augmentation-only sections hold their own copy next to their
 * markup. Figures come from `breast-augmentation.facts.ts`; FAQs, the steps
 * and the price table come from the procedure data file, which the graph
 * and the paid landing page also read.
 *
 * Server components throughout. The client code is the before/after slider
 * (when the gallery has a pair), the results rail's two buttons, the
 * consultation form, rendered twice, and one `SectionViewTracker`. Motion is
 * CSS (`module-kit.css`).
 */
export async function BreastAugmentationPage({
    procedure,
}: ProcedurePageModuleProps) {
    const [pairs, gallery, reviewData] = await Promise.all([
        // One pair leads the results section with its slider; read a few
        // so one credited elsewhere can be skipped.
        getBeforeAfterPairsByProcedure(procedure.slug, 4),
        getGalleryMediaByProcedure(procedure.slug, GALLERY_POOL),
        getPublishedGoogleReviews(REVIEW_POOL),
    ])
    const pair = pairs.find(isOurPair)
    const photos = selectResultPhotos(gallery.media, procedure.slug).filter(
        (photo) =>
            isBeforeAndAfter(photo) &&
            !CREDITED_ELSEWHERE.some((code) => photo.url.includes(code))
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
        { label: 'Implants', href: '#implants' },
        { label: 'Safety', href: '#safety' },
        { label: 'Surgeon', href: '#surgeon' },
        { label: 'Recovery', href: '#recovery' },
        { label: 'FAQ', href: '#faq' },
    ]

    const rail = (label: string) => (
        <ModuleFactRail
            label={label}
            startingAt={figure('price-saline')}
            priceNote={`Saline implants; silicone implants from ${figure('price-silicone')}. Set for each patient after an exam`}
            surgeonName={KARLINSKY_NAME}
            updatedOn={procedure.dateModified}
        />
    )

    return (
        <div className='breast-augmentation-page pm-page bg-stone-50 pb-[5.5rem] md:pb-0'>
            <ModuleStarSprite />
            <ModuleHero
                title={procedure.title}
                headingId='breast-augmentation-hero-heading'
                breadcrumb='Breast augmentation'
                lede={
                    <>
                        Breast augmentation adds size and shape to the breasts
                        with saline or silicone implants. At Alluring, one
                        surgeon performs every breast augmentation:{' '}
                        {KARLINSKY_NAME}.
                    </>
                }
                rating={rating}
                chips={[
                    {
                        label: `Saline ${figure('price-saline')} · Silicone ${figure('price-silicone')}`,
                    },
                    { label: 'Financing available' },
                    { label: 'Hablamos español', lang: 'es' },
                ]}
                chipsLabel='Breast augmentation at Alluring in brief'
                image={breastAugmentationImages.hero}
                cardNote={`Every breast augmentation by ${KARLINSKY_SHORT_NAME}`}
            />
            <ModuleJumpNav links={jumpLinks} />

            <ModuleResults
                pair={pair}
                photos={photos}
                gallerySlug={gallery.groupSlug}
                question='Breast augmentation before and after: what do real results look like?'
                answer='These are photos of real Alluring patients, shared with their consent, each captioned with what the gallery records about it. Results differ from person to person, and ASPS says the final result can take a few weeks to show, as the swelling goes down and the skin stretches.'
                railId='breast-augmentation-results-rail'
                railLabel='Breast augmentation before and after photos from the gallery'
                galleryLinkLabel='See every breast augmentation photo and video in the gallery'
                captionOf={captionOf}
            />
            <ModuleQuickQuote
                procedureSlug={procedure.slug}
                heading='Get your personal breast augmentation plan and price'
                className={hasResults ? undefined : 'pt-12 md:pt-24'}
            />

            <ModuleBand
                rail={rail('Breast augmentation at Alluring, key facts')}
            >
                {procedure.pricing && (
                    <BreastAugmentationCost pricing={procedure.pricing} />
                )}
                <BreastAugmentationAtAGlance />
                <BreastAugmentationImplants />
                <BreastAugmentationSize />
            </ModuleBand>

            <BreastAugmentationSafety />

            <ModuleBand
                rail={rail(
                    'Breast augmentation at Alluring, key facts, repeated'
                )}
            >
                <BreastAugmentationSurgeon />
                <BreastAugmentationPlacement />
                <BreastAugmentationProcedureSteps
                    process={procedure.process ?? []}
                />
                <BreastAugmentationRecovery />
            </ModuleBand>

            <ModuleReviews
                reviews={reviews}
                procedureSlug={procedure.slug}
                named={{
                    question: 'What do breast augmentation patients say?',
                    answer: "These reviews come from Alluring's public Google Business Profile, and each one is from a patient who mentions a breast augmentation in their own words. Reviews written in another language show Google's translation. You can read every review, and see the overall rating, on Google at any time.",
                }}
                mixedAnswer="These reviews come from Alluring's public Google Business Profile. Reviews that mention a breast augmentation appear first, followed by recent featured reviews from patients who had other procedures with us. You can read every review, and see the overall rating, on Google at any time."
            />
            <ModuleFaq
                faqs={procedure.faqs ?? []}
                heading='Breast augmentation questions, answered'
            />
            <ModuleBook
                procedureSlug={procedure.slug}
                question='How do I book a breast augmentation consultation in Miami?'
                answer="Send the form below or call us. A patient coordinator contacts you to set a time. At the consultation your surgeon examines you, talks through the size and look you want, recommends an implant and placement, reviews the FDA's checklist and confirms your price. If you go ahead, your surgery, pre-op and follow-up dates are confirmed in writing."
            />
            <ModuleSources
                sources={breastAugmentationSources}
                answer="Every safety, recovery and implant figure on this page, the FDA's requirements and the national average fee come from the sources below, checked in September 2026. Our own figures, the prices, are stated as ours. Your surgeon's instructions always come first, and they may differ from these general ranges."
                updatedOn={procedure.dateModified}
            />

            {/* Right padding keeps the bar clear of the chat launcher, which
                lives in a closed shadow root and cannot be moved from here. */}
            <StickyCtaBar className='pm-sticky-bar pr-[4.75rem]' />

            {/* `section_view` for every section with an id (results,
                pricing, implants, size, safety, surgeon, placement,
                recovery, reviews, faq, book and the rest). The event carries
                the page's procedure from its URL
                (`lib/analytics/page-context.ts`). */}
            <SectionViewTracker />
        </div>
    )
}
