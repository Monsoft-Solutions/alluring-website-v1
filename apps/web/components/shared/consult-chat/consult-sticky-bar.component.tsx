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
 */

import { useEffect, useState } from 'react'

import { useConsultChatProgress } from './consult-chat-progress'
import { usePageLanguage } from './use-page-language.hook'

export interface ConsultStickyBarProps {
    /** Id of the `ConsultChat` section. */
    readonly chatId: string
    readonly label: { readonly en: string; readonly es: string }
    /** Digits only, for the `tel:` link. */
    readonly phoneDigits: string
    readonly phoneLabel: string
    /** `sms:` link to the texting number; replaces the call button when set. */
    readonly smsLink?: string | null
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
}: ConsultStickyBarProps) {
    const [visible, setVisible] = useState(false)
    const lang = usePageLanguage()
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
            setVisible(
                !entry.isIntersecting && entry.boundingClientRect.top < 0
            )
        })
        observer.observe(chat)
        return () => observer.disconnect()
    }, [chatId])

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
            <div className='flex items-center gap-2'>
                <a
                    href={`#${chatId}`}
                    className='from-gold-300 via-gold-400 to-gold-500 flex min-h-12 flex-1 items-center justify-center rounded-xl bg-gradient-to-br px-4 text-center text-[15px] font-bold text-stone-950'
                >
                    {left !== null ? RESUME[lang](left) : label[lang]} →
                </a>
                {smsLink ? (
                    <a
                        href={smsLink}
                        className='flex min-h-12 items-center rounded-xl border border-white/15 px-4 text-sm font-semibold text-stone-100'
                    >
                        {lang === 'es' ? 'Escríbenos' : 'Text us'}
                    </a>
                ) : (
                    <a
                        href={`tel:${phoneDigits}`}
                        className='flex min-h-12 items-center rounded-xl border border-white/15 px-4 text-sm font-semibold text-stone-100'
                        aria-label={phoneLabel}
                    >
                        {lang === 'es' ? 'Llamar' : 'Call'}
                    </a>
                )}
            </div>
        </div>
    )
}
