/**
 * Language Switcher Component
 *
 * Flag-based language switcher for English/Spanish translation.
 * Uses Google Translate Element for automatic translation.
 * Persists language preference to localStorage.
 */
'use client'

import { useEffect, useState } from 'react'
import { useAnalyticsEvent } from '@/lib/analytics/useAnalyticsEvent.hook'
import {
    LANGUAGES,
    type LanguageCode,
    DEFAULT_LANGUAGE,
} from '@/lib/types/language.type'
import {
    changeLanguage,
    getCurrentLanguage,
    initializeLanguage,
} from '@/lib/utils/language.util'

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
    const { track } = useAnalyticsEvent()

    // Initialize language on mount
    useEffect(() => {
        // Wait for Google Translate to load
        const initTimeout = setTimeout(() => {
            initializeLanguage()
            setCurrentLang(getCurrentLanguage())
        }, 500)

        // Poll for language changes (e.g., from Google Translate widget)
        const pollInterval = setInterval(() => {
            const detectedLang = getCurrentLanguage()
            if (detectedLang !== currentLang) {
                setCurrentLang(detectedLang)
            }
        }, 1000)

        return () => {
            clearTimeout(initTimeout)
            clearInterval(pollInterval)
        }
    }, [currentLang])

    const handleLanguageChange = () => {
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

        // Change language
        changeLanguage(newLanguage)
        setCurrentLang(newLanguage)
    }

    // Show the opposite language (the one to switch TO)
    const targetLang = currentLang === 'en' ? LANGUAGES.es : LANGUAGES.en

    return (
        <button
            onClick={handleLanguageChange}
            className='group hover:ring-gold-400 relative flex h-10 w-10 items-center justify-center rounded-full text-2xl transition-all duration-300 hover:scale-110 hover:ring-2 hover:ring-offset-2'
            aria-label={`Switch to ${targetLang.name}`}
            title={`Switch to ${targetLang.name}`}
            type='button'
        >
            <span className='transition-transform duration-300 group-hover:scale-110'>
                {targetLang.flag}
            </span>
        </button>
    )
}
