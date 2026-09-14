'use client'

import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

import { isStandaloneRoute } from '@/lib/constants/standalone-routes'

import { Footer } from './footer.component'
import { Header } from './header.component'

interface ConditionalLayoutProps {
    children: ReactNode
}

/**
 * ConditionalLayout Component
 *
 * Conditionally renders the site header and footer based on the current route.
 * Standalone pages (link-in-bio, paid landing pages) will not have header or
 * footer for a cleaner experience — see `lib/constants/standalone-routes`.
 */
export function ConditionalLayout({ children }: ConditionalLayoutProps) {
    const pathname = usePathname()

    if (isStandaloneRoute(pathname)) {
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
