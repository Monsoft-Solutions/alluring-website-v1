'use client'

/**
 * The visitor's language on a Google-Translated site page: `es` once
 * Translate is on (the `googtrans` cookie / `<html lang>`), else `en`.
 *
 * English on the server and during hydration, so the markup matches; the
 * switch happens right after, and follows the visitor toggling it live.
 */

import { useSyncExternalStore } from 'react'

import { getCurrentLanguage } from '@/lib/utils/language.util'

import type { ConsultChatLang } from './consult-chat.types'

function subscribe(onChange: () => void): () => void {
    const observer = new MutationObserver(onChange)
    observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['lang', 'class'],
    })
    return () => observer.disconnect()
}

const getSnapshot = (): ConsultChatLang =>
    getCurrentLanguage() === 'es' ? 'es' : 'en'

const getServerSnapshot = (): ConsultChatLang => 'en'

export function usePageLanguage(): ConsultChatLang {
    return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
