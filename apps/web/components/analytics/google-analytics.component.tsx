/**
 * Google Analytics Component
 *
 * Loads Google Analytics 4 (GA4) gtag.js script.
 * Only loads when NEXT_PUBLIC_GA_MEASUREMENT_ID is configured.
 *
 * @module components/analytics
 */

'use client'

import Script from 'next/script'

interface GoogleAnalyticsProps {
    measurementId: string
}

/**
 * Google Analytics Script Component
 *
 * Loads GA4 with optimal performance settings and Consent Mode v2.
 *
 * IMPORTANT: Consent defaults are set BEFORE gtag config to ensure
 * proper event tracking with consent mode.
 *
 * @example
 * ```tsx
 * <GoogleAnalytics measurementId="G-XXXXXXX" />
 * ```
 */
export function GoogleAnalytics({ measurementId }: GoogleAnalyticsProps) {
    // Determine if debug mode should be enabled
    const isDebugMode = process.env.NODE_ENV === 'development'

    return (
        <>
            {/* Step 1: Initialize dataLayer and set consent defaults BEFORE loading gtag */}
            <Script id='google-analytics-consent' strategy='afterInteractive'>
                {`
                    // Initialize dataLayer and gtag function
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    window.gtag = gtag;
                    
                    // Set consent defaults FIRST (before any GA scripts load)
                    // This is CRITICAL for proper event tracking with Consent Mode v2
                    gtag('consent', 'default', {
                        'ad_storage': 'denied',
                        'ad_user_data': 'denied',
                        'ad_personalization': 'denied',
                        'analytics_storage': 'denied',
                        'functionality_storage': 'granted',
                        'personalization_storage': 'denied',
                        'security_storage': 'granted',
                        'wait_for_update': 500
                    });
                `}
            </Script>

            {/* Step 2: Load gtag.js library */}
            <Script
                src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
                strategy='afterInteractive'
            />

            {/* Step 3: Initialize GA4 with config (after consent defaults are set) */}
            <Script id='google-analytics-init' strategy='afterInteractive'>
                {`
                    gtag('js', new Date());
                    gtag('config', '${measurementId}', {
                        page_path: window.location.pathname,
                        ${isDebugMode ? "'debug_mode': true," : ''}
                    });
                `}
            </Script>
        </>
    )
}
