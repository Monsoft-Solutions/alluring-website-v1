/**
 * Google Translate Initialization Component
 *
 * Client-side only component to load and initialize Google Translate.
 * Separated from layout to avoid hydration errors.
 */
'use client'

import { useEffect } from 'react'
import Script from 'next/script'

// Type definitions for Google Translate API
declare global {
    interface Window {
        google?: {
            translate: {
                TranslateElement: {
                    new (
                        config: {
                            pageLanguage: string
                            includedLanguages: string
                            layout: number
                            autoDisplay: boolean
                        },
                        elementId: string
                    ): void
                    InlineLayout: {
                        SIMPLE: number
                    }
                }
            }
        }
        googleTranslateElementInit?: () => void
    }
}

export function GoogleTranslateInit() {
    useEffect(() => {
        // Initialize Google Translate when script loads
        if (typeof window !== 'undefined') {
            window.googleTranslateElementInit = function () {
                if (window.google?.translate?.TranslateElement) {
                    new window.google.translate.TranslateElement(
                        {
                            pageLanguage: 'en',
                            includedLanguages: 'en,es',
                            layout: window.google.translate.TranslateElement
                                .InlineLayout.SIMPLE,
                            autoDisplay: false,
                        },
                        'google_translate_element'
                    )
                }
            }
        }
    }, [])

    return (
        <>
            {/* Hidden Google Translate Element - Required for initialization */}
            <div
                id='google_translate_element'
                style={{ display: 'none' }}
                suppressHydrationWarning
            />
            {/* Load Google Translate Script */}
            <Script
                src='https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit'
                strategy='afterInteractive'
                id='google-translate-script'
            />
        </>
    )
}
