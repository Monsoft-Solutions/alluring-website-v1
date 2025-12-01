/**
 * User Agent Detection Utilities
 *
 * Detects browser, device type, and collects client metadata for feedback forms.
 * Uses modern User-Agent Client Hints API with fallback to user agent parsing.
 *
 * @module lib/utils/user-agent.util
 */

import type {
    BrowserType,
    DeviceType,
} from '@/lib/types/forms/beta-feedback.type'

/**
 * Extended Navigator interface for User-Agent Client Hints API
 */
type NavigatorUAData = {
    readonly brands: ReadonlyArray<{
        readonly brand: string
        readonly version: string
    }>
    readonly mobile: boolean
    readonly platform: string
}

type NetworkInformation = {
    readonly effectiveType?: '4g' | '3g' | '2g' | 'slow-2g'
    readonly downlink?: number
    readonly rtt?: number
    readonly saveData?: boolean
}

declare global {
    interface Navigator {
        readonly userAgentData?: NavigatorUAData
        readonly connection?: NetworkInformation
    }
}

/**
 * Client metadata collected from the browser
 */
export type ClientMetadata = {
    readonly screenWidth: number
    readonly screenHeight: number
    readonly viewportWidth: number
    readonly viewportHeight: number
    readonly devicePixelRatio: number
    readonly timezone: string
    readonly language: string
    readonly referrer: string | undefined
    readonly connectionType: string | undefined
}

/**
 * Detected user environment
 */
export type DetectedEnvironment = {
    readonly browser: BrowserType
    readonly device: DeviceType
    readonly metadata: ClientMetadata
}

/**
 * Detect browser type using User-Agent Client Hints with fallback
 *
 * Priority:
 * 1. navigator.userAgentData.brands (modern Chrome/Edge 90+)
 * 2. User agent string parsing (fallback for Safari/Firefox)
 */
export function detectBrowser(): BrowserType {
    if (typeof window === 'undefined') return 'other'

    const { navigator } = window

    // Modern approach: User-Agent Client Hints
    if (navigator.userAgentData?.brands) {
        const brands = navigator.userAgentData.brands.map((b) =>
            b.brand.toLowerCase()
        )

        // Check in order of specificity (Brave identifies as Chrome too)
        if (brands.some((b) => b.includes('brave'))) return 'brave'
        if (brands.some((b) => b.includes('edge') || b.includes('edg')))
            return 'edge'
        if (brands.some((b) => b.includes('chrome') || b.includes('chromium')))
            return 'chrome'
        if (brands.some((b) => b.includes('firefox'))) return 'firefox'
    }

    // Fallback: Parse user agent string
    const ua = navigator.userAgent.toLowerCase()

    // Order matters: check more specific browsers first
    if (ua.includes('brave')) return 'brave'
    if (ua.includes('edg/') || ua.includes('edge/')) return 'edge'
    if (ua.includes('firefox') || ua.includes('fxios')) return 'firefox'
    if (
        ua.includes('safari') &&
        !ua.includes('chrome') &&
        !ua.includes('crios')
    )
        return 'safari'
    if (ua.includes('chrome') || ua.includes('crios')) return 'chrome'

    return 'other'
}

/**
 * Detect device type using multiple signals
 *
 * Combines:
 * 1. userAgentData.mobile (most reliable when available)
 * 2. Touch capability detection
 * 3. User agent string parsing for specific devices
 * 4. Screen/viewport dimensions as secondary signal
 */
export function detectDevice(): DeviceType {
    if (typeof window === 'undefined') return 'desktop'

    const { navigator, screen, innerWidth } = window
    const ua = navigator.userAgent.toLowerCase()

    // Check for specific mobile devices in user agent
    const isIPhone = /iphone/.test(ua)
    const isIPad =
        /ipad/.test(ua) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    const isAndroid = /android/.test(ua)
    const isAndroidTablet = isAndroid && !/mobile/.test(ua)
    const isAndroidPhone = isAndroid && /mobile/.test(ua)

    // Specific device detection
    if (isIPhone) return 'mobile-iphone'
    if (isIPad) return 'tablet'
    if (isAndroidPhone) return 'mobile-android'
    if (isAndroidTablet) return 'tablet'

    // Use userAgentData.mobile if available
    if (navigator.userAgentData?.mobile) {
        // Mobile but couldn't determine specific type
        return isAndroid ? 'mobile-android' : 'mobile-iphone'
    }

    // Touch-capable device detection
    const hasTouch = navigator.maxTouchPoints > 0 || 'ontouchstart' in window
    const screenWidth = screen.width
    const viewportWidth = innerWidth

    // Tablet detection: touch capable + medium screen
    if (hasTouch && screenWidth >= 768 && screenWidth <= 1366) {
        return 'tablet'
    }

    // Small viewport likely mobile
    if (viewportWidth < 768 && hasTouch) {
        return 'mobile-android' // Default to Android for unknown mobile
    }

    // Large screen without touch indicators
    if (screenWidth > 1366 || !hasTouch) {
        return 'desktop'
    }

    // Medium-large touch screen could be laptop with touch
    if (hasTouch && screenWidth > 1366) {
        return 'laptop'
    }

    // Default to desktop for larger screens
    return screenWidth > 1024 ? 'desktop' : 'laptop'
}

/**
 * Collect client metadata from the browser
 */
export function getClientMetadata(): ClientMetadata {
    if (typeof window === 'undefined') {
        return {
            screenWidth: 0,
            screenHeight: 0,
            viewportWidth: 0,
            viewportHeight: 0,
            devicePixelRatio: 1,
            timezone: 'UTC',
            language: 'en',
            referrer: undefined,
            connectionType: undefined,
        }
    }

    const { navigator, screen, innerWidth, innerHeight, devicePixelRatio } =
        window

    return {
        screenWidth: screen.width,
        screenHeight: screen.height,
        viewportWidth: innerWidth,
        viewportHeight: innerHeight,
        devicePixelRatio: devicePixelRatio || 1,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: navigator.language,
        referrer: document.referrer || undefined,
        connectionType: navigator.connection?.effectiveType,
    }
}

/**
 * Detect full user environment including browser, device, and metadata
 */
export function detectUserEnvironment(): DetectedEnvironment {
    return {
        browser: detectBrowser(),
        device: detectDevice(),
        metadata: getClientMetadata(),
    }
}

/**
 * Get human-readable browser name for display
 */
export function getBrowserDisplayName(browser: BrowserType): string {
    const names: Record<BrowserType, string> = {
        chrome: 'Chrome',
        safari: 'Safari',
        firefox: 'Firefox',
        edge: 'Edge',
        brave: 'Brave',
        other: 'Other',
    }
    return names[browser]
}

/**
 * Get human-readable device name for display
 */
export function getDeviceDisplayName(device: DeviceType): string {
    const names: Record<DeviceType, string> = {
        desktop: 'Desktop',
        laptop: 'Laptop',
        tablet: 'Tablet',
        'mobile-iphone': 'Mobile (iPhone)',
        'mobile-android': 'Mobile (Android)',
        other: 'Other',
    }
    return names[device]
}
