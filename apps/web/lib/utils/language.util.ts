/**
 * Language Utility Functions
 *
 * Utilities for managing language preference and Google Translate integration.
 */

import {
    DEFAULT_LANGUAGE,
    LANGUAGE_STORAGE_KEY,
    type LanguageCode,
} from '@/lib/types/language.type'

/**
 * Get the saved language preference from localStorage
 */
export function getSavedLanguage(): LanguageCode | null {
    if (typeof window === 'undefined') return null

    try {
        const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY)
        if (saved === 'en' || saved === 'es') {
            return saved
        }
    } catch (error) {
        console.error('Error reading language preference:', error)
    }

    return null
}

/**
 * Save language preference to localStorage
 */
export function saveLanguage(language: LanguageCode): void {
    if (typeof window === 'undefined') return

    try {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, language)
    } catch (error) {
        console.error('Error saving language preference:', error)
    }
}

/**
 * Get the current language from Google Translate
 * Reads from the Google Translate cookie or iframe
 */
export function getCurrentLanguage(): LanguageCode {
    if (typeof window === 'undefined') return DEFAULT_LANGUAGE

    try {
        // Check Google Translate cookie
        const cookieMatch = document.cookie.match(
            /googtrans=\/[a-z]{2}\/([a-z]{2})/
        )
        if (cookieMatch && cookieMatch[1]) {
            const lang = cookieMatch[1]
            if (lang === 'en' || lang === 'es') {
                return lang
            }
        }

        // Check if page is translated by looking for Google Translate elements
        const gtFrame = document.querySelector('.goog-te-banner-frame')
        if (gtFrame) {
            // Page is translated, check which language
            const htmlLang = document.documentElement.lang
            if (htmlLang === 'es') {
                return 'es'
            }
        }
    } catch (error) {
        console.error('Error detecting current language:', error)
    }

    return DEFAULT_LANGUAGE
}

/**
 * Change the language using Google Translate
 * This triggers the translation by updating the Google Translate cookie
 */
export function changeLanguage(language: LanguageCode): void {
    if (typeof window === 'undefined') return

    try {
        // Save preference
        saveLanguage(language)

        // Get the Google Translate select element
        const select = document.querySelector(
            '.goog-te-combo'
        ) as HTMLSelectElement

        if (select) {
            // Set the value and trigger change event
            select.value = language
            select.dispatchEvent(new Event('change', { bubbles: true }))
        } else {
            // Fallback: Set cookie directly
            const domain = window.location.hostname
            document.cookie = `googtrans=/en/${language}; path=/; domain=${domain}`

            // Force page reload to apply translation
            window.location.reload()
        }
    } catch (error) {
        console.error('Error changing language:', error)
    }
}

/**
 * Initialize language on page load
 * Restores the saved language preference
 */
export function initializeLanguage(): void {
    if (typeof window === 'undefined') return

    try {
        const savedLang = getSavedLanguage()
        const currentLang = getCurrentLanguage()

        // If there's a saved preference and it's different from current, apply it
        if (savedLang && savedLang !== currentLang) {
            // Wait for Google Translate to initialize
            const checkInterval = setInterval(() => {
                const select = document.querySelector('.goog-te-combo')
                if (select) {
                    clearInterval(checkInterval)
                    changeLanguage(savedLang)
                }
            }, 100)

            // Stop checking after 5 seconds
            setTimeout(() => clearInterval(checkInterval), 5000)
        }
    } catch (error) {
        console.error('Error initializing language:', error)
    }
}

/**
 * Check if Google Translate is loaded and ready
 */
export function isGoogleTranslateReady(): boolean {
    if (typeof window === 'undefined') return false

    try {
        return !!(window as any).google?.translate?.TranslateElement
    } catch {
        return false
    }
}
