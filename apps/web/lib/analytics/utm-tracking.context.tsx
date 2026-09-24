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
    type ReactNode,
} from 'react'

import { readAttributionParam } from '@/lib/analytics/attribution-params.util'
import {
    type UTMData,
    type UTMParamName,
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
    const read = (name: UTMParamName) => readAttributionParam(params, name)

    const data = {
        utmSource: read('utm_source'),
        utmMedium: read('utm_medium'),
        utmCampaign: read('utm_campaign'),
        utmContent: read('utm_content'),
        utmTerm: read('utm_term'),
        gclid: read('gclid'),
        gbraid: read('gbraid'),
        wbraid: read('wbraid'),
        gadCampaignId: read('gad_campaignid'),
        fbclid: read('fbclid'),
        ttclid: read('ttclid'),
    }

    // Return null if no tracking params present
    if (!Object.values(data).some(Boolean)) return null

    return {
        ...data,
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
    // Always initialize to null to avoid hydration mismatch
    // localStorage will be read in useEffect (client-only)
    const [utmData, setUtmData] = useState<UTMData | null>(null)
    const [isInitialized, setIsInitialized] = useState(false)

    useEffect(() => {
        // Guard against SSR
        if (typeof window === 'undefined') return

        // Extract UTM from current URL (needs to happen after mount)
        const urlData = extractUTMFromURL()

        if (urlData) {
            // New UTM params in URL - store and use them
            // This overwrites any existing stored data when user arrives with new UTMs
            storeUTMData(urlData)
            // eslint-disable-next-line react-hooks/set-state-in-effect -- Synchronizing with external system (URL params) on mount, runs once
            setUtmData(urlData)
        } else {
            // No URL params - load from localStorage if available
            const storedData = getStoredUTMData()
            if (storedData) {
                setUtmData(storedData)
            }
        }

        setIsInitialized(true)
    }, [])

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
