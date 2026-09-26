/**
 * Confirmation page for the Google Ads funnel.
 *
 * The landing page's consultation thread redirects here after a successful
 * submission (a full page load), carrying `?p=` (ad group), `?hl=`
 * (language), `?pv=` (landing page version) and `?fv=` (the form test's arm,
 * #292), so the conversion event knows which ad, language and form produced
 * the lead. The campaign
 * identifiers are not in the URL: the event reads them from the session copy
 * the landing page kept (`readAttribution`), and the lead itself already
 * carries them.
 *
 * It is a separate route from the site's own thank-you pages, so paid leads
 * can be told apart in reporting by path as well as by the event.
 */

import type { Metadata } from 'next'
import { headers } from 'next/headers'

import { LP_THANK_YOU_COPY } from '@/components/landing-pages/request-consultation/lp-thank-you-copy'
import { LpThankYou } from '@/components/landing-pages/request-consultation/lp-thank-you.component'
import {
    resolveLpLanguage,
    type ResolvedLpLanguage,
} from '@/components/landing-pages/request-consultation/lp-language'
import { toLpFormVariant } from '@/components/landing-pages/request-consultation/lp-form-variant'
import { LP_PAGE_VERSION } from '@/components/landing-pages/request-consultation/lp-tracking'
import { resolveAdVariant } from '@/components/landing-pages/request-consultation/lp-variants'

import './thank-you.css'

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

/**
 * `?pv=` reaches the dataLayer, so it is reduced to the shape a page version
 * can actually have before it gets there.
 */
function resolvePageVersion(value: string | undefined): string {
    const cleaned = (value ?? '').replace(/[^a-z0-9-]/gi, '').slice(0, 16)
    return cleaned || LP_PAGE_VERSION
}

export async function generateMetadata({
    searchParams,
}: PageProps): Promise<Metadata> {
    const { lang } = await resolveLang(await searchParams)

    return {
        title: LP_THANK_YOU_COPY[lang].meta.title,
        robots: { index: false, follow: false },
    }
}

export const viewport = {
    width: 'device-width',
    initialScale: 1,
    themeColor: '#0c0a09',
}

export default async function RequestConsultationThankYouPage({
    searchParams,
}: PageProps) {
    const params = await searchParams
    const { lang, pinned } = await resolveLang(params)

    return (
        <LpThankYou
            initialLang={lang}
            langPinnedByUrl={pinned}
            adVariant={resolveAdVariant(first(params.p))}
            pageVersion={resolvePageVersion(first(params.pv))}
            formVariant={toLpFormVariant(first(params.fv))}
        />
    )
}
