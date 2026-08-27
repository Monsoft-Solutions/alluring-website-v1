/**
 * Consent Context & Provider
 *
 * React context for managing user consent preferences.
 * Provides hooks for updating and checking consent state.
 *
 * @module consent.context
 */

'use client'

import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
    useTransition,
} from 'react'

import { publicEnv } from '@/lib/env/public-env'

import type { ConsentState } from './analytics.types'
import {
    ACCEPTED_CONSENT_CONFIG,
    ESSENTIAL_CONSENT_CONFIG,
    clearConsentState,
    getStoredConsentState,
    storeConsentState,
    updateConsent,
} from './consent.util'

/**
 * Consent context value
 */
interface ConsentContextValue {
    /**
     * Current analytics consent state
     */
    consentState: ConsentState | null

    /**
     * Whether consent has been explicitly set by user
     */
    hasConsented: boolean

    /**
     * Whether the consent provider has finished initializing (client-side only)
     */
    isInitialized: boolean

    /**
     * Accept all cookies
     */
    acceptAll: () => void

    /**
     * Accept only essential cookies
     */
    acceptEssential: () => void

    /**
     * Revoke consent (reset to default)
     */
    revokeConsent: () => void
}

const ConsentContext = createContext<ConsentContextValue | undefined>(undefined)

/**
 * Consent Provider Props
 */
interface ConsentProviderProps {
    children: React.ReactNode
}

/**
 * Consent Provider Component
 *
 * Manages consent state and provides methods to update consent.
 * Should be placed high in the component tree (e.g., in providers).
 *
 * @example
 * ```tsx
 * <ConsentProvider>
 *   <App />
 * </ConsentProvider>
 * ```
 */
export function ConsentProvider({ children }: ConsentProviderProps) {
    // Initialize from stored consent using useState initializer
    const [consentState, setConsentState] = useState<ConsentState | null>(
        () => {
            if (typeof window === 'undefined') return null
            return getStoredConsentState()
        }
    )
    const [hasConsented, setHasConsented] = useState(() => {
        if (typeof window === 'undefined') return false
        return !!getStoredConsentState()
    })
    const [isInitialized, setIsInitialized] = useState(false)
    const [, startTransition] = useTransition()

    // Apply stored consent to gtag on mount if available
    // Note: Default consent is now set inline in GoogleAnalytics component
    useEffect(() => {
        if (consentState) {
            // Apply stored consent to gtag if available
            // This handles cases where user already consented on previous visit
            if (consentState === 'granted') {
                updateConsent(ACCEPTED_CONSENT_CONFIG)
            } else {
                updateConsent(ESSENTIAL_CONSENT_CONFIG)
            }
        }

        // Mark as initialized (wrapped in startTransition to avoid lint error)
        startTransition(() => {
            setIsInitialized(true)
        })

        if (publicEnv.NODE_ENV === 'development') {
            console.log('Analytics: ConsentProvider initialized')
        }
    }, [consentState, startTransition])

    /**
     * Accept all cookies
     */
    const acceptAll = useCallback(() => {
        updateConsent(ACCEPTED_CONSENT_CONFIG)
        storeConsentState('granted')
        setConsentState('granted')
        setHasConsented(true)

        if (publicEnv.NODE_ENV === 'development') {
            console.log('Analytics: User accepted all cookies')
        }
    }, [])

    /**
     * Accept only essential cookies
     */
    const acceptEssential = useCallback(() => {
        updateConsent(ESSENTIAL_CONSENT_CONFIG)
        storeConsentState('denied')
        setConsentState('denied')
        setHasConsented(true)

        if (publicEnv.NODE_ENV === 'development') {
            console.log('Analytics: User accepted essential cookies only')
        }
    }, [])

    /**
     * Revoke consent (reset to default)
     */
    const revokeConsent = useCallback(() => {
        updateConsent(ESSENTIAL_CONSENT_CONFIG)
        clearConsentState()
        setConsentState(null)
        setHasConsented(false)

        if (publicEnv.NODE_ENV === 'development') {
            console.log('Analytics: User revoked consent')
        }
    }, [])

    const value: ConsentContextValue = {
        consentState,
        hasConsented,
        isInitialized,
        acceptAll,
        acceptEssential,
        revokeConsent,
    }

    return (
        <ConsentContext.Provider value={value}>
            {children}
        </ConsentContext.Provider>
    )
}

/**
 * Hook to access consent context
 *
 * @throws Error if used outside ConsentProvider
 *
 * @example
 * ```tsx
 * function CookieBanner() {
 *   const { hasConsented, acceptAll, acceptEssential } = useConsent()
 *
 *   if (hasConsented) return null
 *
 *   return (
 *     <div>
 *       <button onClick={acceptAll}>Accept All</button>
 *       <button onClick={acceptEssential}>Essential Only</button>
 *     </div>
 *   )
 * }
 * ```
 */
export function useConsent(): ConsentContextValue {
    const context = useContext(ConsentContext)

    if (context === undefined) {
        throw new Error('useConsent must be used within ConsentProvider')
    }

    return context
}
