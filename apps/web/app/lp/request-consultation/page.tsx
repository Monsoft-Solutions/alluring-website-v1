/**
 * Google Ads landing page — free consultation.
 *
 * One page serves every ad group and both languages:
 *
 *   /lp/request-consultation                      general
 *   /lp/request-consultation?p=bbl                per ad group
 *   /lp/request-consultation?p=bbl&hl=es          Spanish campaigns
 *   /lp/request-consultation?s=financing          a sitelink's section first
 *   /lp/request-consultation?fv=card              force a form test arm (QA)
 *
 * Aliases (`lipo`, `mm`, `tt`, `breast`…) resolve in `lp-variants.ts`, `?s=`
 * sections in `lp-sections.ts`, and Google's `gclid` / `wbraid` / `gbraid` /
 * `utm_*` pass through untouched to the thank-you page.
 *
 * It lives under `/lp/*`, which `ConditionalLayout` treats as standalone: no
 * site header, no footer, no floating chrome. A paid landing page has one job,
 * and site navigation is a way out of it — so nothing on the page links to
 * the rest of the site either (#283).
 *
 * The before/after photographs past the curated five, the live Google rating
 * and the review rail are read here. They are cached queries, and a database
 * failure only drops them: the page never fails because of its proof.
 *
 * The page renders per request because the language and the headline are
 * resolved from the query string and Accept-Language on the server — the HTML
 * arrives already correct rather than flipping after hydration. The same goes
 * for the hero form: `middleware.ts` picks the visitor's test arm (#292) and
 * passes it in a request header, so the right form is in the first HTML.
 */

import type { Metadata } from 'next'
import { cookies, headers } from 'next/headers'

import { buildLpChat } from '@/components/landing-pages/request-consultation/lp-chat-copy'
import {
    LP_FORM_COOKIE,
    LP_FORM_HEADER,
    LP_FORM_QUERY,
    type LpFormVariant,
    toLpFormVariant,
} from '@/components/landing-pages/request-consultation/lp-form-variant'
import { LpLanding } from '@/components/landing-pages/request-consultation/lp-landing.component'
import { LP_COPY } from '@/components/landing-pages/request-consultation/lp-copy'
import {
    resolveLpLanguage,
    type ResolvedLpLanguage,
} from '@/components/landing-pages/request-consultation/lp-language'
import { selectLpProof } from '@/components/landing-pages/request-consultation/lp-proof'
import { resolveLpSection } from '@/components/landing-pages/request-consultation/lp-sections'
import {
    lpTitle,
    resolveAdVariant,
} from '@/components/landing-pages/request-consultation/lp-variants'
import { getSpecialsFeaturedGalleryImages } from '@/lib/queries/gallery/specials-gallery.query'
import { getPublishedGoogleReviews } from '@/lib/queries/reviews/google-reviews.query'

import './landing.css'

type SearchParams = Record<string, string | string[] | undefined>

interface PageProps {
    searchParams: Promise<SearchParams>
}

/** Enough rows that a handful survive the rail's length and rating filters. */
const REVIEWS_TO_READ = 40

function first(value: string | string[] | undefined): string | undefined {
    return Array.isArray(value) ? value[0] : value
}

async function resolveLang(params: SearchParams): Promise<ResolvedLpLanguage> {
    return resolveLpLanguage(
        first(params.hl) ?? first(params.lang),
        (await headers()).get('accept-language')
    )
}

/**
 * The hero form's test arm: the middleware's choice, or — should the page
 * ever render without it — the override, then the visitor's cookie, then
 * the thread.
 */
async function formVariantFrom(params: SearchParams): Promise<LpFormVariant> {
    return (
        toLpFormVariant((await headers()).get(LP_FORM_HEADER)) ??
        toLpFormVariant(first(params[LP_FORM_QUERY])) ??
        toLpFormVariant((await cookies()).get(LP_FORM_COOKIE)?.value) ??
        'thread'
    )
}

function variantFrom(params: SearchParams) {
    return resolveAdVariant(first(params.p) ?? first(params.procedure))
}

export async function generateMetadata({
    searchParams,
}: PageProps): Promise<Metadata> {
    const params = await searchParams
    const { lang } = await resolveLang(params)
    const { meta } = LP_COPY[lang]

    return {
        // Absolute: the title already ends with the practice's name.
        title: { absolute: lpTitle(lang, variantFrom(params)) },
        description: meta.description,
        // Paid traffic only. It must never compete with /free-consultation or
        // /consulta-gratis in organic search.
        robots: { index: false, follow: true },
    }
}

export const viewport = {
    width: 'device-width',
    initialScale: 1,
    themeColor: '#f7f3ea',
}

export default async function RequestConsultationLandingPage({
    searchParams,
}: PageProps) {
    const params = await searchParams
    const { lang, pinned } = await resolveLang(params)
    const adVariant = variantFrom(params)
    const formVariant = await formVariantFrom(params)

    const [gallery, reviews] = await Promise.all([
        getSpecialsFeaturedGalleryImages().catch(() => []),
        getPublishedGoogleReviews(REVIEWS_TO_READ).catch(() => null),
    ])

    return (
        <LpLanding
            initialLang={lang}
            langPinnedByUrl={pinned}
            adVariant={adVariant}
            formVariant={formVariant}
            chat={buildLpChat(adVariant)}
            proof={selectLpProof(adVariant, gallery, reviews)}
            focusSection={resolveLpSection(first(params.s))}
        />
    )
}
