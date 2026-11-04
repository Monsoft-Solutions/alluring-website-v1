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
import { mommyMakeoverFigure } from '@/lib/data/procedures/facts/mommy-makeover.facts'
import { siteConfig } from '@/lib/data/site-config'
import {
    KARLINSKY_NAME,
    KARLINSKY_SHORT_NAME,
} from '@/lib/data/surgeons/karlinsky-credentials.constant'
import { getBeforeAfterPairsByProcedure } from '@/lib/queries/gallery/before-after.query'
import { getGalleryMediaByProcedures } from '@/lib/queries/gallery/procedure-galleries.query'
import { getPublishedGoogleReviews } from '@/lib/queries/reviews/google-reviews.query'
import type { GalleryMediaCard } from '@/lib/types/gallery/gallery-group.type'
import type { ProcedurePageModuleProps } from '@/lib/types/procedure-page-module.type'

import { MommyMakeoverCandidate } from './mommy-makeover-candidate.component'
import { MommyMakeoverCost } from './mommy-makeover-cost.component'
import {
    mommyMakeoverImages,
    mommyMakeoverPageSources,
    NAMES_ANOTHER_SURGEON,
    NOT_A_RESULT,
    RAIL_SKIP_SLUGS,
    RELATED_REVIEW_SLUGS,
    RESULT_GROUPS,
} from './mommy-makeover-page.constant'
import { MommyMakeoverProcedureSteps } from './mommy-makeover-procedure-steps.component'
import { MommyMakeoverRecovery } from './mommy-makeover-recovery.component'
import { MommyMakeoverSafety } from './mommy-makeover-safety.component'
import { MommyMakeoverSpanish } from './mommy-makeover-spanish.component'
import { MommyMakeoverSurgeon } from './mommy-makeover-surgeon.component'
import { MommyMakeoverWhatIs } from './mommy-makeover-what-is.component'

/** Gallery items read for the results rail, once they name a mommy makeover. */
const GALLERY_POOL = 60

/**
 * Reviews read to find the one that mentions a mommy makeover: all of them. The
 * query lists featured reviews first, and the ones that name a procedure can
 * sit far down that order.
 */
const REVIEW_POOL = 500

/** The parts a photo's gallery record names, in the order a plan lists them. */
const RECORDED_PARTS = [
    { name: 'a tummy tuck', re: /tummy tuck/i },
    { name: 'a breast reduction', re: /breast reduction/i },
    { name: 'a breast lift', re: /breast lift/i },
    { name: 'liposuction', re: /liposuction/i },
]

/**
 * An honest caption: what the gallery records about the photo, no more. Most
 * records don't list the parts, and a plan isn't a fixed set of them, so a
 * caption names a part only when the record does.
 */
function captionOf(photo: GalleryMediaCard): string {
    const text = `${photo.title} ${photo.alt}`
    const parts = RECORDED_PARTS.filter((part) => part.re.test(text)).map(
        (part) => part.name
    )
    if (parts.length === 0) return 'Before and after a mommy makeover'
    const named =
        parts.length === 1
            ? parts[0]
            : `${parts.slice(0, -1).join(', ')} and ${parts.at(-1)}`
    return `Before and after a mommy makeover with ${named}`
}

/**
 * The mommy makeover page body, registered for `mommy-makeover-miami`.
 *
 * The route keeps the metadata, the H1 text, the canonical URL and the
 * structured-data graph; this module lays out everything else, in the order of
 * the 2026-11-03 brief: real results straight after the hero and a two-field
 * form after them, then the price of each part, because a mommy makeover is a
 * plan of parts and what she pays depends on which ones, then what it is and
 * who it suits, then the page's one dark band: one plan part by part, and what
 * each part adds to the risk.
 *
 * Sections shared with other procedure pages come from
 * `components/procedures/module-kit/` and take this page's copy as props; the
 * mommy-makeover-only sections hold their own copy next to their markup.
 * Figures come from `mommy-makeover.facts.ts`; FAQs, the steps and the price
 * tables come from the procedure data file, which the graph and the paid landing
 * page also read.
 *
 * Server components throughout. The client code is the before/after slider
 * (when the gallery has a pair), the results rail's two buttons, the
 * consultation form, rendered twice, and one `SectionViewTracker`. Motion is CSS
 * (`module-kit.css`).
 */
