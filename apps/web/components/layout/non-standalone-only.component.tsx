'use client'

import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

/**
 * Routes that should NOT receive global floating chrome (mobile call button,
 * beta feedback widget, etc). Mirrors the STANDALONE_ROUTES list in
 * ConditionalLayout — landing and link-in-bio pages ship their own chrome.
 */
const STANDALONE_ROUTES = ['/links', '/landing']

export interface NonStandaloneOnlyProps {
    children: ReactNode
}

/**
 * Renders children only when the current route is NOT a standalone route.
 * Use to gate global floating widgets that should be suppressed on
 * landing pages and other minimal-chrome routes.
 */
export function NonStandaloneOnly({ children }: NonStandaloneOnlyProps) {
    const pathname = usePathname()
    const isStandalone = STANDALONE_ROUTES.some((route) =>
        pathname.startsWith(route)
    )

    if (isStandalone) {
        return null
    }

    return <>{children}</>
}
