'use client'

/**
 * Global Scroll Depth Tracker Component
 *
 * Automatically tracks scroll depth across all pages at 25%, 50%, 75%, and 100% milestones.
 * This component should be placed in the root layout to track scroll depth globally.
 *
 * The tracker automatically resets when the pathname changes to ensure accurate
 * per-page tracking in the Next.js App Router.
 *
 * @module components/analytics/scroll-depth-tracker
 */
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

import { env } from '@/env'
import { useScrollDepth } from '@/lib/analytics/useScrollDepth.hook'

/**
 * Global Scroll Depth Tracker Component
 *
 * Tracks scroll depth across all pages. Automatically resets tracking
 * when navigating to a new page.
 *
 * @example
 * ```tsx
 * // In your root layout
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <ScrollDepthTracker />
 *         {children}
 *       </body>
 *     </html>
 *   )
 * }
 * ```
 */
export function ScrollDepthTracker() {
    const pathname = usePathname()

    // Track scroll depth with automatic reset on path change
    useScrollDepth({
        thresholds: [25, 50, 75, 100],
        resetOnPathChange: true,
        onThresholdReached: (threshold) => {
            // Optional: Log scroll milestone in development
            if (env.NODE_ENV === 'development') {
                console.log(
                    `[Analytics] Scroll depth: ${threshold}% on ${pathname}`
                )
            }
        },
    })

    // Reset tracking when pathname changes (backup safety measure)
    useEffect(() => {
        // The useScrollDepth hook handles reset internally,
        // but this ensures the tracker is aware of path changes
        if (env.NODE_ENV === 'development') {
            console.log(`[Analytics] Page changed to: ${pathname}`)
        }
    }, [pathname])

    return null
}
