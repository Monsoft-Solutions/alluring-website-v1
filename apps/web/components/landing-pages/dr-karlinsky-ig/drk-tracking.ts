/**
 * The page's own events: pushed to the dataLayer for GTM, like the ads
 * landing page's `lp_*` events, and sent to GA4 too, so they can be read in
 * GA4 without a GTM change.
 *
 * Every event carries the page variant, the hero arm (#332's A/B test) and
 * the language. Nothing about the visitor: no name, number or procedure.
 *
 * The arm comes from the page (`data-hero-arm` on the root, set on the
 * server) or, on the thank-you page, from the visitor's arm cookie.
 */

import { pushDataLayer } from '@/components/landing-pages/request-consultation/lp-tracking'
import { trackEvent } from '@/lib/analytics/analytics.client'

import { drkPageVariant } from './drk-config'
import {
    DRK_HERO_COOKIE,
    DRK_HERO_FALLBACK,
    type DrkHeroArm,
    toDrkHeroArm,
} from './drk-hero-variant'

type Params = Readonly<Record<string, string | number>>

/** The arm this visitor is in. */
export function readDrkHeroArm(): DrkHeroArm {
    if (typeof document === 'undefined') return DRK_HERO_FALLBACK
    const fromPage = toDrkHeroArm(
        document.querySelector<HTMLElement>('.drk[data-hero-arm]')?.dataset
            .heroArm
    )
    if (fromPage) return fromPage
    const cookie = document.cookie
        .split('; ')
        .find((part) => part.startsWith(`${DRK_HERO_COOKIE}=`))
        ?.slice(DRK_HERO_COOKIE.length + 1)
    return toDrkHeroArm(cookie) ?? DRK_HERO_FALLBACK
}

export function trackDrkEvent(
    event: string,
    lang: string,
    params: Params = {}
): void {
    const arm = readDrkHeroArm()
    const pageVariant = drkPageVariant(arm)
    pushDataLayer({ event, pageVariant, heroArm: arm, lang, ...params })
    trackEvent(event, {
        page_variant: pageVariant,
        hero_arm: arm,
        lang,
        ...params,
    })
}
