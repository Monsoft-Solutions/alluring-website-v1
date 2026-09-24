/**
 * Analytics Type Definitions
 *
 * Type-safe definitions for Google Analytics 4 (GA4), Microsoft Clarity,
 * Facebook Pixel, and Consent Mode v2 integrations.
 */

/**
 * Google Analytics gtag function type
 */
export type GtagFunction = (
    command: 'config' | 'event' | 'consent' | 'set',
    targetOrAction: string,
    params?: Record<string, unknown>
) => void

/**
 * Microsoft Clarity global function type
 */
export type ClarityFunction = (command: string, ...args: unknown[]) => void

/**
 * Facebook Pixel global function type
 */
export type FacebookPixelFunction = (
    command: 'init' | 'track' | 'trackCustom',
    eventName?: string,
    params?: Record<string, unknown>
) => void

/**
 * Consent Mode v2 storage types
 * @see https://developers.google.com/tag-platform/devguides/consent
 */
export type ConsentStorageType =
    | 'ad_storage'
    | 'ad_user_data'
    | 'ad_personalization'
    | 'analytics_storage'
    | 'functionality_storage'
    | 'personalization_storage'
    | 'security_storage'

/**
 * Consent state values
 */
export type ConsentState = 'granted' | 'denied'

/**
 * Consent Mode configuration object
 */
export type ConsentConfig = Record<ConsentStorageType, ConsentState>

/**
 * Event parameters for GA4
 * Avoid PII - use only allowed parameters
 */
export interface EventParams {
    [key: string]: string | number | boolean | undefined
}

/**
 * Page view parameters
 */
export interface PageViewParams {
    page_title?: string
    page_location?: string
    page_path?: string
}

/**
 * Analytics configuration from environment
 */
export interface AnalyticsConfig {
    ga?: {
        measurementId: string
        enabled: boolean
    }
    clarity?: {
        projectId: string
        enabled: boolean
    }
    gtm?: {
        containerId: string
        enabled: boolean
    }
    facebookPixel?: {
        pixelId: string
        enabled: boolean
    }
}

/**
 * Extend Window interface for global analytics functions
 */
declare global {
    interface Window {
        gtag?: GtagFunction
        clarity?: ClarityFunction
        fbq?: FacebookPixelFunction
        _fbq?: FacebookPixelFunction
        dataLayer?: unknown[]
    }
}
