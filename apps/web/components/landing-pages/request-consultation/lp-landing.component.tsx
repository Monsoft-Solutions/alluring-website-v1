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
 * v6 (#292) is the short page: the form, results, the surgeon, one review,
 * five closed questions, and the form's question again. A sitelink's `?s=`
 * puts its section directly under the hero, with a question strip over it,
 * and scrolls there (`lp-sections.ts`). The phone's sticky bar asks the
 * form's first question until it is answered.
 *
 * The hero form is under a 50/50 test, the quiet thread against the tap
 * card; `middleware.ts` picks the visitor's arm and the page hands it here.
 * Every event, the lead and the thank-you conversion carry the arm, and each
 * answer is logged to our own database (`lp-step-beacon.ts`).
 */

import { Fragment, type ReactNode, useEffect, useRef } from 'react'

import { ConsultStickyBar } from '@/components/shared/consult-chat/consult-sticky-bar.component'
import { getSmsLink, siteConfig } from '@/lib/data/site-config'

import { labelOf } from '@/components/shared/consult-chat/consult-chat.util'

import type { LpChat } from './lp-chat-copy'
import { LP_CLOSING_ID, LpClosingCta, LpFooter } from './lp-closing.component'
import { LP_CHAT_ID } from './lp-config'
import { LpConsultForm } from './lp-consult-form.component'
import { LP_COPY, type LpLang } from './lp-copy'
import { LpFaq } from './lp-faq.component'
import { LpFinancing } from './lp-financing.component'
import { LpFlyIn } from './lp-fly-in.component'
import type { LpFormVariant } from './lp-form-variant'
import { LpHeader } from './lp-header.component'
import { LpHero } from './lp-hero.component'
import { LpLegalDialog } from './lp-legal-dialog.component'
import type { LpProof } from './lp-proof'
import { LP_STRIP_ID, LpQuestionStrip } from './lp-question-strip.component'
import { LpResults } from './lp-results.component'
import { LpReviews } from './lp-reviews.component'
import { type LpSection, orderLpSections } from './lp-sections'
import { lpStepBeacon } from './lp-step-beacon'
import { LpSurgeon } from './lp-surgeon.component'
import { trackLpEvent, trackLpViewInGa4 } from './lp-tracking'
import {
    AD_VARIANT_COPY,
    type AdVariant,
    lpTitle,
    VARIANT_PROCEDURE,
} from './lp-variants'
import { useLpLanguage } from './use-lp-language.hook'

/** The shared sticky bar's links, under the placement names the page reported before. */
const STICKY_PLACEMENTS: Readonly<Record<string, string>> = {
    consult_sticky_chat: 'cta-sticky',
    consult_sticky_call: 'call-sticky',
    consult_sticky_text: 'text-sticky',
    consult_sticky_chip: 'cta-sticky-chip',
}

/** The published figures, for when the live ones are unavailable. */
const FALLBACK_RATING = '4.7'
const FALLBACK_REVIEW_COUNT = '80+'

/**
 * Sections that report `lp_section_view` the first time a quarter of them is
 * on screen: how far down the short page visitors get.
 */
const VIEW_TRACKED: readonly string[] = ['surgeon', 'faq', LP_CLOSING_ID]

interface LpLandingProps {
    /** Resolved server-side from `?hl=` or the request's Accept-Language. */
    readonly initialLang: LpLang
    /**
     * True when `?hl=` named the language. An explicit choice in the ad URL
     * outranks whatever the visitor picked on a previous visit.
     */
    readonly langPinnedByUrl: boolean
    readonly adVariant: AdVariant
    /** The hero form's test arm, chosen by the middleware. */
    readonly formVariant: LpFormVariant
    /** The form's copy in both languages, built on the server. */
    readonly chat: LpChat
    /** Photographs, rating and reviews, read on the server. */
    readonly proof: LpProof
    /** From `?s=`: the section a sitelink opened, moved under the hero. */
    readonly focusSection: LpSection | null
}

export function LpLanding({
    initialLang,
    langPinnedByUrl,
    adVariant,
    formVariant,
    chat,
    proof,
    focusSection,
}: LpLandingProps) {
    const [lang, chooseLang] = useLpLanguage(initialLang, langPinnedByUrl)
    const rootRef = useRef<HTMLDivElement>(null)
    const langRef = useRef(lang)
    useEffect(() => {
        langRef.current = lang
    }, [lang])

    const copy = LP_COPY[lang]
    const variant = AD_VARIANT_COPY[lang][adVariant]
    const title = lpTitle(lang, adVariant)
    const rating = proof.rating ?? FALLBACK_RATING
    const reviewCount = proof.reviewCount
        ? String(proof.reviewCount)
        : FALLBACK_REVIEW_COUNT

    const procedures = chat.copy[lang].procedures
    const adProcedure = VARIANT_PROCEDURE[adVariant]
    const procedureLabel = adProcedure ? labelOf(procedures, adProcedure) : null

    const selectLang = (next: LpLang) => {
        if (next === lang) return
        chooseLang(next)
        trackLpEvent('lp_lang_switch', { lang: next, adVariant, formVariant })
    }

    /** One page view, whatever happens to the language afterwards. */
    useEffect(() => {
        const context = { lang: initialLang, adVariant, formVariant }
        trackLpEvent(
            'lp_view',
            context,
            focusSection ? { section: focusSection } : undefined
        )
        trackLpViewInGa4(context, focusSection)
    }, [initialLang, adVariant, formVariant, focusSection])

    /**
     * A sitelink's section is already first under the hero, with the
     * question strip over it; this brings the strip into view. Only if the
     * visitor hasn't scrolled yet: a slow hydration must not yank a page
     * someone is already reading.
     */
    useEffect(() => {
        if (!focusSection || window.scrollY > 40) return
        document
            .getElementById(LP_STRIP_ID)
            ?.scrollIntoView({ block: 'start', behavior: 'instant' })
    }, [focusSection])

    /** `lp_section_view`, once per section per page view. */
    useEffect(() => {
        if (!('IntersectionObserver' in window)) return
        const targets = VIEW_TRACKED.flatMap((section) => {
            const element = document.getElementById(section)
            return element ? [element] : []
        })
        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (!entry.isIntersecting) continue
                    observer.unobserve(entry.target)
                    trackLpEvent(
                        'lp_section_view',
                        { lang: langRef.current, adVariant, formVariant },
                        { section: entry.target.id }
                    )
                }
            },
            { threshold: 0.25 }
        )
        for (const target of targets) observer.observe(target)
        return () => observer.disconnect()
    }, [adVariant, formVariant])

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
                { lang, adVariant, formVariant },
                { placement }
            )
        }

        document.addEventListener('click', onClick)
        return () => document.removeEventListener('click', onClick)
    }, [lang, adVariant, formVariant])

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
        document.title = title
        return () => {
            documentElement.lang = previousLang
            document.title = previousTitle
        }
    }, [lang, title])

    const sections: Record<LpSection, ReactNode> = {
        results: (
            <LpResults
                copy={copy.results}
                photos={proof.photos}
                procedureLabel={procedureLabel}
            />
        ),
        financing: <LpFinancing copy={copy.financing} />,
        surgeon: <LpSurgeon copy={copy.surgeon} />,
        reviews: (
            <LpReviews
                lang={lang}
                copy={copy.reviews}
                rating={rating}
                reviewCount={proof.reviewCount}
                liveReviews={proof.reviews}
                adVariant={adVariant}
                full={focusSection === 'reviews'}
            />
        ),
        'fly-in': <LpFlyIn copy={copy.flyIn} />,
        faq: <LpFaq copy={copy.faq} prices={chat.prices} />,
    }

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
                        form={
                            <LpConsultForm
                                lang={lang}
                                adVariant={adVariant}
                                formVariant={formVariant}
                                chat={chat}
                                onAnswer={(answer) =>
                                    lpStepBeacon({
                                        ...answer,
                                        lang,
                                        adVariant,
                                        formVariant,
                                        section: focusSection,
                                    })
                                }
                            />
                        }
                    />
                    {orderLpSections(focusSection).map((section) => (
                        <Fragment key={section}>
                            {section === focusSection && (
                                <LpQuestionStrip
                                    copy={copy.strip}
                                    procedures={procedures}
                                />
                            )}
                            {sections[section]}
                        </Fragment>
                    ))}
                    <LpClosingCta copy={copy.closing} procedures={procedures} />
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
                lang={lang}
                question={{
                    label: {
                        en: LP_COPY.en.sticky.question,
                        es: LP_COPY.es.sticky.question,
                    },
                    hint: {
                        en: LP_COPY.en.sticky.hint,
                        es: LP_COPY.es.sticky.hint,
                    },
                    chips: {
                        en: chat.copy.en.procedures,
                        es: chat.copy.es.procedures,
                    },
                }}
                hideWhile={[LP_CLOSING_ID, LP_STRIP_ID]}
            />
        </>
    )
}
