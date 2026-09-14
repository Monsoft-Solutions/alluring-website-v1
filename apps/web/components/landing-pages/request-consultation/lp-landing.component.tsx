'use client'

/**
 * The Google Ads consultation landing page.
 *
 * Language and ad variant are resolved on the server (from `?hl=` / `?p=` and
 * the request's Accept-Language), so the HTML that arrives is already in the
 * right language with the right headline — no flash, and the LCP text is in
 * the first response. This component owns what only the browser can know: a
 * language the visitor chose here on an earlier visit, the reveal-on-scroll
 * observer, and the dataLayer events.
 */

import { useEffect, useRef } from 'react'

import { LP_COPY, type LpLang } from './lp-copy'
import { LpClosingCta, LpFooter, LpStickyBar } from './lp-closing.component'
import { LpConsultationForm } from './lp-consultation-form.component'
import { LpFaq } from './lp-faq.component'
import { LpFlyIn } from './lp-fly-in.component'
import { LpHeader } from './lp-header.component'
import { LpHero } from './lp-hero.component'
import { LpResults } from './lp-results.component'
import { LpReviews } from './lp-reviews.component'
import { LpSurgeon } from './lp-surgeon.component'
import { LpWriting } from './lp-writing.component'
import { trackLpEvent } from './lp-tracking'
import {
    AD_VARIANT_COPY,
    VARIANT_PROCEDURE,
    type AdVariant,
} from './lp-variants'
import { useLpLanguage } from './use-lp-language.hook'

interface LpLandingProps {
    /** Resolved server-side from `?hl=` or the request's Accept-Language. */
    readonly initialLang: LpLang
    /**
     * True when `?hl=` named the language. An explicit choice in the ad URL
     * outranks whatever the visitor picked on a previous visit.
     */
    readonly langPinnedByUrl: boolean
    readonly adVariant: AdVariant
}

export function LpLanding({
    initialLang,
    langPinnedByUrl,
    adVariant,
}: LpLandingProps) {
    const [lang, chooseLang] = useLpLanguage(initialLang, langPinnedByUrl)
    const rootRef = useRef<HTMLDivElement>(null)

    const copy = LP_COPY[lang]
    const variant = AD_VARIANT_COPY[lang][adVariant]

    const selectLang = (next: LpLang) => {
        if (next === lang) return
        chooseLang(next)
        trackLpEvent('lp_lang_switch', { lang: next, adVariant })
    }

    /** One page view, whatever happens to the language afterwards. */
    useEffect(() => {
        trackLpEvent('lp_view', { lang: initialLang, adVariant })
    }, [initialLang, adVariant])

    /**
     * Calls and CTAs, for Google Ads call conversions through GTM. One
     * delegated listener rather than a handler on each of the eight links.
     */
    useEffect(() => {
        const root = rootRef.current
        if (!root) return

        const onClick = (event: MouseEvent) => {
            const target = (event.target as HTMLElement | null)?.closest(
                '[data-track]'
            )
            const placement = target?.getAttribute('data-track')
            if (!placement) return
            trackLpEvent(
                placement.startsWith('call') ? 'lp_call_click' : 'lp_cta_click',
                { lang, adVariant },
                { placement }
            )
        }

        root.addEventListener('click', onClick)
        return () => root.removeEventListener('click', onClick)
    }, [lang, adVariant])

    /**
     * Sections rise into view once. The `in` class is written to the DOM
     * rather than held in state because React never rewrites a `className`
     * prop that did not change, so a language switch leaves it alone.
     */
    useEffect(() => {
        const root = rootRef.current
        if (!root) return

        const targets = root.querySelectorAll<HTMLElement>('.reveal')
        if (!('IntersectionObserver' in window)) {
            for (const target of targets) target.classList.add('in')
            return
        }

        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (!entry.isIntersecting) continue
                    entry.target.classList.add('in')
                    observer.unobserve(entry.target)
                }
            },
            { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
        )
        for (const target of targets) observer.observe(target)
        return () => observer.disconnect()
    }, [])

    /**
     * The document is shared with the rest of the site, so both of these are
     * put back on the way out.
     */
    useEffect(() => {
        const { documentElement } = document
        const previousLang = documentElement.lang
        const previousTitle = document.title
        documentElement.lang = lang
        document.title = copy.meta.title
        return () => {
            documentElement.lang = previousLang
            document.title = previousTitle
        }
    }, [lang, copy.meta.title])

    return (
        <div className='aps-lp' ref={rootRef}>
            <LpHeader
                lang={lang}
                copy={copy.header}
                onSelectLang={selectLang}
            />

            <main>
                <LpHero
                    lang={lang}
                    copy={copy.hero}
                    variant={variant}
                    onSelectLang={selectLang}
                    form={
                        <LpConsultationForm
                            lang={lang}
                            adVariant={adVariant}
                            copy={copy.form}
                            procedure={VARIANT_PROCEDURE[adVariant]}
                        />
                    }
                />
                <LpSurgeon copy={copy.surgeon} />
                <LpResults copy={copy.results} adVariant={adVariant} />
                <LpWriting copy={copy.writing} />
                <LpReviews copy={copy.reviews} />
                <LpFlyIn copy={copy.flyIn} />
                <LpFaq copy={copy.faq} />
                <LpClosingCta copy={copy.closing} />
            </main>

            <LpFooter copy={copy.footer} />
            <LpStickyBar copy={copy.sticky} />
        </div>
    )
}
