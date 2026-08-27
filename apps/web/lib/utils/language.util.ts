/**
 * Language Utility Functions
 *
 * Utilities for managing language preference and Google Translate integration.
 */

import { loadGoogleTranslate } from '@/lib/utils/google-translate.util'
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
 * Write (or clear) the `googtrans` cookie Google Translate reads on load.
 *
 * Set on the hostname, the base domain and with no domain at all, because a
 * stale copy on any one of the three wins over the others and strands the page
 * in the wrong language.
 */
function writeTranslationCookie(language: LanguageCode): void {
    const hostname = window.location.hostname
    const domainParts = hostname.split('.')
    const baseDomain =
        domainParts.length >= 2
            ? `.${domainParts.slice(-2).join('.')}`
            : hostname

    const domains = [hostname, baseDomain, '']

    if (language === 'en') {
        // English is the source language — the translation is cleared, not set.
        domains.forEach((domain) => {
            const domainPath = domain ? `; domain=${domain}` : ''
            document.cookie = `googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT${domainPath}`
            document.cookie = `googtrans=/en/en; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT${domainPath}`
            document.cookie = `googtrans=/en/en; path=/${domainPath}`
        })
        return
    }

    domains.forEach((domain) => {
        const domainPath = domain ? `; domain=${domain}` : ''
        document.cookie = `googtrans=/en/${language}; path=/${domainPath}`
    })
}

/**
 * Change the language using Google Translate.
 *
 * Loads the widget on first use — it is no longer on the page by default.
 *
 * Async because the first switch into Spanish has to wait for that script.
 * Callers that want to show a pending state can await it; it does not reject.
 *
 * @returns `true` when the page is now in `language`, `false` when the widget
 * could not be loaded. On failure the stored preference and the `googtrans`
 * cookie are rolled back, so the UI can keep showing English rather than
 * claiming a translation that did not happen — and so the next page load does
 * not retry a fetch that is being blocked.
 */
export async function changeLanguage(language: LanguageCode): Promise<boolean> {
    if (typeof window === 'undefined') return false

    const previousLanguage = getCurrentLanguage()
    const previousSaved = getSavedLanguage()

    try {
        // Save preference
        saveLanguage(language)

        const isTranslated = previousLanguage !== DEFAULT_LANGUAGE

        // Nothing to undo: the visitor is asking for the language the page is
        // already served in, and nothing has translated it. Returning here is
        // what keeps a stray click on the EN flag from costing a full page
        // reload.
        if (language === DEFAULT_LANGUAGE && !isTranslated) return true

        writeTranslationCookie(language)

        if (language === DEFAULT_LANGUAGE) {
            // Google Translate exposes no clean way to undo a translation in
            // place. Reloading with the cookie cleared is what restores the
            // source text, and it works whether or not the script ever loaded.
            window.location.reload()
            return true
        }

        // Loading the widget applies the cookie written above — it translates
        // the current document in place, so there is nothing to do afterwards
        // and no reload to pay for.
        await loadGoogleTranslate()
        return true
    } catch (error) {
        console.error('Error changing language:', error)

        // Undo everything the failed attempt wrote. Leaving `googtrans=/en/es`
        // behind would make `getCurrentLanguage()` report Spanish forever on an
        // English page, and would make `initializeLanguage` re-attempt the same
        // failing fetch on every subsequent page load.
        try {
            writeTranslationCookie(previousLanguage)
            if (previousSaved) {
                saveLanguage(previousSaved)
            } else {
                localStorage.removeItem(LANGUAGE_STORAGE_KEY)
            }
        } catch (rollbackError) {
            console.error(
                'Error rolling back language preference:',
                rollbackError
            )
        }

        return false
    }
}

/**
 * Initialize language on page load
 * Restores the saved language preference
 *
 * This is the one path that loads Google Translate without a click: a visitor
 * who previously chose Spanish still lands on a Spanish page. Everyone else
 * pays nothing, because a saved preference of English (or none at all) matches
 * what the server already sent.
 */
export async function initializeLanguage(): Promise<void> {
    if (typeof window === 'undefined') return

    try {
        // `getCurrentLanguage` reads the `googtrans` cookie, which records what
        // the visitor last asked for — not what the page is currently showing.
        // With the widget no longer loading by default, the cookie alone
        // translates nothing, so this must not be treated as "already Spanish"
        // and skipped.
        const desired = getSavedLanguage() ?? getCurrentLanguage()

        if (desired === DEFAULT_LANGUAGE) return

        await changeLanguage(desired)
    } catch (error) {
        console.error('Error initializing language:', error)
    }
}
