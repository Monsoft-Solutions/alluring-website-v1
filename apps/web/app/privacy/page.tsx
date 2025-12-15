import { LegalPageLayout } from '@/components/legal/legal-page-layout.component'
import { privacyPolicyContent } from '@/lib/data/legal/privacy-policy.content'
import { seoConfig } from '@/lib/seo-config'
import { toNextMetadata } from '@/lib/seo/metadata'

const pageTitle = 'Privacy Policy'

export const metadata = toNextMetadata(seoConfig, {
    canonical: '/privacy',
    title: pageTitle,
    description:
        'Privacy policy for Alluring Plastic Surgery explaining how we collect, use, and protect your personal information. Learn about HIPAA compliance, photo privacy, and your data rights.',
    openGraph: {
        title: pageTitle,
        description:
            'Learn how Alluring Plastic Surgery handles your personal data, protects patient privacy, and complies with HIPAA and Florida privacy laws.',
        type: 'website',
    },
    twitter: {
        card: 'summary',
        title: pageTitle,
        description:
            'Learn how we handle your personal data and protect your privacy at our Miami plastic surgery practice.',
    },
    robots: {
        index: true,
        follow: true,
    },
})

/**
 * Privacy Policy Page
 *
 * Displays Alluring Plastic Surgery's privacy policy including:
 * - Data collection practices (contact forms, consultations, chat)
 * - HIPAA and protected health information distinctions
 * - Before and after photo privacy and consent
 * - Analytics and cookie usage
 * - Third-party services and financing partners
 * - User rights (GDPR/CCPA/Florida laws)
 * - Children's privacy for cosmetic surgery
 * - Data security and breach notification
 * - Contact information
 */
export default function PrivacyPolicyPage() {
    return (
        <LegalPageLayout
            title='Privacy Policy'
            content={privacyPolicyContent}
            lastUpdated='December 14, 2025'
        />
    )
}
