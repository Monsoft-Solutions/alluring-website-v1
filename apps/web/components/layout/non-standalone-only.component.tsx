'use client'

import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

import {
    STANDALONE_ROUTES,
    matchesRoutePrefix,
} from '@/lib/constants/standalone-routes'

export interface NonStandaloneOnlyProps {
    children: ReactNode
    /**
     * Route prefixes to hide on. Defaults to every standalone route; pass a
     * narrower list for a widget that only some of them should lose.
     */
    routes?: readonly string[]
}

/**
 * Renders children only when the current route is not one of `routes`.
 * Use to gate global floating widgets — the exit-intent popup, the promotion
 * modal, the mobile call button — that should be suppressed on landing and
 * link-in-bio pages.
 */
export function NonStandaloneOnly({
    children,
    routes = STANDALONE_ROUTES,
}: NonStandaloneOnlyProps) {
    const pathname = usePathname()

    if (matchesRoutePrefix(pathname, routes)) {
        return null
    }

    return <>{children}</>
}
