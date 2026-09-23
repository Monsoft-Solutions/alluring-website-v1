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
import { lipoFigure, lipoSources } from '@/lib/data/procedures/facts/lipo.facts'
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

import { LipoAreas } from './lipo-areas.component'
import { LipoAtAGlance } from './lipo-at-a-glance.component'
import { LipoCandidate } from './lipo-candidate.component'
import { LipoCost } from './lipo-cost.component'
import { lipoImages } from './lipo-page.constant'
import { LipoProcedureSteps } from './lipo-procedure-steps.component'
import { LipoRecovery } from './lipo-recovery.component'
import { LipoSafety } from './lipo-safety.component'
import { LipoSurgeon } from './lipo-surgeon.component'

/** Gallery items read for the results rail; the gallery link has the rest. */
const GALLERY_POOL = 24

/**
 * Reviews read to find the ones that mention liposuction: all of them. The
 * query lists featured reviews first, and the ones that name a procedure can
 * sit far down that order.
 */
const REVIEW_POOL = 500

/**
 * The liposuction gallery group also holds model photos and treatment-area
 * illustrations whose titles name liposuction (the 2026-09-22 asset audit).
 * They are not results, so the rail shows side-by-side before and after
 * photos only.
 */
const NOT_A_RESULT = /illustration|diagram|model shown|educational/i

function isBeforeAndAfter(photo: GalleryMediaCard): boolean {
    return (
        BEFORE_AND_AFTER.test(photo.alt) &&
        !NOT_A_RESULT.test(`${photo.title} ${photo.alt}`)
    )
}

/** An honest caption: what the gallery records about the photo, no more. */
function captionOf(photo: GalleryMediaCard): string {
    const text = `${photo.title} ${photo.alt}`
    if (/mommy makeover/i.test(text)) {
        return 'Before and after a mommy makeover that included liposuction'
    }
    if (/breast reduction/i.test(text)) {
        return 'Before and after a breast reduction with Lipo 360'
    }
    if (/etching/i.test(text)) {
        return 'Before and after liposuction with abdominal etching'
    }
    if (/lipo\s*360|360[\s-]degree/i.test(text)) {
        return 'Before and after Lipo 360'
    }
    return 'Before and after liposuction'
}

/**
 * The liposuction page body, registered for `liposuction-miami`.
 *
 * The route keeps the metadata, the H1 text, the canonical URL and the
 * structured-data graph; this module lays out everything else, in the
 * 2026-09-22 brief's order (https://claude.ai/artifact/6CEw99fZUyRV3hpY52W4xf):
 * real results straight after the hero and a two-field form after them, then
 * price and candidacy (cost is the cluster the page ranks best for, and "lipo
 * or tummy tuck?" decides whether she books at all), then the page's one dark
 * band: Florida's liposuction limits as a measuring scale.
 *
 * Sections shared with other procedure pages come from
 * `components/procedures/module-kit/` and take this page's copy as props;
 * the liposuction-only sections hold their own copy next to their markup.
 * Figures come from `lipo.facts.ts`; FAQs, the steps and the price table
 * come from the procedure data file, which the graph and the paid landing
 * page also read.
 *
 * Server components throughout. The client code is the before/after slider
 * (when the gallery has a pair), the results rail's two buttons and the
 * consultation form, rendered twice. Motion is CSS (`module-kit.css`).
 */
