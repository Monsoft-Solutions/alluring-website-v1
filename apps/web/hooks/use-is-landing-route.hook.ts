'use client'

import { usePathname } from 'next/navigation'

/**
 * Returns true when the current pathname is under `/landing/*` — used to
 * branch behavior on paid-ad landing pages where the "convert or exit"
 * directive removes off-page CTAs and softens disruptive surfaces.
 */
export function useIsLandingRoute(): boolean {
    const pathname = usePathname()
    return pathname?.startsWith('/landing/') ?? false
}
