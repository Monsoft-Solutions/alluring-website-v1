/**
 * Confirmation page for the Google Ads funnel.
 *
 * The landing page's form redirects here after a successful submission,
 * carrying `?p=` (ad group), `?hl=` (language), `?pv=` (landing page version)
 * and the campaign identifiers, so the conversion event knows which ad and
 * which language produced the lead.
 *
 * It is a separate route from the site's own `/thank-you` on purpose: that one
 * confirms organic form submissions, and mixing the two would make paid
 * conversions impossible to count. See the note in `lp-thank-you.component`
 * about triggering on the event rather than the path.
 */

import type { Metadata } from 'next'
import { headers } from 'next/headers'

import { LP_THANK_YOU_COPY } from '@/components/landing-pages/request-consultation/lp-thank-you-copy'
import { LpThankYou } from '@/components/landing-pages/request-consultation/lp-thank-you.component'
import {
    resolveLpLanguage,
    type ResolvedLpLanguage,
} from '@/components/landing-pages/request-consultation/lp-language'
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
        />
    )
}
