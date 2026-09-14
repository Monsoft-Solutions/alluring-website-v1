/**
 * Google Ads landing page — free consultation.
 *
 * One page serves every ad group and both languages:
 *
 *   /lp/request-consultation                      general
 *   /lp/request-consultation?p=bbl                per ad group
 *   /lp/request-consultation?p=bbl&hl=es          Spanish campaigns
 *
 * Aliases (`lipo`, `mm`, `tt`, `breast`…) resolve in `lp-variants.ts`, and
 * Google's `gclid` / `wbraid` / `gbraid` / `utm_*` pass through untouched to
 * the thank-you page.
 *
 * It lives under `/lp/*`, which `ConditionalLayout` treats as standalone: no
 * site header, no footer, no floating chrome. A paid landing page has one job,
 * and site navigation is a way out of it.
 *
 * The page renders per request because the language and the headline are
 * resolved from the query string and Accept-Language on the server — the HTML
 * arrives already correct rather than flipping after hydration.
 */

import type { Metadata } from 'next'
import { headers } from 'next/headers'

import { LpLanding } from '@/components/landing-pages/request-consultation/lp-landing.component'
import { LP_COPY } from '@/components/landing-pages/request-consultation/lp-copy'
import {
    resolveLpLanguage,
    type ResolvedLpLanguage,
} from '@/components/landing-pages/request-consultation/lp-language'
import { resolveAdVariant } from '@/components/landing-pages/request-consultation/lp-variants'

import './landing.css'

type SearchParams = Record<string, string | string[] | undefined>

interface PageProps {
    searchParams: Promise<SearchParams>
}

function first(value: string | string[] | undefined): string | undefined {
    return Array.isArray(value) ? value[0] : value
}

async function resolveLang(params: SearchParams): Promise<ResolvedLpLanguage> {
    return resolveLpLanguage(
        first(params.hl) ?? first(params.lang),
        (await headers()).get('accept-language')
    )
}

export async function generateMetadata({
    searchParams,
}: PageProps): Promise<Metadata> {
    const { lang } = await resolveLang(await searchParams)
    const { meta } = LP_COPY[lang]

    return {
        title: meta.title,
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
    const adVariant = resolveAdVariant(
        first(params.p) ?? first(params.procedure)
    )

    return (
        <LpLanding
            initialLang={lang}
            langPinnedByUrl={pinned}
            adVariant={adVariant}
        />
    )
}