export async function LipoPage({ procedure }: ProcedurePageModuleProps) {
    const [pairs, gallery, reviewData] = await Promise.all([
        // One pair leads the results section with its slider.
        getBeforeAfterPairsByProcedure(procedure.slug, 1),
        getGalleryMediaByProcedure(procedure.slug, GALLERY_POOL),
        getPublishedGoogleReviews(REVIEW_POOL),
    ])
    const pair = pairs[0]
    const photos = selectResultPhotos(gallery.media, procedure.slug).filter(
        isBeforeAndAfter
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
        { label: 'Areas', href: '#areas' },
        { label: 'Recovery', href: '#recovery' },
        { label: 'FAQ', href: '#faq' },
    ]

    const rail = (label: string) => (
        <ModuleFactRail
            label={label}
            startingAt={lipoFigure('price-starting-at')}
            priceNote='Lipo 360, set for each patient after an exam'
            surgeonName={KARLINSKY_NAME}
            updatedOn={procedure.dateModified}
        />
    )

    return (
        <div className='lipo-page pm-page bg-stone-50 pb-[5.5rem] md:pb-0'>
            <ModuleStarSprite />
            <ModuleHero
                title={procedure.title}
                headingId='lipo-hero-heading'
                breadcrumb='Liposuction'
                lede={
                    <>
                        Liposuction removes stubborn fat that diet and exercise
                        haven&apos;t moved, to reshape an area rather than to
                        lose weight. At Alluring, one surgeon performs every
                        liposuction: {KARLINSKY_NAME}.
                    </>
                }
                rating={rating}
                chips={[
                    {
                        label: `Lipo 360 from ${lipoFigure('price-starting-at')}`,
                    },
                    { label: 'Financing available' },
                    { label: 'Hablamos español', lang: 'es' },
                ]}
                chipsLabel='Liposuction at Alluring in brief'
                image={lipoImages.hero}
                cardNote={`Every liposuction by ${KARLINSKY_SHORT_NAME}`}
            />
            <ModuleJumpNav links={jumpLinks} />

            <ModuleResults
                pair={pair}
                photos={photos}
                gallerySlug={gallery.groupSlug}
                question='Liposuction and Lipo 360 before and after: what do real results look like?'
                answer='These are photos of real Alluring patients, shared with their consent. Some had liposuction on its own and some combined it with another procedure, as each caption says. Results differ from person to person, and the final shape shows 3 to 6 months after surgery, once the swelling has gone.'
                railId='lipo-results-rail'
                railLabel='Liposuction before and after photos from the gallery'
                galleryLinkLabel='See every liposuction photo and video in the gallery'
                captionOf={captionOf}
            />
            <ModuleQuickQuote
                procedureSlug={procedure.slug}
                heading='Get your personal liposuction plan and price'
                className={hasResults ? undefined : 'pt-12 md:pt-24'}
            />

            <ModuleBand rail={rail('Liposuction at Alluring, key facts')}>
                <LipoAtAGlance />
                {procedure.pricing && <LipoCost pricing={procedure.pricing} />}
                <LipoCandidate />
            </ModuleBand>

            <LipoSafety />

            <ModuleBand
                rail={rail('Liposuction at Alluring, key facts, repeated')}
            >
                <LipoSurgeon />
                <LipoAreas />
                <LipoProcedureSteps process={procedure.process ?? []} />
                <LipoRecovery />
            </ModuleBand>

            <ModuleReviews
                reviews={reviews}
                procedureSlug={procedure.slug}
                named={{
                    question:
                        'What do liposuction patients say about Alluring?',
                    answer: "These reviews come from Alluring's public Google Business Profile, and each one is from a patient who mentions liposuction in their own words, often alongside another procedure. Reviews written in another language show Google's translation. You can read every review, and see the overall rating, on Google at any time.",
                }}
                mixedAnswer="These reviews come from Alluring's public Google Business Profile. Reviews that mention liposuction appear first, followed by recent featured reviews from patients who had other procedures with us. You can read every review, and see the overall rating, on Google at any time."
            />
            <ModuleFaq
                faqs={procedure.faqs ?? []}
                heading='Liposuction questions, answered'
            />
            <ModuleBook
                procedureSlug={procedure.slug}
                question='How do I book a liposuction consultation in Miami?'
                answer='Send the form below or call us. A patient coordinator contacts you to set a time, and at the consultation your surgeon examines you, talks through your goals, recommends which areas to treat and confirms your price. If you go ahead, your surgery, pre-op and follow-up dates are confirmed in writing.'
            />
            <ModuleSources
                sources={lipoSources}
                answer="Every recovery, results and safety figure on this page, the Florida limits and the national average fee come from the sources below, checked in September 2026. Our own figures, such as the price and surgery length, are stated as ours. Your surgeon's instructions always come first, and they may differ from these general ranges."
                updatedOn={procedure.dateModified}
            />

            {/* Right padding keeps the bar clear of the chat launcher, which
                lives in a closed shadow root and cannot be moved from here. */}
            <StickyCtaBar className='pm-sticky-bar pr-[4.75rem]' />
        </div>
    )
}
