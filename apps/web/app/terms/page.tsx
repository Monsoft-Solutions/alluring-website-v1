import { LegalPageLayout } from '@/components/legal/legal-page-layout.component'
import { termsOfServiceContent } from '@/lib/data/legal/terms-of-service.content'
import { seoConfig } from '@/lib/seo-config'
import { toNextMetadata } from '@/lib/seo/metadata'

const pageTitle = 'Terms of Service'

export const metadata = toNextMetadata(seoConfig, {
    canonical: '/terms',
    title: pageTitle,
    description:
        'Terms of service for Alluring Plastic Surgery including medical disclaimers, patient rights, consultation policies, and website usage guidelines for our Miami plastic surgery practice.',
    openGraph: {
        title: pageTitle,
        description:
            'Terms and conditions for using our website, booking consultations, and understanding medical information disclaimers at Alluring Plastic Surgery.',
        type: 'website',
    },
    twitter: {
        card: 'summary',
        title: pageTitle,
        description:
            'Terms and conditions for using our website and understanding medical information disclaimers.',
    },
    robots: {
        index: true,
        follow: true,
    },
})

/**
 * Terms of Service Page
 *
 * Displays Alluring Plastic Surgery's terms of service including:
 * - Medical information disclaimers
 * - Doctor-patient relationship terms
 * - Consultation and appointment policies
 * - Before and after photo disclaimers
 * - Patient testimonial guidelines
 * - Website usage policies
 * - Privacy and HIPAA compliance
 * - Acceptable use policy
 * - Intellectual property rights
 * - Disclaimers and limitations of liability
 */
export default function TermsOfServicePage() {
    return (
        <LegalPageLayout
            title='Terms of Service'
            content={termsOfServiceContent}
            lastUpdated='December 14, 2025'
        />
    )
}