export async function MommyMakeoverPage({
    procedure,
}: ProcedurePageModuleProps) {
    const [pairs, gallery, reviewData] = await Promise.all([
        // One pair leads the results section with its slider.
        getBeforeAfterPairsByProcedure(procedure.slug, 1),
        getGalleryMediaByProcedures(RESULT_GROUPS, {
            limit: GALLERY_POOL,
            mentioning: procedure.slug,
        }),
        getPublishedGoogleReviews(REVIEW_POOL),
    ])
    const pair = pairs[0]
    const photos = selectResultPhotos(gallery.media, procedure.slug).filter(
        (photo) =>
            !NOT_A_RESULT.test(`${photo.title} ${photo.alt}`) &&
            !RAIL_SKIP_SLUGS.has(photo.slug)
    )

    // The synced Google Business Profile figure, falling back to the one
    // siteConfig keeps in step with it.
    const rating = {
        value:
            reviewData.averageRating ??
            Number.parseFloat(siteConfig.trustStats?.rating ?? '0'),
        count: reviewData.totalCount,
    }
    // Few reviews name a mommy makeover but many name its parts. A related
    // review doesn't name this procedure, so `ModuleReviews` uses its neutral
    // heading once one is shown.
    const reviews = selectProcedureReviews(
        reviewData.reviews.filter(
            (review) => !NAMES_ANOTHER_SURGEON.test(review.comment ?? '')
        ),
        procedure.slug,
        { relatedSlugs: RELATED_REVIEW_SLUGS }
    )
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

    // "Starting at $3,000" would read as the price of a whole plan, so the rail
    // says whose price it is.
    const rail = (label: string) => (
        <ModuleFactRail
            label={label}
            priceLabel='Mini tummy tuck from'
            startingAt={mommyMakeoverFigure('price-mini-tummy-tuck')}
            priceNote={`Breast augmentation from ${mommyMakeoverFigure('price-augmentation-saline')}, breast lift from ${mommyMakeoverFigure('price-lift')}. Your total depends on your plan, set after an exam`}
            surgeonName={KARLINSKY_NAME}
            updatedOn={procedure.dateModified}
        />
    )

    return (
        <div className='mommy-makeover-page pm-page bg-stone-50 pb-[5.5rem] md:pb-0'>
            <ModuleStarSprite />
            <ModuleHero
                title={procedure.title}
                headingId='mommy-makeover-hero-heading'
                breadcrumb='Mommy makeover'
                lede={
                    <>
                        A mommy makeover combines a tummy tuck with breast
                        surgery, often with liposuction, usually in one surgery.
                        At Alluring, one surgeon performs every mommy makeover:{' '}
                        {KARLINSKY_NAME}.
                    </>
                }
                rating={rating}
                chips={[
                    { label: 'Priced part by part' },
                    { label: 'Financing available' },
                    { label: 'Hablamos español', lang: 'es' },
                ]}
                chipsLabel='Mommy makeover at Alluring in brief'
                image={mommyMakeoverImages.hero}
                cardNote={`Every mommy makeover by ${KARLINSKY_SHORT_NAME}`}
            />
            <ModuleJumpNav links={jumpLinks} />

            <ModuleResults
                pair={pair}
                photos={photos}
                gallerySlug={gallery.groupSlug}
                question='Mommy makeover before and after: what do real results look like?'
                answer={`These are photos of real Alluring patients, shared with their consent. Each plan was different, so each caption says what the gallery records about it. Results differ from person to person, and Frank Campanile, MD, writing on the ASPS website, says the final result can take ${mommyMakeoverFigure('results-6-12-months', 1)} to a year to show.`}
                railId='mommy-makeover-results-rail'
                railLabel='Mommy makeover before and after photos from the gallery'
                galleryLinkLabel='See every mommy makeover photo and video in the gallery'
                captionOf={captionOf}
            />
            <ModuleQuickQuote
                procedureSlug={procedure.slug}
                heading='Get your personal mommy makeover plan and price'
                className={hasResults ? undefined : 'pt-12 md:pt-24'}
            />

            <ModuleBand rail={rail('Mommy makeover at Alluring, key facts')}>
                {procedure.pricing && (
                    <MommyMakeoverCost pricing={procedure.pricing} />
                )}
                <MommyMakeoverWhatIs />
                <MommyMakeoverCandidate />
            </ModuleBand>

            <MommyMakeoverSafety />

            <ModuleBand
                rail={rail('Mommy makeover at Alluring, key facts, repeated')}
            >
                <MommyMakeoverSurgeon />
                <MommyMakeoverProcedureSteps
                    process={procedure.process ?? []}
                />
                <MommyMakeoverRecovery />
            </ModuleBand>

            <ModuleReviews
                reviews={reviews}
                procedureSlug={procedure.slug}
                named={{
                    question:
                        'What do mommy makeover patients say about Alluring?',
                    answer: "These reviews come from Alluring's public Google Business Profile, and each one is from a patient who mentions a mommy makeover in their own words. Reviews written in another language show Google's translation. You can read every review, and see the overall rating, on Google at any time.",
                }}
                mixedAnswer="These reviews come from Alluring's public Google Business Profile. The review that mentions a mommy makeover appears first, followed by reviews from patients who had a tummy tuck, breast surgery or liposuction with us. Reviews written in another language show Google's translation. You can read every review on Google at any time."
            />
            <ModuleFaq
                faqs={procedure.faqs ?? []}
                heading='Mommy makeover questions, answered'
            />
            <MommyMakeoverSpanish />
            <ModuleBook
                procedureSlug={procedure.slug}
                question='How do I start, and where in Miami is Alluring?'
                answer={`Alluring is at ${siteConfig.contact.address} in ${siteConfig.contact.city}, Florida. Send the form below or call us, and a patient coordinator contacts you to set a time. At the consultation your surgeon examines you, tells you which parts your plan needs and confirms your price. If you go ahead, your surgery, pre-op and follow-up dates are confirmed in writing.`}
            />
            <ModuleSources
                sources={mommyMakeoverPageSources}
                answer="Every recovery, results and safety figure on this page, the Florida rules and the national average fees come from the sources below, checked in November 2026. Our own figures, the prices, are stated as ours. Your surgeon's instructions always come first, and they may differ from these general ranges."
                updatedOn={procedure.dateModified}
            />

            {/* Right padding keeps the bar clear of the chat launcher, which
                lives in a closed shadow root and cannot be moved from here. */}
            <StickyCtaBar className='pm-sticky-bar pr-[4.75rem]' />

            {/* `section_view` for every section with an id (results, pricing,
                safety, surgeon, recovery, reviews, faq, book and the page's
                own). The event carries the page's procedure from its URL
                (`lib/analytics/page-context.ts`). */}
            <SectionViewTracker />
        </div>
    )
}
