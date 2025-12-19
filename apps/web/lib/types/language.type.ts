/**
 * Language Type Definitions
 *
 * Type definitions for the language switcher and translation system.
 */

/**
 * Supported language codes
 */
export type LanguageCode = 'en' | 'es'

/**
 * Language configuration
 */
export type Language = {
    code: LanguageCode
    name: string
    flag: string
    label: string
}

/**
 * Available languages configuration
 */
export const LANGUAGES: Record<LanguageCode, Language> = {
    en: {
        code: 'en',
        name: 'English',
        flag: '🇺🇸',
        label: 'English',
    },
    es: {
        code: 'es',
        name: 'Spanish',
        flag: '🇪🇸',
        label: 'Español',
    },
} as const

/**
 * Default language
 */
export const DEFAULT_LANGUAGE: LanguageCode = 'en'

/**
 * LocalStorage key for language preference
 */
export const LANGUAGE_STORAGE_KEY = 'preferred-language'
