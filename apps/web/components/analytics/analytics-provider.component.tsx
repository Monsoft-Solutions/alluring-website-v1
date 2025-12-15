/**
 * Analytics Provider Component
 *
 * Conditionally loads analytics scripts based on environment configuration.
 * Scripts load automatically when their respective environment variables are set.
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
 * // In your root layout
 * <AnalyticsProvider />
 * ```
 */

'use client'

import { getAnalyticsConfig } from '@/lib/analytics/config'

import { Clarity } from './clarity.component'
import { FacebookPixel } from './facebook-pixel.component'
import { GoogleAnalytics } from './google-analytics.component'
import { GoogleTagManager } from './google-tag-manager.component'

export function AnalyticsProvider() {
    const analyticsConfig = getAnalyticsConfig()

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
