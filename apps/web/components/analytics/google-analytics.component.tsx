/**
 * Google Analytics Component
 *
 * Loads Google Analytics 4 (GA4) gtag.js script.
 * Only loads when NEXT_PUBLIC_GA_MEASUREMENT_ID is configured.
 *
 * Implements Consent Mode v2 with proper timing:
 * 1. Sets default consent to GRANTED (no cookie banner required)
 * 2. Initializes GA4 with consent respected from first event
 *
 * Note: This implementation grants consent by default.
 * If you need GDPR/CCPA compliance, use the cookie banner version instead.
 *
 * @module components/analytics
 */

'use client'

import { usePathname } from 'next/navigation'
import Script from 'next/script'

import { getPageContext } from '@/lib/analytics/page-context'
import { publicEnv } from '@/lib/env/public-env'

interface GoogleAnalyticsProps {
    measurementId: string
}

/**
 * Google Analytics Script Component
 *
 * Loads GA4 with optimal performance settings.
 * Automatically integrates with Consent Mode v2.
 *
 * Analytics tracking is enabled by default (no user consent required).
 *
 * @example
 * ```tsx
 * <GoogleAnalytics measurementId="G-XXXXXXX" />
 * ```
 */
export function GoogleAnalytics({ measurementId }: GoogleAnalyticsProps) {
    const isDevelopment = publicEnv.NODE_ENV === 'development'
    // The landing page's context for the initial page_view (issue #279).
    // `PageViewTracker` sends every later page view, and `trackEvent` adds
    // the current page's context to every event.
    const pageContext = JSON.stringify(getPageContext(usePathname()))

    return (
        <>
            {/* Load gtag.js library */}
            <Script
                src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
                strategy='afterInteractive'
            />

            {/* Initialize gtag with measurement ID and Consent Mode v2 */}
            <Script id='google-analytics-init' strategy='afterInteractive'>
                {`
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    window.gtag = gtag;
                    
                    // CRITICAL: Set default consent BEFORE gtag('config')
                    // Consent is GRANTED by default (no cookie banner required)
                    gtag('consent', 'default', {
                        'ad_storage': 'granted',
                        'ad_user_data': 'granted',
                        'ad_personalization': 'granted',
                        'analytics_storage': 'granted',
                        'functionality_storage': 'granted',
                        'personalization_storage': 'granted',
                        'security_storage': 'granted'
                    });
                    
                    // Initialize GA4 (analytics enabled immediately)
                    gtag('js', new Date());
                    gtag('config', '${measurementId}', {
                        page_path: window.location.pathname,
                        send_page_view: false,${isDevelopment ? '\n                        debug_mode: true,' : ''}
                    });

                    // The initial page view, sent here rather than by config
                    // so it carries the page context: config parameters can't
                    // change after a client navigation, so they can't hold it.
                    // This config runs before GTM's Google tag configures the
                    // same ID, which is then a no-op and sends no page_view.
                    gtag('event', 'page_view', ${pageContext});
                    
                    ${isDevelopment ? "console.log('Analytics: GA4 initialized (consent granted by default)');" : ''}
                `}
            </Script>
        </>
    )
}
