/**
 * Dr. Victoria Karlinsky — the page behind the link in her Instagram bio
 * (#332).
 *
 *   /lp/dr-karlinsky            English (or Spanish, from Accept-Language)
 *   /lp/dr-karlinsky?hl=es      Spanish
 *   /drk                        her bio link: a temporary redirect here with
 *                               utm_source=doctor&utm_medium=dr-karlinsky&utm_campaign=ig-bio
 *
 * One job: turn a follower into a consultation request tagged as hers
 * (`source = dr-karlinsky-ig`, `page_variant = drk-ig-v2-arch | -pick`).
 *
 * Under `/lp/*`, so `ConditionalLayout` renders it standalone: no site header
 * or footer, no promotion bar, no popups, no floating call button
 * (`lib/constants/standalone-routes.ts`). Its phone hero is under a 50/50 test
 * between two new heroes, `arch` and `pick` (v1's is out): the middleware
 * picks the visitor's arm and passes it in a request header
 * (`drk-hero-variant.ts`).
 *
 * Renders per request: the language is resolved on the server so the HTML
 * arrives in the right language. Being dynamic, it is not measured by
 * `size:check` and must not be pinned in `size-budget.json`. The proof
 * (photos, reviews) comes from cached queries; a database failure only drops
 * it.
 */

import type { Metadata, Viewport } from 'next'
import { headers } from 'next/headers'

import { DRK_COPY } from '@/components/landing-pages/dr-karlinsky-ig/drk-copy'
import {
    DrkLanding,
    type DrkLanguageLinks,
} from '@/components/landing-pages/dr-karlinsky-ig/drk-landing.component'
import {
    DRK_HERO_FALLBACK,
    DRK_HERO_HEADER,
    toDrkHeroArm,
} from '@/components/landing-pages/dr-karlinsky-ig/drk-hero-variant'
import {
    DRK_AVATAR,
    DRK_VIDEO,
    hasDrkVideo,
} from '@/components/landing-pages/dr-karlinsky-ig/drk-media'
import { selectDrkProof } from '@/components/landing-pages/dr-karlinsky-ig/drk-proof'
import { resolveLpLanguage } from '@/components/landing-pages/request-consultation/lp-language'
import { siteConfig } from '@/lib/data/site-config'
import { getSpecialsFeaturedGalleryImages } from '@/lib/queries/gallery/specials-gallery.query'
import { getPublishedGoogleReviews } from '@/lib/queries/reviews/google-reviews.query'

import './drk.css'

type SearchParams = Record<string, string | string[] | undefined>

interface PageProps {
    searchParams: Promise<SearchParams>
}

/** Enough rows that a few reviews naming her survive the filters. */
const REVIEWS_TO_READ = 80

function first(value: string | string[] | undefined): string | undefined {
    return Array.isArray(value) ? value[0] : value
}

async function resolveLang(params: SearchParams) {
    return resolveLpLanguage(
        first(params.hl) ?? first(params.lang),
        (await headers()).get('accept-language')
    ).lang
}

/** The same page in each language, keeping the UTMs it arrived with. */
function languageLinks(params: SearchParams): DrkLanguageLinks {
    const href = (lang: string) => {
        const query = new URLSearchParams()
        for (const [key, value] of Object.entries(params)) {
            if (key === 'hl' || key === 'lang' || value === undefined) continue
            for (const item of Array.isArray(value) ? value : [value]) {
                query.append(key, item)
            }
        }
        query.set('hl', lang)
        return `?${query.toString()}`
    }
    return { en: href('en'), es: href('es') }
}

export async function generateMetadata({
    searchParams,
}: PageProps): Promise<Metadata> {
    const lang = await resolveLang(await searchParams)
    const copy = DRK_COPY[lang]
    const { meta } = copy
    // Setting `openGraph` here replaces the root layout's whole object, so
    // the image, URL and site name are given again. Her poster (or her face)
    // is what a link sent from her profile previews with.
    const image = hasDrkVideo(DRK_VIDEO)
        ? {
              url: DRK_VIDEO.poster,
              width: DRK_VIDEO.posterWidth,
              height: DRK_VIDEO.posterHeight,
          }
        : {
              url: DRK_AVATAR.src,
              width: DRK_AVATAR.width,
              height: DRK_AVATAR.height,
          }
    const images = [{ ...image, alt: copy.about.portraitAlt }]

    return {
        title: { absolute: meta.title },
        description: meta.description,
        // A personal bio-link page: it must not compete with the site's own
        // consultation pages in search.
        robots: { index: false, follow: true },
        openGraph: {
            title: meta.title,
            description: meta.description,
            type: 'profile',
            locale: lang === 'es' ? 'es_US' : 'en_US',
            url: lang === 'es' ? '/lp/dr-karlinsky?hl=es' : '/lp/dr-karlinsky',
            siteName: siteConfig.seo.siteName,
            images,
        },
        twitter: {
            // A portrait image: the small card shows it whole.
            card: 'summary',
            title: meta.title,
            description: meta.description,
            images,
        },
    }
}

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    themeColor: '#130c09',
}

export default async function DrKarlinskyInstagramPage({
    searchParams,
}: PageProps) {
    const params = await searchParams
    const lang = await resolveLang(params)
    const heroArm =
        toDrkHeroArm((await headers()).get(DRK_HERO_HEADER)) ??
        DRK_HERO_FALLBACK

    const [gallery, reviews] = await Promise.all([
        getSpecialsFeaturedGalleryImages().catch(() => []),
        getPublishedGoogleReviews(REVIEWS_TO_READ).catch(() => null),
    ])

    return (
        <DrkLanding
            lang={lang}
            languageLinks={languageLinks(params)}
            proof={selectDrkProof(lang, gallery, reviews)}
            video={DRK_VIDEO}
            heroArm={heroArm}
        />
    )
}
