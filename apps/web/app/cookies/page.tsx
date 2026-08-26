import { LegalPageLayout } from '@/components/legal/legal-page-layout.component'
import { cookiePolicyContent } from '@/lib/data/legal/cookie-policy.content'
import { seoConfig } from '@/lib/seo-config'
import { toNextMetadata } from '@/lib/seo/metadata'

const pageTitle = 'Cookie Policy | Alluring Plastic Surgery'

export const metadata = toNextMetadata(seoConfig, {
    canonical: '/cookies',
    title: pageTitle,
    description:
        'Our cookie policy explains what cookies we use, why we use them, and how you can control them.',
    openGraph: {
        title: pageTitle,
        description:
            'Learn about the cookies we use and how to manage your cookie preferences.',
        type: 'website',
    },
    twitter: {
        card: 'summary',
        title: pageTitle,
        description:
            'Learn about the cookies we use and how to manage your cookie preferences.',
    },
    robots: {
        index: true,
        follow: true,
    },
})

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
