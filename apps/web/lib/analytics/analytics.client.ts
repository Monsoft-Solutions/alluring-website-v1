/**
 * Analytics Client Utilities
 *
 * Browser-only wrappers for Google Analytics 4 (GA4) and Microsoft Clarity.
 * All functions include server-side rendering (SSR) guards.
 *
 * @module analytics.client
 */
import { publicEnv } from '@/lib/env/public-env'

import type {
    EventParams,
    PageViewParams,
    ScrollDepthParams,
} from './analytics.types'

/**
 * Check if code is running in browser context
 * @internal
 */
const isBrowser = (): boolean => typeof window !== 'undefined'

/**
 * Check if Google Analytics (gtag) is available
 * @internal
 */
const isGtagAvailable = (): boolean => isBrowser() && !!window.gtag

/**
 * Check if Microsoft Clarity is available
 * @internal
 */
const isClarityAvailable = (): boolean => isBrowser() && !!window.clarity

/**
 * Track a custom event to Google Analytics
 *
 * @param eventName - The event name (use lowercase, snake_case)
 * @param params - Event parameters (avoid PII)
 *
 * @example
 * ```ts
 * trackEvent('button_click', {
 *   button_name: 'subscribe_cta',
 *   page_section: 'hero'
 * })
 * ```
 */
export function trackEvent(eventName: string, params?: EventParams): void {
    if (!isGtagAvailable()) return

    try {
        window.gtag!('event', eventName, params ?? {})
    } catch (error) {
        if (publicEnv.NODE_ENV === 'development') {
            console.error('Analytics: Failed to track event', error)
        }
    }
}

/**
 * Track a page view to Google Analytics
 *
 * @param params - Page view parameters
 *
 * @example
 * ```ts
 * trackPageView({
 *   page_title: 'About Us',
 *   page_path: '/about'
 * })
 * ```
 */
export function trackPageView(params?: PageViewParams): void {
    if (!isGtagAvailable()) return

    try {
        // GA4 automatically tracks page_view on initial load
        // This is for manual tracking (e.g., SPA navigation)
        window.gtag!('event', 'page_view', {
            page_title: params?.page_title ?? document.title,
            page_location: params?.page_location ?? window.location.href,
            page_path: params?.page_path ?? window.location.pathname,
        })
    } catch (error) {
        if (publicEnv.NODE_ENV === 'development') {
            console.error('Analytics: Failed to track page view', error)
        }
    }
}

/**
 * Track scroll depth milestone
 *
 * @param params - Scroll depth parameters
 *
 * @example
 * ```ts
 * trackScrollDepth({ percent: 75, page_path: '/blog/article' })
 * ```
 */
export function trackScrollDepth(params: ScrollDepthParams): void {
    if (!isGtagAvailable()) return

    try {
        trackEvent('scroll_depth', {
            percent: params.percent,
            page_path: params.page_path ?? window.location.pathname,
        })
        if (publicEnv.NODE_ENV === 'development') {
            console.log('Analytics: Tracked scroll depth', params)
        }
    } catch (error) {
        if (publicEnv.NODE_ENV === 'development') {
            console.error('Analytics: Failed to track scroll depth', error)
        }
    }
}

/**
 * Track a custom event to Microsoft Clarity
 *
 * @param eventName - The event name
 * @param eventData - Optional event data
 *
 * @example
 * ```ts
 * trackClarityEvent('form_submit', { form_name: 'contact' })
 * ```
 */
export function trackClarityEvent(
    eventName: string,
    eventData?: Record<string, unknown>
): void {
    if (!isClarityAvailable()) return

    try {
        if (eventData) {
            window.clarity!('set', eventName, JSON.stringify(eventData))
        } else {
            window.clarity!('event', eventName)
        }
    } catch (error) {
        if (publicEnv.NODE_ENV === 'development') {
            console.error('Analytics: Failed to track Clarity event', error)
        }
    }
}

/**
 * Identify a user in Microsoft Clarity
 * Use only non-PII identifiers (e.g., hashed user ID)
 *
 * @param userId - Non-PII user identifier
 * @param sessionId - Optional session identifier
 * @param pageId - Optional page identifier
 *
 * @example
 * ```ts
 * identifyClarityUser('hashed_user_123')
 * ```
 */
export function identifyClarityUser(
    userId: string,
    sessionId?: string,
    pageId?: string
): void {
    if (!isClarityAvailable()) return

    try {
        window.clarity!('identify', userId, sessionId, pageId)
    } catch (error) {
        if (publicEnv.NODE_ENV === 'development') {
            console.error('Analytics: Failed to identify Clarity user', error)
        }
    }
}

/**
 * Upgrade Clarity session recording to full fidelity
 * Use this for important user flows (e.g., checkout, onboarding)
 *
 * @example
 * ```ts
 * upgradeClaritySession()
 * ```
 */
export function upgradeClaritySession(): void {
    if (!isClarityAvailable()) return

    try {
        window.clarity!('upgrade', 'high')
    } catch (error) {
        if (publicEnv.NODE_ENV === 'development') {
            console.error('Analytics: Failed to upgrade Clarity session', error)
        }
    }
}
