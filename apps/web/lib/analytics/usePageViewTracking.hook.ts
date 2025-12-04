/**
 * Page View Tracking Hook
 *
 * Cookie-free page view tracking using sendBeacon (with fetch fallback).
 * Tracks page views asynchronously without blocking the UI.
 *
 * @module lib/analytics/usePageViewTracking
 */
'use client'

import { useCallback, useRef } from 'react'

import {
    type PageViewPayload,
    PAGE_VIEW_API_PATH,
    SESSION_ID_KEY,
} from '@/lib/types/analytics/page-view.type'

/**
 * Check if running in browser environment
 */
const isBrowser = (): boolean => typeof window !== 'undefined'

/**
 * Generate a unique session ID
 * Uses crypto.randomUUID() for secure random generation
 */
function generateSessionId(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID()
    }
    // Fallback for older browsers
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
}

/**
 * Get or create session ID from sessionStorage
 * Session ID persists for the browser tab session only (not across tabs)
 */
function getOrCreateSessionId(): string {
    if (!isBrowser()) return ''

    try {
        let sessionId = sessionStorage.getItem(SESSION_ID_KEY)
        if (!sessionId) {
            sessionId = generateSessionId()
            sessionStorage.setItem(SESSION_ID_KEY, sessionId)
        }
        return sessionId
    } catch {
        // sessionStorage may be disabled
        return generateSessionId()
    }
}

/**
 * Extract UTM parameters from URL
 */
function extractUTMFromURL(): Partial<PageViewPayload> {
    if (!isBrowser()) return {}

    const params = new URLSearchParams(window.location.search)

    return {
        utmSource: params.get('utm_source') ?? undefined,
        utmMedium: params.get('utm_medium') ?? undefined,
        utmCampaign: params.get('utm_campaign') ?? undefined,
        utmContent: params.get('utm_content') ?? undefined,
        utmTerm: params.get('utm_term') ?? undefined,
    }
}

/**
 * Send page view data to the API
 * Uses sendBeacon for reliable delivery, falls back to fetch
 */
function sendPageView(payload: PageViewPayload): void {
    if (!isBrowser()) return

    const data = JSON.stringify(payload)
    const url = PAGE_VIEW_API_PATH

    // Prefer sendBeacon - it's designed for analytics and works during page unload
    if (navigator.sendBeacon) {
        const blob = new Blob([data], { type: 'application/json' })
        const sent = navigator.sendBeacon(url, blob)
        if (sent) return
    }

    // Fallback to fetch with keepalive
    fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: data,
        keepalive: true,
    }).catch(() => {
        // Silently fail - analytics should never break the user experience
    })
}

/**
 * Return type for usePageViewTracking hook
 */
type UsePageViewTrackingReturn = {
    /** Track a page view with the given path */
    readonly trackPageView: (pathname: string, searchParams?: string) => void
}

/**
 * Hook for tracking page views without cookies
 *
 * Features:
 * - Session ID stored in sessionStorage (not a cookie)
 * - Uses sendBeacon for reliable, non-blocking delivery
 * - Debounces rapid navigation to prevent duplicate tracking
 * - Extracts UTM parameters automatically
 *
 * @example
 * ```tsx
 * const { trackPageView } = usePageViewTracking()
 *
 * useEffect(() => {
 *   trackPageView(pathname, searchParams?.toString())
 * }, [pathname, searchParams, trackPageView])
 * ```
 */
export function usePageViewTracking(): UsePageViewTrackingReturn {
    const lastTrackedRef = useRef<string | null>(null)
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

    const trackPageView = useCallback(
        (pathname: string, searchParams?: string) => {
            if (!isBrowser()) return

            // Construct full path
            const fullPath = searchParams
                ? `${pathname}?${searchParams}`
                : pathname

            // Skip if same path was just tracked (debounce rapid navigation)
            if (lastTrackedRef.current === fullPath) return

            // Clear any pending debounce timer
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current)
            }

            // Debounce to handle rapid navigation
            debounceTimerRef.current = setTimeout(() => {
                const sessionId = getOrCreateSessionId()
                const utmParams = extractUTMFromURL()

                const payload: PageViewPayload = {
                    pagePath: pathname,
                    pageUrl: window.location.href,
                    pageTitle: document.title || undefined,
                    referrer: document.referrer || undefined,
                    sessionId,
                    ...utmParams,
                }

                sendPageView(payload)
                lastTrackedRef.current = fullPath
            }, 100)
        },
        []
    )

    return { trackPageView }
}
