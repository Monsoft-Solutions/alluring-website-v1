/**
 * /landing/melissa-juvier/thank-you — where a request from her page lands.
 *
 * Reached by a full page load (not a client transition), so the tag
 * container records a real page view here. `?hl=` carries the language over.
 */

import type { Metadata, Viewport } from 'next'

import { MJ_COPY } from '@/components/landing-pages/melissa-juvier/mj-copy'
import { MjThankYou } from '@/components/landing-pages/melissa-juvier/mj-thank-you.component'
import { resolveLpLanguage } from '@/components/landing-pages/request-consultation/lp-language'

import '../melissa.css'

type SearchParams = Record<string, string | string[] | undefined>

interface PageProps {
    searchParams: Promise<SearchParams>
}

function langOf(params: SearchParams) {
    const requested = Array.isArray(params.hl) ? params.hl[0] : params.hl
    // The form always sends `?hl=`; no Accept-Language fallback needed.
    return resolveLpLanguage(requested, null).lang
}

export async function generateMetadata({
    searchParams,
}: PageProps): Promise<Metadata> {
    const lang = langOf(await searchParams)
    return {
        title: { absolute: MJ_COPY[lang].thankYou.metaTitle },
        robots: { index: false, follow: false },
    }
}

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    themeColor: '#0d0a08',
}

export default async function MelissaJuvierThankYouPage({
    searchParams,
}: PageProps) {
    const lang = langOf(await searchParams)

    return (
        <div className='mj mj--ty' lang={lang}>
            <MjThankYou lang={lang} copy={MJ_COPY[lang].thankYou} />
        </div>
    )
}
