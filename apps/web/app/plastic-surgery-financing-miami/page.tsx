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

import {
    FinancingHero,
    FinancingHowItWorks,
    FinancingPartners,
    FinancingProcedures,
} from '@/components/financing'
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
 */
export const metadata = toNextMetadata(seoConfig, {
    canonical: financingSeoData.canonical,
    title: financingSeoData.title,
    description: financingSeoData.description,
    keywords: financingSeoData.keywords as unknown as string[],

    openGraph: {
        type: 'website',
        url: pageUrl,
        title: 'Plastic Surgery Financing Miami | 0% APR Payment Plans',
        description:
            'Make your dream results affordable with flexible financing options. Get approved in seconds with 0% APR plans available. Finance BBL, breast augmentation, tummy tuck & more.',
        siteName: siteConfig.business.name,
        images: [
            {
                url: `${siteUrl}/images/hero-beautiful-latin-woman.jpg`,
                width: 1200,
                height: 630,
                alt: 'Plastic Surgery Financing at Alluring Plastic Surgery Miami',
            },
        ],
    },

    twitter: {
        card: 'summary_large_image',
        title: 'Plastic Surgery Financing Miami | Affordable Payment Plans',
        description:
            'Flexible financing for cosmetic surgery. 0% APR options, instant approval. Cherry, CareCredit, United Credit accepted.',
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
