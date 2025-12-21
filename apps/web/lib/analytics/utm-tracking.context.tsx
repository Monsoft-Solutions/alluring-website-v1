/**
 * UTM Tracking Context & Provider
 *
 * Captures UTM parameters and ad platform click IDs on landing,
 * persists them in localStorage across page navigation, and provides
 * a hook for forms to include tracking data in submissions.
 *
 * @module analytics/utm-tracking
 */
'use client'

import {
    createContext,
    useContext,
    useEffect,
    useState,
    useTransition,
    type ReactNode,
} from 'react'

import {
    type UTMData,
    UTM_STORAGE_KEY,
} from '@/lib/types/analytics/utm-tracking.type'

/**
 * Context value for UTM tracking
 */
type UTMTrackingContextValue = {
    /** Current UTM data (from localStorage or URL) */
    readonly utmData: UTMData | null
    /** Whether the provider has initialized */
    readonly isInitialized: boolean
}

const UTMTrackingContext = createContext<UTMTrackingContextValue | undefined>(
    undefined
)

/**
 * Check if running in browser environment
 */
const isBrowser = (): boolean => typeof window !== 'undefined'

/**
 * Extract UTM parameters and click IDs from URL search params
 */
function extractUTMFromURL(): UTMData | null {
    if (!isBrowser()) return null

    const params = new URLSearchParams(window.location.search)

    const utmSource = params.get('utm_source')
    const utmMedium = params.get('utm_medium')
    const utmCampaign = params.get('utm_campaign')
    const utmContent = params.get('utm_content')
    const utmTerm = params.get('utm_term')
    const gclid = params.get('gclid')
    const fbclid = params.get('fbclid')
    const ttclid = params.get('ttclid')

    // Return null if no tracking params present
    const hasAnyParam =
        utmSource ||
        utmMedium ||
        utmCampaign ||
        utmContent ||
        utmTerm ||
        gclid ||
        fbclid ||
        ttclid

    if (!hasAnyParam) return null

    return {
        utmSource: utmSource ?? undefined,
        utmMedium: utmMedium ?? undefined,
        utmCampaign: utmCampaign ?? undefined,
        utmContent: utmContent ?? undefined,
        utmTerm: utmTerm ?? undefined,
        gclid: gclid ?? undefined,
        fbclid: fbclid ?? undefined,
        ttclid: ttclid ?? undefined,
        referrer: document.referrer || undefined,
        landingPage: window.location.href,
    }
}

/**
 * Get stored UTM data from localStorage
 */
function getStoredUTMData(): UTMData | null {
    if (!isBrowser()) return null

    try {
        const stored = localStorage.getItem(UTM_STORAGE_KEY)
        if (!stored) return null
        return JSON.parse(stored) as UTMData
    } catch {
        return null
    }
}

/**
 * Store UTM data in localStorage
 */
function storeUTMData(data: UTMData): void {
    if (!isBrowser()) return

    try {
        localStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(data))
    } catch {
        // localStorage may be full or disabled
    }
}

type UTMTrackingProviderProps = {
    readonly children: ReactNode
}

/**
 * UTM Tracking Provider
 *
 * Captures UTM parameters from URL on initial landing and persists
 * them in localStorage for attribution tracking across page navigation.
 *
 * @example
 * ```tsx
 * // In providers.tsx
 * <UTMTrackingProvider>
 *   <App />
 * </UTMTrackingProvider>
 *
 * // In form component
 * const { utmData } = useUTMTracking()
 * ```
 */
export function UTMTrackingProvider({ children }: UTMTrackingProviderProps) {
    // Initialize from stored data using useState initializer
    const [utmData, setUtmData] = useState<UTMData | null>(() => {
        if (typeof window === 'undefined') return null
        return getStoredUTMData()
    })
    const [isInitialized, setIsInitialized] = useState(false)
    const [, startTransition] = useTransition()

    useEffect(() => {
        // Extract UTM from current URL (needs to happen after mount)
        const urlData = extractUTMFromURL()

        if (urlData) {
            // New UTM params in URL - store and use them
            // This overwrites any existing stored data when user arrives with new UTMs
            storeUTMData(urlData)
            startTransition(() => {
                setUtmData(urlData)
            })
        }

        startTransition(() => {
            setIsInitialized(true)
        })
    }, [startTransition])

    return (
        <UTMTrackingContext.Provider value={{ utmData, isInitialized }}>
            {children}
        </UTMTrackingContext.Provider>
    )
}

/**
 * Hook to access UTM tracking data
 *
 * @returns UTM data and initialization state
 * @throws Error if used outside UTMTrackingProvider
 *
 * @example
 * ```tsx
 * function ContactForm() {
 *   const { utmData } = useUTMTracking()
 *
 *   const handleSubmit = async (formData) => {
 *     await submitForm({
 *       ...formData,
 *       ...utmData, // Include UTM data in submission
 *     })
 *   }
 * }
 * ```
 */
export function useUTMTracking(): UTMTrackingContextValue {
    const context = useContext(UTMTrackingContext)

    if (context === undefined) {
        throw new Error(
            'useUTMTracking must be used within UTMTrackingProvider'
        )
    }

    return context
}
