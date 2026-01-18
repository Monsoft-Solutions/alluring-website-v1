'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'

export function ScrollToTop() {
    const pathname = usePathname()
    const previousPathname = useRef<string | null>(null)

    useEffect(() => {
        // Scroll to top on pathname change
        if (
            previousPathname.current !== null &&
            previousPathname.current !== pathname
        ) {
            // Immediate scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' })

            // Backup: Force scroll after a short delay to handle any layout shifts
            const timeoutId = setTimeout(() => {
                window.scrollTo({ top: 0, behavior: 'smooth' })
            }, 100)

            return () => clearTimeout(timeoutId)
        }

        previousPathname.current = pathname
    }, [pathname])

    useEffect(() => {
        // Global click handler for all links (including same-page navigation)
        const handleLinkClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement
            // Find closest anchor tag
            const anchor = target.closest('a')

            if (anchor && anchor.href) {
                // Check if it's an internal link (not external, not tel:, not mailto:)
                const url = new URL(anchor.href)
                const isInternalLink =
                    url.origin === window.location.origin &&
                    !anchor.href.startsWith('tel:') &&
                    !anchor.href.startsWith('mailto:') &&
                    !anchor.target // Not opening in new tab

                if (isInternalLink) {
                    // Small delay to let Next.js navigation complete
                    setTimeout(() => {
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                    }, 50)
                }
            }
        }

        // Add click listener to document
        document.addEventListener('click', handleLinkClick)

        return () => {
            document.removeEventListener('click', handleLinkClick)
        }
    }, [])

    return null
}
