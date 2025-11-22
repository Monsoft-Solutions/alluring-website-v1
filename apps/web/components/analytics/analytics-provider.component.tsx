/**
 * Analytics Provider Component
 *
 * Conditionally loads analytics scripts based on:
 * 1. Environment configuration (analytics services enabled)
 * 2. User consent (only loads when consent is granted)
 *
 * Centralizes all analytics service integrations in a single component.
 *
 * Supported services:
 * - Google Analytics 4 (GA4)
 * - Google Tag Manager (GTM)
 * - Microsoft Clarity
 * - Facebook Pixel
 *
 * @example
 * ```tsx
 * // In your root layout, inside Providers
 * <Providers>
 *   <AnalyticsProvider />
 *   {/* ... rest of app ... *\/}
 * </Providers>
 * ```
 */

'use client'

import { getAnalyticsConfig } from '@/lib/analytics/config'
import { useConsent } from '@/lib/analytics/consent.context'

import { Clarity } from './Clarity.component'
import { FacebookPixel } from './FacebookPixel.component'
import { GoogleAnalytics } from './GoogleAnalytics.component'
import { GoogleTagManager } from './GoogleTagManager.component'

export function AnalyticsProvider() {
    const analyticsConfig = getAnalyticsConfig()
    const { consentState } = useConsent()

    // Don't load analytics scripts until user has granted consent
    // This ensures GDPR/privacy compliance
    if (consentState !== 'granted') {
        return null
    }

    return (
        <>
            {/* Google Analytics 4 */}
            {analyticsConfig.ga?.enabled && (
                <GoogleAnalytics
                    measurementId={analyticsConfig.ga.measurementId}
                />
            )}

            {/* Google Tag Manager */}
            {analyticsConfig.gtm?.enabled && (
                <GoogleTagManager
                    containerId={analyticsConfig.gtm.containerId}
                />
            )}

            {/* Microsoft Clarity */}
            {analyticsConfig.clarity?.enabled && (
                <Clarity projectId={analyticsConfig.clarity.projectId} />
            )}

            {/* Facebook Pixel */}
            {analyticsConfig.facebookPixel?.enabled && (
                <FacebookPixel
                    pixelId={analyticsConfig.facebookPixel.pixelId}
                />
            )}
        </>
    )
}
