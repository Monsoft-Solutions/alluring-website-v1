'use client'

/**
 * Phone-only sticky bar that brings the visitor back to the consultation
 * thread once it has scrolled off screen. Hidden while the thread is in
 * view; after a first answer it says how many steps are left, and the
 * thread keeps those answers.
 *
 * Its second button texts the practice when a texting number is set
 * (`siteConfig.contact.textPhone`) — these visitors text, and 0.4% ever
 * tapped a call link — and calls the main line otherwise.
 *
 * With `question` (the ads landing page, #292) the bar asks the thread's
 * first question itself until it is answered: the question, a hint, and a
 * row of procedure chips, each a link that answers it
 * (`data-consult-procedure`, read by the form). `hideWhile` names sections
 * that ask the same question (the closing, a sitelink's strip); the bar
 * steps aside while any of them is on screen.
 */

import { useEffect, useState } from 'react'

import { useConsultChatProgress } from './consult-chat-progress'
import type { ConsultChatLang, ConsultChatOption } from './consult-chat.types'
import { usePageLanguage } from './use-page-language.hook'

type ByLang<T> = { readonly en: T; readonly es: T }

export interface ConsultStickyBarProps {
    /** Id of the `ConsultChat` section. */
    readonly chatId: string
    readonly label: { readonly en: string; readonly es: string }
    /** Digits only, for the `tel:` link. */
    readonly phoneDigits: string
    readonly phoneLabel: string
    /** `sms:` link to the texting number; replaces the call button when set. */
    readonly smsLink?: string | null
    /**
     * The page's own language, for a page that sets it itself (the ads
     * landing page). Without it the bar follows Google Translate.
     */
    readonly lang?: ConsultChatLang
    /** Ask the first question in the bar until it is answered. */
    readonly question?: {
        readonly label: ByLang<string>
        readonly hint: ByLang<string>
        readonly chips: ByLang<readonly ConsultChatOption[]>
    }
    /** Ids of sections the bar steps aside for while they are on screen. */
    readonly hideWhile?: readonly string[]
}

const RESUME = {
    en: (left: number) =>
        `Finish your request: ${left} step${left === 1 ? '' : 's'} left`,
    es: (left: number) =>
        `Termina tu solicitud: ${left === 1 ? 'falta 1 paso' : `faltan ${left} pasos`}`,
} as const

export function ConsultStickyBar({
    chatId,
    label,
    phoneDigits,
    phoneLabel,
    smsLink,
    lang: langProp,
    question,
    hideWhile,
}: ConsultStickyBarProps) {
    const [pastChat, setPastChat] = useState(false)
    const [covered, setCovered] = useState(false)
    const visible = pastChat && !covered
    const pageLang = usePageLanguage()
    const lang = langProp ?? pageLang
    const progress = useConsultChatProgress(chatId)
    const left =
        progress && progress.answered > 0
            ? progress.total - progress.answered
            : null

    useEffect(() => {
        const chat = document.getElementById(chatId)
        if (!chat || !('IntersectionObserver' in window)) return

        // Shown only once the thread has scrolled *above* the viewport, so
        // it never covers the first screen.
        const observer = new IntersectionObserver(([entry]) => {
            if (!entry) return
            setPastChat(
                !entry.isIntersecting && entry.boundingClientRect.top < 0
            )
        })
        observer.observe(chat)
        return () => observer.disconnect()
    }, [chatId])

    const hideKey = (hideWhile ?? []).join(' ')
    useEffect(() => {
        if (!hideKey || !('IntersectionObserver' in window)) return
        const targets = hideKey
            .split(' ')
            .flatMap((id) => document.getElementById(id) ?? [])
        const onScreen = new Set<Element>()
        const observer = new IntersectionObserver((entries) => {
            for (const entry of entries) {
                if (entry.isIntersecting) onScreen.add(entry.target)
                else onScreen.delete(entry.target)
            }
            setCovered(onScreen.size > 0)
        })
        for (const target of targets) observer.observe(target)
        return () => observer.disconnect()
    }, [hideKey])

    const asking = question && left === null
    const callOrText = smsLink ? (
        <a
            href={smsLink}
            data-cta='consult_sticky_text'
            className='flex min-h-12 items-center rounded-full border border-white/15 px-4 text-sm font-semibold text-stone-100'
        >
            {lang === 'es' ? 'Escríbenos' : 'Text us'}
        </a>
    ) : (
        <a
            href={`tel:${phoneDigits}`}
            data-cta='consult_sticky_call'
            className='flex min-h-12 items-center rounded-full border border-white/15 px-4 text-sm font-semibold text-stone-100'
            aria-label={phoneLabel}
        >
            {lang === 'es' ? 'Llamar' : 'Call'}
        </a>
    )

    return (
        <div
            className='fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-stone-950/90 px-4 pt-2.5 backdrop-blur-xl transition-transform duration-300 md:hidden'
            style={{
                paddingBottom: 'calc(10px + env(safe-area-inset-bottom, 0px))',
                transform: visible ? 'none' : 'translateY(110%)',
            }}
            aria-hidden={!visible}
            translate='no'
            inert={!visible}
        >
            {asking ? (
                <div>
                    <p className='text-gold-200 mb-2 flex items-baseline justify-between gap-3 text-[13px] font-semibold'>
                        <span>{question.label[lang]}</span>
                        <span className='font-medium text-stone-400'>
                            {question.hint[lang]}
                        </span>
                    </p>
                    <ul className='-mx-4 flex gap-2 overflow-x-auto px-4 pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>
                        {question.chips[lang].map((chip) => (
                            <li key={chip.value} className='shrink-0'>
                                <a
                                    href={`#${chatId}`}
                                    data-consult-procedure={chip.value}
                                    data-consult-entry='bar'
                                    data-cta='consult_sticky_chip'
                                    className='border-gold-300/40 bg-gold-300/5 flex min-h-11 items-center rounded-full border px-4 text-[14.5px] font-semibold whitespace-nowrap text-stone-100'
                                >
                                    {chip.label}
                                </a>
                            </li>
                        ))}
                        <li className='shrink-0'>{callOrText}</li>
                    </ul>
                </div>
            ) : (
                <div className='flex items-center gap-2'>
                    <a
                        href={`#${chatId}`}
                        data-cta='consult_sticky_chat'
                        className='bg-gold-300 hover:bg-gold-200 flex min-h-12 flex-1 items-center justify-center rounded-full px-4 text-center text-[15px] font-semibold text-stone-950 transition-colors'
                    >
                        {left !== null ? RESUME[lang](left) : label[lang]} →
                    </a>
                    {callOrText}
                </div>
            )}
        </div>
    )
}
