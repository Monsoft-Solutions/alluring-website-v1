/**
 * Language Switcher Component
 *
 * Flag-based language switcher for English/Spanish translation.
 * Uses Google Translate Element for automatic translation.
 * Persists language preference to localStorage.
 */
'use client'

import { useEffect, useRef, useState } from 'react'
import { useAnalyticsEvent } from '@/lib/analytics/useAnalyticsEvent.hook'
import {
    LANGUAGES,
    type LanguageCode,
    DEFAULT_LANGUAGE,
} from '@/lib/types/language.type'
import { changeLanguage, getCurrentLanguage } from '@/lib/utils/language.util'

type LanguageSwitcherProps = {
    /**
     * Display mode for different layouts
     * - horizontal: Flags side by side (default)
     * - vertical: Flags stacked
     */
    mode?: 'horizontal' | 'vertical'
}

export function LanguageSwitcher({
    mode = 'horizontal',
}: LanguageSwitcherProps) {
    const [currentLang, setCurrentLang] =
        useState<LanguageCode>(DEFAULT_LANGUAGE)
    /**
     * True while Google Translate is being fetched. The widget is no longer on
     * the page by default, so the first switch into Spanish has a visible
     * wait — without this the flag looks unresponsive for a second or two.
     */
    const [isSwitching, setIsSwitching] = useState(false)
    /**
     * Read by the poll below, which must not observe its own in-flight switch.
     * A ref rather than `isSwitching` so the interval always sees the current
     * value without being torn down and recreated on every toggle.
     */
    const isSwitchingRef = useRef(false)
    const { track } = useAnalyticsEvent()

    // Restoring a stored preference is handled once, at the root layout, by
    // GoogleTranslateInit — this component only reflects and toggles state.
    useEffect(() => {
        const initTimeout = setTimeout(() => {
            setCurrentLang(getCurrentLanguage())
        }, 500)

        // Poll for language changes (e.g., from Google Translate widget)
        const pollInterval = setInterval(() => {
            // `getCurrentLanguage` reads the `googtrans` cookie, which
            // `changeLanguage` writes *before* awaiting the widget. Polling
            // mid-switch would flip the flag to "Spanish active" seconds before
            // the page is translated — and leave it there if the load fails.
            if (isSwitchingRef.current) return

            setCurrentLang((prev) => {
                const detected = getCurrentLanguage()
                return detected !== prev ? detected : prev
            })
        }, 1000)

        return () => {
            clearTimeout(initTimeout)
            clearInterval(pollInterval)
        }
    }, [])

    const handleLanguageChange = async () => {
        if (isSwitching) return

        // Toggle to the opposite language
        const newLanguage: LanguageCode = currentLang === 'en' ? 'es' : 'en'

        // Track button click event
        track('language_button_click', {
            from_language: currentLang,
            to_language: newLanguage,
            language_name: LANGUAGES[newLanguage].name,
            device_context: mode === 'horizontal' ? 'desktop' : 'mobile',
            current_url:
                typeof window !== 'undefined' ? window.location.href : '',
            page_path:
                typeof window !== 'undefined' ? window.location.pathname : '',
        })

        // Change language. The first switch into Spanish fetches the Google
        // Translate script, so this can take a moment.
        setIsSwitching(true)
        isSwitchingRef.current = true
        try {
            // Only claim the new language if the page actually got it. A
            // blocked or slow `translate.google.com` rejects after a timeout,
            // and flipping the flag regardless would leave the control saying
            // "Switch to English" over an untranslated page.
            const applied = await changeLanguage(newLanguage)
            setCurrentLang(applied ? newLanguage : getCurrentLanguage())
        } finally {
            isSwitchingRef.current = false
            setIsSwitching(false)
        }
    }

    // Show the opposite language (the one to switch TO)
    const targetLang = currentLang === 'en' ? LANGUAGES.es : LANGUAGES.en

    return (
        <button
            onClick={() => void handleLanguageChange()}
            className='group hover:ring-gold-400 relative flex h-10 w-10 items-center justify-center rounded-full text-2xl transition-all duration-300 hover:scale-110 hover:ring-2 hover:ring-offset-2 disabled:cursor-wait disabled:opacity-60 disabled:hover:scale-100 disabled:hover:ring-0'
            aria-label={`Switch to ${targetLang.name}`}
            aria-busy={isSwitching}
            title={`Switch to ${targetLang.name}`}
            type='button'
            disabled={isSwitching}
        >
            <span className='transition-transform duration-300 group-hover:scale-110'>
                {targetLang.flag}
            </span>
        </button>
    )
}
