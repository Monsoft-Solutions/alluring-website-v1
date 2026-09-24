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
 *
 * One ask, and no way off the page (#283): every CTA leads to the
 * consultation thread in the hero, the proof a visitor used to leave for
 * (gallery, reviews) is on the page, the legal documents open in a dialog,
 * and nothing links to the main site. The phone number stays — a call is a
 * conversion, not an exit.
 *
 * Order: the ask, then results, the surgeon, reviews, what the consultation
 * gives her in writing, flying in, the three objections, and the ask again.
 */

import { useEffect, useRef } from 'react'

import { ConsultStickyBar } from '@/components/shared/consult-chat/consult-sticky-bar.component'
import { getSmsLink, siteConfig } from '@/lib/data/site-config'

import type { LpChat } from './lp-chat-copy'
import { LpClosingCta, LpFooter } from './lp-closing.component'
import { LP_CHAT_ID } from './lp-config'
import { LpConsultThread } from './lp-consult-thread.component'
import { LP_COPY, type LpLang } from './lp-copy'
import { LpFaq } from './lp-faq.component'
import { LpFlyIn } from './lp-fly-in.component'
import { LpHeader } from './lp-header.component'
import { LpHero } from './lp-hero.component'
import { LpLegalDialog } from './lp-legal-dialog.component'
import type { LpProof } from './lp-proof'
import { LpResults } from './lp-results.component'
import { LpReviews } from './lp-reviews.component'
import { LpSurgeon } from './lp-surgeon.component'
import { LpWriting } from './lp-writing.component'
import { trackLpEvent } from './lp-tracking'
import { AD_VARIANT_COPY, type AdVariant } from './lp-variants'
import { useLpLanguage } from './use-lp-language.hook'

/** The shared sticky bar's links, under the placement names the page reported before. */
const STICKY_PLACEMENTS: Readonly<Record<string, string>> = {
    consult_sticky_chat: 'cta-sticky',
    consult_sticky_call: 'call-sticky',
    consult_sticky_text: 'text-sticky',
}

/** The published figures, for when the live ones are unavailable. */
const FALLBACK_RATING = '4.7'
const FALLBACK_REVIEW_COUNT = '80+'

interface LpLandingProps {
    /** Resolved server-side from `?hl=` or the request's Accept-Language. */
    readonly initialLang: LpLang
    /**
     * True when `?hl=` named the language. An explicit choice in the ad URL
     * outranks whatever the visitor picked on a previous visit.
     */
    readonly langPinnedByUrl: boolean
    readonly adVariant: AdVariant
    /** The thread's copy in both languages, built on the server. */
    readonly chat: LpChat
    /** Photographs, rating and reviews, read on the server. */
    readonly proof: LpProof
}

export function LpLanding({
    initialLang,
    langPinnedByUrl,
    adVariant,
    chat,
    proof,
}: LpLandingProps) {
    const [lang, chooseLang] = useLpLanguage(initialLang, langPinnedByUrl)
    const rootRef = useRef<HTMLDivElement>(null)

    const copy = LP_COPY[lang]
    const variant = AD_VARIANT_COPY[lang][adVariant]
    const rating = proof.rating ?? FALLBACK_RATING
    const reviewCount = proof.reviewCount
        ? String(proof.reviewCount)
        : FALLBACK_REVIEW_COUNT

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
     * delegated listener on the document rather than a handler on each link:
     * the shared sticky bar sits outside the page root, and marks its links
     * with `data-cta` rather than `data-track`.
     */
    useEffect(() => {
        const onClick = (event: MouseEvent) => {
            if (!(event.target instanceof Element)) return
            const target = event.target.closest('[data-track], [data-cta]')
            const placement =
                target?.getAttribute('data-track') ??
                STICKY_PLACEMENTS[target?.getAttribute('data-cta') ?? '']
            if (!placement) return
            trackLpEvent(
                placement.startsWith('call') ? 'lp_call_click' : 'lp_cta_click',
                { lang, adVariant },
                { placement }
            )
        }

        document.addEventListener('click', onClick)
        return () => document.removeEventListener('click', onClick)
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

    // The sticky bar and the legal dialog sit outside the page root: its
    // scoped `a { color: inherit }` would outrank their utility classes.
    return (
        <>
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
                        rating={rating}
                        reviewCount={reviewCount}
                        onSelectLang={selectLang}
                        thread={
                            <LpConsultThread
                                lang={lang}
                                adVariant={adVariant}
                                chat={chat}
                            />
                        }
                    />
                    <LpResults copy={copy.results} photos={proof.photos} />
                    <LpSurgeon copy={copy.surgeon} />
                    <LpReviews
                        lang={lang}
                        copy={copy.reviews}
                        rating={rating}
                        reviewCount={proof.reviewCount}
                        liveReviews={proof.reviews}
                    />
                    <LpWriting copy={copy.writing} />
                    <LpFlyIn copy={copy.flyIn} />
                    <LpFaq copy={copy.faq} />
                    <LpClosingCta
                        copy={copy.closing}
                        procedures={chat.copy[lang].procedures}
                    />
                </main>

                <LpFooter copy={copy.footer} />
            </div>
            <LpLegalDialog copy={copy.footer} />
            <ConsultStickyBar
                chatId={LP_CHAT_ID}
                label={{ en: LP_COPY.en.sticky.cta, es: LP_COPY.es.sticky.cta }}
                phoneDigits={siteConfig.contact.phone.replace(/\D/g, '')}
                phoneLabel={`${copy.header.callWord}${siteConfig.contact.phoneDisplay}`}
                smsLink={getSmsLink()}
            />
        </>
    )
}
