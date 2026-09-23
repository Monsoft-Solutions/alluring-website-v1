/**
 * Melissa Juvier — patient coordinator — personal landing page.
 *
 *   /landing/melissa-juvier            English (or Spanish, from Accept-Language)
 *   /landing/melissa-juvier?hl=es      Spanish
 *   /melissa                           her bio link: 308s here with UTMs
 *
 * Built for warm traffic from her social bio link. One job: turn a follower
 * into a consultation request that lands tagged as hers
 * (`source = melissa-juvier-landing`).
 *
 * It lives under `/landing/*`, which `ConditionalLayout` treats as
 * standalone — no site header, footer or floating widgets — and it renders
 * per request because the language is resolved on the server, so the HTML
 * arrives in the right language with no flip after hydration.
 */

import type { Metadata, Viewport } from 'next'
import { headers } from 'next/headers'

import { MjLanding } from '@/components/landing-pages/melissa-juvier/mj-landing.component'
import { MJ_COPY } from '@/components/landing-pages/melissa-juvier/mj-copy'
import { resolveLpLanguage } from '@/components/landing-pages/request-consultation/lp-language'

import './melissa.css'

type SearchParams = Record<string, string | string[] | undefined>

interface PageProps {
    searchParams: Promise<SearchParams>
}

function first(value: string | string[] | undefined): string | undefined {
    return Array.isArray(value) ? value[0] : value
}

async function resolveLang(params: SearchParams) {
    const { lang } = resolveLpLanguage(
        first(params.hl) ?? first(params.lang),
        (await headers()).get('accept-language')
    )
    return lang
}

/** The same page in the other language, keeping the UTMs it arrived with. */
function switchHref(params: SearchParams, other: string): string {
    const query = new URLSearchParams()
    for (const [key, value] of Object.entries(params)) {
        if (key === 'hl' || key === 'lang' || value === undefined) continue
        for (const item of Array.isArray(value) ? value : [value]) {
            query.append(key, item)
        }
    }
    query.set('hl', other)
    return `?${query.toString()}`
}

export async function generateMetadata({
    searchParams,
}: PageProps): Promise<Metadata> {
    const lang = await resolveLang(await searchParams)
    const { meta } = MJ_COPY[lang]

    return {
        title: { absolute: meta.title },
        description: meta.description,
        // A personal bio-link page. It must not compete with the site's own
        // consultation pages in search.
        robots: { index: false, follow: true },
        openGraph: {
            title: meta.title,
            description: meta.description,
            type: 'profile',
            locale: lang === 'es' ? 'es_US' : 'en_US',
        },
        twitter: {
            card: 'summary_large_image',
            title: meta.title,
            description: meta.description,
        },
    }
}

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    themeColor: '#0d0a08',
}

export default async function MelissaJuvierLandingPage({
    searchParams,
}: PageProps) {
    const params = await searchParams
    const lang = await resolveLang(params)

    return (
        <MjLanding
            lang={lang}
            switchHref={switchHref(params, lang === 'en' ? 'es' : 'en')}
        />
    )
}
