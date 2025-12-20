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
        // Check Google Translate cookies (there might be multiple)
        const cookies = document.cookie.split(';')
        let detectedLang: LanguageCode | null = null

        for (const cookie of cookies) {
            const [name, value] = cookie.trim().split('=')
            if (name === 'googtrans' && value) {
                const match = value.match(/^\/[a-z]{2}\/([a-z]{2})/)
                if (match && match[1]) {
                    const lang = match[1] as LanguageCode
                    if (lang === 'en' || lang === 'es') {
                        // If we find 'es', prioritize it as it means translation is active
                        if (lang === 'es') return 'es'
                        detectedLang = lang
                    }
                }
            }
        }

        if (detectedLang) return detectedLang

        // Check if page is translated by looking for Google Translate elements
        // This is a backup in case cookies are not accessible or clear
        const htmlLang = document.documentElement.lang
        if (htmlLang && htmlLang.startsWith('es')) {
            return 'es'
        }

        const gtFrame = document.querySelector('.goog-te-banner-frame')
        if (gtFrame) {
            return 'es'
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

        // Always update the cookie for consistency across reloads
        // We set it for both the current domain and the base domain to ensure it's overwritten
        const hostname = window.location.hostname
        const domainParts = hostname.split('.')
        const baseDomain =
            domainParts.length >= 2
                ? `.${domainParts.slice(-2).join('.')}`
                : hostname

        const domains = [hostname, baseDomain, '']

        // If switching to English (default), we want to clear the translation
        if (language === 'en') {
            domains.forEach((domain) => {
                const domainPath = domain ? `; domain=${domain}` : ''
                // Clear googtrans cookie
                document.cookie = `googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT${domainPath}`
                document.cookie = `googtrans=/en/en; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT${domainPath}`
                // Also try setting it to /en/en just in case
                document.cookie = `googtrans=/en/en; path=/${domainPath}`
            })
        } else {
            domains.forEach((domain) => {
                const domainPath = domain ? `; domain=${domain}` : ''
                document.cookie = `googtrans=/en/${language}; path=/${domainPath}`
            })
        }

        if (select) {
            // Set the value and trigger change event
            select.value = language
            select.dispatchEvent(new Event('change', { bubbles: true }))

            // If switching back to English, sometimes a reload is safer to completely clear Google Translate's state
            if (language === 'en') {
                setTimeout(() => {
                    window.location.reload()
                }, 100)
            }
        } else {
            // Force page reload to apply translation if select is not available
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
        const win = window as unknown as {
            google?: {
                translate?: {
                    TranslateElement?: unknown
                }
            }
        }
        return !!win.google?.translate?.TranslateElement
    } catch {
        return false
    }
}
