/**
 * Chat Session Cookie Hook
 *
 * Manages chat session persistence using cookies (Crisp-style).
 * Sessions persist for 6 months and are renewed on each visit.
 *
 * @module hooks/useChatSession
 */
'use client'

import { useCallback } from 'react'

/**
 * Cookie name for storing chat session ID
 */
const CHAT_SESSION_COOKIE = 'alluring_chat_session'

/**
 * Session expiry in days (6 months like Crisp)
 */
const SESSION_EXPIRY_DAYS = 180

/**
 * Session data stored in cookie
 */
type StoredSessionData = {
    sessionId: string
    fullName: string
    createdAt: string
}

/**
 * Get a cookie value by name
 */
function getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null

    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) {
        const cookieValue = parts.pop()?.split(';').shift()
        return cookieValue ?? null
    }
    return null
}

/**
 * Set a cookie with the given name, value, and expiry days
 */
function setCookie(name: string, value: string, days: number): void {
    if (typeof document === 'undefined') return

    const date = new Date()
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000)
    const expires = `expires=${date.toUTCString()}`

    // Set cookie with SameSite=Lax for security and cross-page navigation
    document.cookie = `${name}=${value}; ${expires}; path=/; SameSite=Lax`
}

/**
 * Delete a cookie by name
 */
function deleteCookie(name: string): void {
    if (typeof document === 'undefined') return
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
}

/**
 * Hook for managing chat session persistence via cookies
 *
 * @example
 * ```tsx
 * const { getStoredSession, saveSession, clearSession, renewSession } = useChatSession()
 *
 * // Check for existing session on mount
 * const stored = getStoredSession()
 * if (stored) {
 *   // Resume session
 * }
 *
 * // Save new session
 * saveSession({ sessionId: 'abc', fullName: 'John Doe' })
 *
 * // Clear session (logout/reset)
 * clearSession()
 * ```
 */
export function useChatSession() {
    /**
     * Get stored session data from cookie
     */
    const getStoredSession = useCallback((): StoredSessionData | null => {
        try {
            const cookieValue = getCookie(CHAT_SESSION_COOKIE)
            if (!cookieValue) return null

            const decoded = decodeURIComponent(cookieValue)
            const data = JSON.parse(decoded) as StoredSessionData

            // Validate required fields
            if (!data.sessionId || !data.fullName) {
                return null
            }

            return data
        } catch {
            // Invalid cookie data, clear it
            deleteCookie(CHAT_SESSION_COOKIE)
            return null
        }
    }, [])

    /**
     * Save session data to cookie (with 6-month expiry)
     */
    const saveSession = useCallback(
        (data: { sessionId: string; fullName: string }): void => {
            const sessionData: StoredSessionData = {
                sessionId: data.sessionId,
                fullName: data.fullName,
                createdAt: new Date().toISOString(),
            }

            const encoded = encodeURIComponent(JSON.stringify(sessionData))
            setCookie(CHAT_SESSION_COOKIE, encoded, SESSION_EXPIRY_DAYS)
        },
        []
    )

    /**
     * Renew session cookie expiry (call on each visit to extend 6-month window)
     */
    const renewSession = useCallback((): void => {
        const existing = getStoredSession()
        if (existing) {
            const encoded = encodeURIComponent(JSON.stringify(existing))
            setCookie(CHAT_SESSION_COOKIE, encoded, SESSION_EXPIRY_DAYS)
        }
    }, [getStoredSession])

    /**
     * Clear session cookie (for reset/logout)
     */
    const clearSession = useCallback((): void => {
        deleteCookie(CHAT_SESSION_COOKIE)
    }, [])

    return {
        getStoredSession,
        saveSession,
        renewSession,
        clearSession,
    }
}
