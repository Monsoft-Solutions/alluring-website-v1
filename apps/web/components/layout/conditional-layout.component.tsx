'use client'

import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

import { Footer } from './footer.component'
import { Header } from './header.component'

/**
 * Routes that should not have header/footer
 * These are standalone pages like link-in-bio (/links) and paid ad landing
 * pages under /landing/*, which ship with their own minimal chrome.
 */
const STANDALONE_ROUTES = ['/links', '/landing']

interface ConditionalLayoutProps {
    children: ReactNode
}

/**
 * ConditionalLayout Component
 *
 * Conditionally renders the site header and footer based on the current route.
 * Standalone pages (like /links) will not have header/footer for a cleaner experience.
 */
export function ConditionalLayout({ children }: ConditionalLayoutProps) {
    const pathname = usePathname()
    const isStandalone = STANDALONE_ROUTES.some((route) =>
        pathname.startsWith(route)
    )

    if (isStandalone) {
        return <>{children}</>
    }

    return (
        <>
            <Header />
            <main id='main-content'>{children}</main>
            <Footer />
        </>
    )
}
