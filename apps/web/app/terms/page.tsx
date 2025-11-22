import type { Metadata } from 'next'

import { LegalPageLayout } from '@/components/legal/legal-page-layout.component'
import { termsOfServiceContent } from '@/lib/data/legal/terms-of-service.content'

export const metadata: Metadata = {
    title: 'Terms of Service',
    description:
        'Our terms of service outline the rules and guidelines for using our website and services.',
    openGraph: {
        title: 'Terms of Service',
        description:
            'Read our terms and conditions for using this website and its services.',
        type: 'website',
    },
    twitter: {
        card: 'summary',
        title: 'Terms of Service',
        description:
            'Read our terms and conditions for using this website and its services.',
    },
    robots: {
        index: true,
        follow: true,
    },
}

/**
 * Terms of Service Page
 *
 * Displays the website's terms of service including:
 * - Acceptable use policy
 * - Intellectual property rights
 * - User responsibilities
 * - Disclaimers and limitations of liability
 * - Open source acknowledgment
 *
 * Built with open-source template by Adriano Flechilla / Monsoft Solutions, LLC
 */
export default function TermsOfServicePage() {
    return (
        <LegalPageLayout
            title='Terms of Service'
            content={termsOfServiceContent}
            lastUpdated='October 19, 2025'
        />
    )
}
