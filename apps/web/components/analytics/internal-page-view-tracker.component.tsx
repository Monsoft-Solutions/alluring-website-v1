/**
 * Internal Page View Tracker Component
 *
 * Cookie-free page view tracking component that automatically tracks
 * page views on route changes. Uses sessionStorage for session identification.
 *
 * This component should be placed in the root layout alongside other analytics
 * components. It tracks all page navigations without blocking the UI.
 *
 * @module components/analytics/internal-page-view-tracker
 */
'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useRef } from 'react'

import { usePageViewTracking } from '@/lib/analytics/usePageViewTracking.hook'

/**
 * Internal tracker component that requires Suspense boundary
 * (useSearchParams must be wrapped in Suspense for streaming SSR)
 */
function InternalPageViewTrackerCore() {
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const { trackPageView } = usePageViewTracking()
    const isFirstRender = useRef(true)

    useEffect(() => {
        // Track on first render (initial page load)
        // and on subsequent navigation
        if (isFirstRender.current) {
            isFirstRender.current = false
            // Small delay to ensure document.title is set
            setTimeout(() => {
                trackPageView(pathname, searchParams?.toString())
            }, 50)
        } else {
            // Subsequent navigations
            trackPageView(pathname, searchParams?.toString())
        }
    }, [pathname, searchParams, trackPageView])

    // This component renders nothing
    return null
}

/**
 * Internal Page View Tracker
 *
 * Tracks page views on route changes using cookie-free identification.
 * Data is sent asynchronously via sendBeacon and stored in our database.
 *
 * Key features:
 * - No cookies required (uses sessionStorage)
 * - Non-blocking (sendBeacon/fetch with keepalive)
 * - Automatic UTM parameter extraction
 * - Geo and device info captured server-side
 *
 * @example
 * ```tsx
 * // In root layout.tsx
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <InternalPageViewTracker />
 *         {children}
 *       </body>
 *     </html>
 *   )
 * }
 * ```
 */
export function InternalPageViewTracker() {
    return (
        <Suspense fallback={null}>
            <InternalPageViewTrackerCore />
        </Suspense>
    )
}
