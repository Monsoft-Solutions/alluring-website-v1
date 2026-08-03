/**
 * Homepage Direction — "Atelier"
 *
 * The chosen homepage direction, selected from a five-way art-direction
 * board. The alternatives and the earlier layout-only variants have been
 * deleted; this is the only candidate left.
 *
 * Sits under `/landing/*` so STANDALONE_ROUTES strips the global header
 * and footer: this direction ships its own chrome, and the current
 * stone/gold nav would break the palette on sight.
 *
 * ---------------------------------------------------------------------
 * PROMOTING THIS TO THE REAL HOMEPAGE
 * ---------------------------------------------------------------------
 * Not a straight file move. Three things have to happen together:
 *   1. Move the sections into `app/page.tsx` and carry over the structured
 *      data already there (WebPage, MedicalClinic, Physician, FAQ, HowTo,
 *      VideoObject, Breadcrumb) — none of it exists on this page, because
 *      a noindex preview does not need it.
 *   2. Replace the global header and footer site-wide with AtelierNav and
 *      AtelierFooter, or every other page will clash with the new
 *      homepage.
 *   3. Move the Fraunces/Archivo loaders into the root layout and retire
 *      Playfair/Lato.
 * Until then this stays `noindex` so it never competes with `/`.
 * ---------------------------------------------------------------------
 *
 * ---------------------------------------------------------------------
 * THESIS
 * ---------------------------------------------------------------------
 * Every plastic surgery practice in Miami looks the same — black, gold,
 * serif, glassmorphism. Sameness is invisibility. This direction abandons
 * that palette entirely for clay, terracotta and blush, and swaps the
 * clinical register for a human one.
 *
 * The design argument and the copy argument are the same argument: this is
 * a practice that tells you the truth, including that the first week
 * hurts and that you might decide not to do it. Warmth is not decoration
 * here, it is the positioning.
 *
 * Signature form: the arch, in the hero and on each surgeon portrait.
 * Repetition is what makes it read as a system rather than a colour
 * choice. It is deliberately NOT used on the before/after results — an
 * arch mask crops the tops off both halves of a clinical pair.
 *
 * Type: Fraunces (soft, characterful serif) for headings, Archivo for
 * everything else. Both loaded here rather than in the root layout so
 * production pages never pay for them.
 */
import type { Metadata } from 'next'
import { Archivo, Fraunces } from 'next/font/google'

import { AtelierClose } from '@/components/home-variants/atelier/atelier-close.component'
import {
    AtelierFooter,
    AtelierNav,
} from '@/components/home-variants/atelier/atelier-chrome.component'
import { AtelierHero } from '@/components/home-variants/atelier/atelier-hero.component'
import { AtelierPricing } from '@/components/home-variants/atelier/atelier-pricing.component'
import { AtelierProcedures } from '@/components/home-variants/atelier/atelier-procedures.component'
import { AtelierResults } from '@/components/home-variants/atelier/atelier-results.component'
import { AtelierSurgeons } from '@/components/home-variants/atelier/atelier-surgeons.component'
import { AtelierVoices } from '@/components/home-variants/atelier/atelier-voices.component'
import { AtelierWorries } from '@/components/home-variants/atelier/atelier-worries.component'
import { getPublishedGoogleReviews } from '@/lib/queries/reviews/google-reviews.query'

const fraunces = Fraunces({
    subsets: ['latin'],
    style: ['normal', 'italic'],
    variable: '--font-fraunces',
    display: 'swap',
})

const archivo = Archivo({
    subsets: ['latin'],
    variable: '--font-archivo',
    display: 'swap',
})

export const metadata: Metadata = {
    title: 'Atelier — Homepage Direction | Internal Preview',
    description:
        'Warm, human homepage direction for Alluring Plastic Surgery. Internal preview only.',
    robots: { index: false, follow: false, nocache: true },
}

export default async function AtelierHomePage() {
    const { reviews, averageRating, totalCount } =
        await getPublishedGoogleReviews(6)

    return (
        // Archivo is the page default so body copy inherits it; headings
        // opt into Fraunces explicitly. Saves repeating the font utility
        // on every paragraph in every section.
        <div
            className={`${fraunces.variable} ${archivo.variable} bg-[#F6EDE4] font-[family-name:var(--font-archivo)] antialiased`}
        >
            <AtelierNav />

            {/* Hero carries the primary form — the ask is in the first
                viewport on desktop and one short scroll on mobile. */}
            <AtelierHero />

            {/* What we do, in the visitor's language before the clinical
                name. */}
            <AtelierProcedures />

            {/* Proof: real patients, then real reviews. */}
            <AtelierResults />
            <AtelierVoices
                reviews={reviews}
                averageRating={averageRating}
                totalCount={totalCount}
            />

            {/* Price stated openly, framed as removing an obstacle. */}
            <AtelierPricing />

            {/* Who operates. */}
            <AtelierSurgeons />

            {/* Objections, conceding real limits. */}
            <AtelierWorries />

            {/* Soft second capture. */}
            <AtelierClose />

            <AtelierFooter />
        </div>
    )
}
