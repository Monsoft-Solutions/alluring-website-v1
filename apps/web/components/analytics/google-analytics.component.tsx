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
 * Loads GA4 with optimal performance settings.
 * Automatically integrates with Consent Mode v2.
 *
 * @example
 * ```tsx
 * <GoogleAnalytics measurementId="G-XXXXXXX" />
 * ```
 */
export function GoogleAnalytics({ measurementId }: GoogleAnalyticsProps) {
    return (
        <>
            {/* Load gtag.js library */}
            <Script
                src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
                strategy='afterInteractive'
            />

            {/* Initialize gtag with measurement ID */}
            <Script id='google-analytics-init' strategy='afterInteractive'>
                {`
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    window.gtag = gtag;
                    gtag('js', new Date());
                    gtag('config', '${measurementId}', {
                        page_path: window.location.pathname,
                    });
                `}
            </Script>
        </>
    )
}
