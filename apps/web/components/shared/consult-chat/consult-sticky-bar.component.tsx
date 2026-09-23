'use client'

/**
 * Phone-only sticky bar that brings the visitor back to the consultation
 * thread once it has scrolled off screen. Hidden while the thread is in
 * view; after a first answer it says how many steps are left, and the
 * thread keeps those answers.
 */

import { useEffect, useState } from 'react'

import {
    CONSULT_CHAT_PROGRESS_EVENT,
    type ConsultChatProgressDetail,
} from './consult-chat.types'
import { usePageLanguage } from './use-page-language.hook'

export interface ConsultStickyBarProps {
    /** Id of the `ConsultChat` section. */
    readonly chatId: string
    readonly label: { readonly en: string; readonly es: string }
    /** Digits only, for the `tel:` link. */
    readonly phoneDigits: string
    readonly phoneLabel: string
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
}: ConsultStickyBarProps) {
    const [visible, setVisible] = useState(false)
    const [left, setLeft] = useState<number | null>(null)
    const lang = usePageLanguage()

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

        const onProgress = (event: Event) => {
            const { detail } = event as CustomEvent<ConsultChatProgressDetail>
            if (detail.id !== chatId) return
            setLeft(detail.answered > 0 ? detail.total - detail.answered : null)
        }
        window.addEventListener(CONSULT_CHAT_PROGRESS_EVENT, onProgress)

        return () => {
            observer.disconnect()
            window.removeEventListener(CONSULT_CHAT_PROGRESS_EVENT, onProgress)
        }
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
                <a
                    href={`tel:${phoneDigits}`}
                    className='flex min-h-12 items-center rounded-xl border border-white/15 px-4 text-sm font-semibold text-stone-100'
                    aria-label={phoneLabel}
                >
                    {lang === 'es' ? 'Llamar' : 'Call'}
                </a>
            </div>
        </div>
    )
}
