import type { Metadata } from 'next'

import { LegalPageLayout } from '@/components/legal/legal-page-layout.component'
import { cookiePolicyContent } from '@/lib/data/legal/cookie-policy.content'

export const metadata: Metadata = {
    title: 'Cookie Policy',
    description:
        'Our cookie policy explains what cookies we use, why we use them, and how you can control them.',
    openGraph: {
        title: 'Cookie Policy',
        description:
            'Learn about the cookies we use and how to manage your cookie preferences.',
        type: 'website',
    },
    twitter: {
        card: 'summary',
        title: 'Cookie Policy',
        description:
            'Learn about the cookies we use and how to manage your cookie preferences.',
    },
    robots: {
        index: true,
        follow: true,
    },
}

/**
 * Cookie Policy Page
 *
 * Displays the website's cookie policy including:
 * - Types of cookies used
 * - Purpose of each cookie
 * - Consent management system (Consent Mode v2)
 * - How to control cookies
 * - Third-party cookie information
 *
 * Built with open-source template by Adriano Flechilla / Monsoft Solutions, LLC
 */
export default function CookiePolicyPage() {
    return (
        <LegalPageLayout
            title='Cookie Policy'
            content={cookiePolicyContent}
            lastUpdated='October 19, 2025'
        />
    )
}
