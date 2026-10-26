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

import { ContainerLayout } from '@/components/container-layout.component'
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
import { resolveClaimsIn } from '@/lib/claims/resolve-claims.server'
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
 * SEO-optimized metadata targeting financing-related searches. Names the
 * partners and quotes no rate or approval speed: those are Truth in Lending
 * trigger terms the claims canon removes (§6, D6, #354).
 */
const pageTitle =
    'Plastic Surgery Financing Miami | Cherry, CareCredit, United Credit'

export const metadata = toNextMetadata(seoConfig, {
    canonical: financingSeoData.canonical,
    title: pageTitle,
    description:
        'Financing for BBL, breast surgery, tummy tuck & more in Miami, through Cherry, CareCredit and United Credit, for qualified applicants. Approval and terms are set by the lender.',
    keywords: financingSeoData.keywords as unknown as string[],

    openGraph: {
        type: 'website',
        url: pageUrl,
        title: pageTitle,
        description:
            'Financing for BBL, breast surgery, tummy tuck & more in Miami, through Cherry, CareCredit and United Credit, for qualified applicants. Approval and terms are set by the lender.',
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
            'Financing for BBL, breast surgery, tummy tuck & more in Miami, through Cherry, CareCredit and United Credit, for qualified applicants. Approval and terms are set by the lender.',
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

export default async function FinancingPage() {
    // Claim tokens in the page copy and FAQ answers (prices, financing;
    // #354), resolved once for the sections and their schema.
    const [
        faqs,
        hero,
        howItWorks,
        partners,
        proceduresData,
        cta,
        seoDescription,
    ] = await resolveClaimsIn(
        [
            financingFaqData,
            financingHeroData,
            financingHowItWorksData,
            financingPartnersData,
            financingProceduresData,
            financingCtaData,
            financingSeoData.description,
        ] as const,
        'text',
        'financing page'
    )

    // Breadcrumb items for schema and navigation
    const breadcrumbItems = [
        { name: 'Home', item: siteUrl },
        { name: 'Financing', item: pageUrl },
    ]

    // Transform FAQ data for schema
    const faqSchemaItems = faqs.map((faq) => ({
        question: faq.question,
        answer: faq.answer,
    }))

    return (
        <>
            {/* Structured Data - WebPage Schema */}
            <WebPageSchema
                name='Plastic Surgery Financing Miami'
                url={pageUrl}
                description={seoDescription}
            />

            {/* Structured Data - Breadcrumb Schema */}
            <BreadcrumbSchema items={breadcrumbItems} />

            {/* Structured Data - FAQ Schema for rich snippets */}
            <FAQSchema items={faqSchemaItems} />

            {/* Main Content */}
            <ContainerLayout as='div' noPaddingTop noPadding size='full'>
                {/* Hero Section - Full viewport with parallax */}
                <FinancingHero id='financing-hero' {...hero} />

                {/* How It Works Section */}
                <FinancingHowItWorks
                    id='how-it-works'
                    {...howItWorks}
                    variant='default'
                />

                {/* Financing Partners Section */}
                <FinancingPartners
                    id='financing-partners'
                    {...partners}
                    variant='muted'
                />

                {/* Procedures Available Section */}
                <FinancingProcedures
                    id='procedures'
                    {...proceduresData}
                    variant='default'
                />

                {/* FAQ Section */}
                <FAQComponent
                    id='financing-faq'
                    title={financingFaqConfig.title}
                    description={financingFaqConfig.description}
                    faqs={faqs}
                    variant='muted'
                    includeSchema={false}
                />

                {/* Final CTA Section - Luxury variant */}
                <CTASection
                    id='financing-cta'
                    eyebrow={cta.eyebrow}
                    heading={cta.heading}
                    description={cta.description}
                    primaryButton={{
                        text: cta.primaryButton.text,
                        href: cta.primaryButton.href,
                    }}
                    secondaryButton={
                        cta.secondaryButton
                            ? {
                                  text: cta.secondaryButton.text,
                                  href: cta.secondaryButton.href,
                                  variant: 'outline',
                              }
                            : undefined
                    }
                    variant='luxury'
                    size='lg'
                />
            </ContainerLayout>
        </>
    )
}
