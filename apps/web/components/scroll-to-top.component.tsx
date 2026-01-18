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
                // Early exclusion for telephony/mailto protocols
                const href = anchor.href
                if (href.startsWith('tel:') || href.startsWith('mailto:')) {
                    return
                }

                const url = new URL(href)

                // Must be same origin
                if (url.origin !== window.location.origin) {
                    return
                }

                // Exclude if opening in new tab (_blank)
                const target = anchor.target
                if (target === '_blank') {
                    return
                }

                // Only consider same-tab navigation (empty, _self, or undefined)
                const isSameTab = target === '' || target === '_self' || !target

                // Skip scroll-to-top for same-page hash navigation
                const isSamePageHash =
                    url.hash !== '' && url.pathname === window.location.pathname

                if (isSameTab && !isSamePageHash) {
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
