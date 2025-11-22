'use client'

/**
 * Page View Tracker Component
 *
 * Automatically tracks page views in Google Analytics on route changes
 * using Next.js App Router's usePathname hook.
 *
 * This component should be placed in the root layout or a high-level provider
 * to ensure it captures all navigation events.
 *
 * @module components/analytics/page-view-tracker
 */
import { usePathname, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useRef } from 'react'

import { trackPageView } from '@/lib/analytics/analytics.client'

/**
 * Internal component that uses useSearchParams (requires Suspense boundary)
 */
function PageViewTrackerInternal() {
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const previousPathRef = useRef<string | null>(null)

    useEffect(() => {
        // Construct full path with search params
        const search = searchParams?.toString()
        const fullPath = search ? `${pathname}?${search}` : pathname

        // Skip tracking on initial mount (GA4 auto-tracks initial page view)
        // Only track subsequent navigation
        if (
            previousPathRef.current !== null &&
            previousPathRef.current !== fullPath
        ) {
            trackPageView({
                page_path: pathname,
                page_location: window.location.href,
                page_title: document.title,
            })
        }

        // Update previous path reference
        previousPathRef.current = fullPath
    }, [pathname, searchParams])

    return null
}

/**
 * Page View Tracker Component
 *
 * Tracks page views on route changes in Next.js App Router.
 * Wrapped in Suspense to handle useSearchParams streaming.
 *
 * @example
 * ```tsx
 * // In your root layout or providers
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <PageViewTracker />
 *         {children}
 *       </body>
 *     </html>
 *   )
 * }
 * ```
 */
export function PageViewTracker() {
    return (
        <Suspense fallback={null}>
            <PageViewTrackerInternal />
        </Suspense>
    )
}
