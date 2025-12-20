/**
 * Plastic Surgery Financing Page
 *
 * High-converting, SEO-optimized financing page showcasing flexible
 * payment options through Cherry, CareCredit, and United Credit.
 *
 * Features:
 * - SSR for main content (SEO/crawlability)
 * - Comprehensive structured data (WebPage, FAQPage schemas)
 * - Full meta tags and Open Graph optimization
 * - Mobile-responsive luxury design
 */
import {
    BreadcrumbSchema,
    FAQSchema,
    WebPageSchema,
} from '@workspace/seo/react'

import { FinancingHero } from '@/components/financing/financing-hero.component'
import { FinancingHowItWorks } from '@/components/financing/financing-how-it-works.component'
import { FinancingPartners } from '@/components/financing/financing-partners.component'
import { FinancingProcedures } from '@/components/financing/financing-procedures.component'
import { CTASection } from '@/components/shared/cta-section.component'
import { FAQComponent } from '@/components/shared/faq.component'
import {
    financingFaqConfig,
    financingFaqData,
} from '@/lib/data/faq/financing-faq-data'
import { siteConfig } from '@/lib/data/site-config'
import {
    financingCtaData,
    financingHeroData,
    financingHowItWorksData,
    financingPartnersData,
    financingProceduresData,
    financingSeoData,
} from '@/lib/data/webpages/financing'
import { seoConfig } from '@/lib/seo-config'
import { toNextMetadata } from '@/lib/seo/metadata'

const siteUrl = siteConfig.seo.siteUrl
const pageUrl = `${siteUrl}/plastic-surgery-financing-miami`

/**
 * Page Metadata
 *
 * SEO-optimized metadata targeting financing-related searches.
 * CTR-optimized with 0% APR and instant approval messaging.
 */
const pageTitle =
    'Plastic Surgery Financing Miami | 0% APR | Approved in Minutes'

export const metadata = toNextMetadata(seoConfig, {
    canonical: financingSeoData.canonical,
    title: pageTitle,
    description:
        'Make your dream transformation affordable. 0% APR financing for BBL, breast surgery, tummy tuck & more. Cherry, CareCredit, United Credit. Apply in 60 seconds.',
    keywords: financingSeoData.keywords as unknown as string[],

    openGraph: {
        type: 'website',
        url: pageUrl,
        title: pageTitle,
        description:
            'Make your dream transformation affordable. 0% APR financing for BBL, breast surgery, tummy tuck & more. Cherry, CareCredit, United Credit. Apply in 60 seconds.',
        siteName: siteConfig.business.name,
        images: [
            {
                url: `${siteUrl}/images/hero-beautiful-latin-woman.jpg`,
                width: 1200,
                height: 630,
                alt: `Plastic Surgery Financing at ${siteConfig.business.name} Miami`,
            },
        ],
    },

    twitter: {
        card: 'summary_large_image',
        title: pageTitle,
        description:
            '0% APR financing for cosmetic surgery. Instant approval. Cherry, CareCredit, United Credit accepted. Apply in 60 seconds.',
        images: [`${siteUrl}/images/hero-beautiful-latin-woman.jpg`],
    },

    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
})

export default function FinancingPage() {
    // Breadcrumb items for schema and navigation
    const breadcrumbItems = [
        { name: 'Home', item: siteUrl },
        { name: 'Financing', item: pageUrl },
    ]

    // Transform FAQ data for schema
    const faqSchemaItems = financingFaqData.map((faq) => ({
        question: faq.question,
        answer: faq.answer,
    }))

    return (
        <>
            {/* Structured Data - WebPage Schema */}
            <WebPageSchema
                name='Plastic Surgery Financing Miami | 0% APR Plans'
                url={pageUrl}
                description={financingSeoData.description}
            />

            {/* Structured Data - Breadcrumb Schema */}
            <BreadcrumbSchema items={breadcrumbItems} />

            {/* Structured Data - FAQ Schema for rich snippets */}
            <FAQSchema items={faqSchemaItems} />

            {/* Main Content */}
            <main>
                {/* Hero Section - Full viewport with parallax */}
                <FinancingHero id='financing-hero' {...financingHeroData} />

                {/* How It Works Section */}
                <FinancingHowItWorks
                    id='how-it-works'
                    {...financingHowItWorksData}
                    variant='default'
                />

                {/* Financing Partners Section */}
                <FinancingPartners
                    id='financing-partners'
                    {...financingPartnersData}
                    variant='muted'
                />

                {/* Procedures Available Section */}
                <FinancingProcedures
                    id='procedures'
                    {...financingProceduresData}
                    variant='default'
                />

                {/* FAQ Section */}
                <FAQComponent
                    id='financing-faq'
                    title={financingFaqConfig.title}
                    description={financingFaqConfig.description}
                    faqs={financingFaqData}
                    variant='muted'
                    includeSchema={false}
                />

                {/* Final CTA Section - Luxury variant */}
                <CTASection
                    id='financing-cta'
                    eyebrow={financingCtaData.eyebrow}
                    heading={financingCtaData.heading}
                    description={financingCtaData.description}
                    primaryButton={{
                        text: financingCtaData.primaryButton.text,
                        href: financingCtaData.primaryButton.href,
                    }}
                    secondaryButton={
                        financingCtaData.secondaryButton
                            ? {
                                  text: financingCtaData.secondaryButton.text,
                                  href: financingCtaData.secondaryButton.href,
                                  variant: 'outline',
                              }
                            : undefined
                    }
                    variant='luxury'
                    size='lg'
                />
            </main>
        </>
    )
}
