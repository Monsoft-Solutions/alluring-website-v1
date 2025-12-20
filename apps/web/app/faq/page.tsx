/**
 * FAQ Page
 *
 * Comprehensive FAQ page addressing common questions about plastic surgery,
 * organized by category for easy navigation.
 *
 * Features:
 * - SSR for SEO crawlability
 * - Comprehensive structured data (WebPage, Breadcrumb, FAQ schemas)
 * - Full meta tags and Open Graph optimization
 * - Mobile-responsive luxury design
 * - Categorized FAQ navigation
 * - Surgeons and procedures sections for trust and exploration
 * - Testimonials for social proof
 */
import type { Metadata } from 'next'
import {
    BreadcrumbSchema,
    FAQSchema,
    WebPageSchema,
} from '@workspace/seo/react'

import { CategorizedFAQ } from '@/components/shared/faq-categorized.component'
import { CTASection } from '@/components/shared/cta-section.component'
import { Surgeons } from '@/components/home/surgeons.component'
import { Procedures } from '@/components/home/procedures.component'
import { Testimonials } from '@/components/home/testimonials.component'
import {
    faqPageCategories,
    faqPageData,
    faqPageConfig,
    faqPageCtaConfig,
    faqFinalCtaData,
    faqPageSeoData,
} from '@/lib/data/faq/faq-page-data'
import { siteConfig } from '@/lib/data/site-config'
import { seoConfig } from '@/lib/seo-config'
import { toNextMetadata } from '@/lib/seo/metadata'

const siteUrl = siteConfig.seo.siteUrl
const pageUrl = `${siteUrl}/faq`

/**
 * Page Metadata
 *
 * SEO-optimized metadata targeting FAQ-related searches.
 * Addresses common concerns to capture high-intent searchers.
 */
export const metadata: Metadata = toNextMetadata(seoConfig, {
    canonical: faqPageSeoData.canonical,
    title: faqPageSeoData.title,
    description: faqPageSeoData.description,
    keywords: faqPageSeoData.keywords,

    openGraph: {
        type: 'website',
        url: pageUrl,
        title: faqPageSeoData.title,
        description: faqPageSeoData.description,
        siteName: siteConfig.business.name,
        images: [
            {
                url: `${siteUrl}/images/hero-beautiful-latin-woman.jpg`,
                width: 1200,
                height: 630,
                alt: `Frequently Asked Questions - ${siteConfig.business.name}`,
            },
        ],
    },

    twitter: {
        card: 'summary_large_image',
        title: faqPageSeoData.title,
        description: faqPageSeoData.description,
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

export default function FAQPage() {
    // Breadcrumb items for schema and navigation
    const breadcrumbItems = [
        { name: 'Home', item: siteUrl },
        { name: 'FAQ', item: pageUrl },
    ]

    // Transform FAQ data for schema - flatten all categories
    const allFaqItems = Object.values(faqPageData)
        .flat()
        .map((faq) => ({
            question: faq.question,
            answer: faq.answer,
        }))

    return (
        <>
            {/* Structured Data - WebPage Schema */}
            <WebPageSchema
                name={faqPageSeoData.title}
                url={pageUrl}
                description={faqPageSeoData.description}
            />

            {/* Structured Data - Breadcrumb Schema */}
            <BreadcrumbSchema items={breadcrumbItems} />

            {/* Structured Data - FAQ Schema for rich snippets */}
            <FAQSchema items={allFaqItems} />

            {/* Main Content */}
            <main>
                {/* Categorized FAQ Section */}
                <CategorizedFAQ
                    id='faq'
                    categories={faqPageCategories}
                    faqData={faqPageData}
                    badge={faqPageConfig.badge}
                    title={faqPageConfig.title}
                    subtitle={faqPageConfig.subtitle}
                    description={faqPageConfig.description}
                    variant='default'
                    showBackgroundDecoration={true}
                    ctaConfig={faqPageCtaConfig}
                    includeSchema={false}
                />

                {/* Surgeons Section - Build Trust */}
                <Surgeons />

                {/* Procedures Section - Explore Options */}
                <Procedures />

                {/* Testimonials Section - Social Proof */}
                <Testimonials />

                {/* Final CTA Section */}
                <CTASection
                    id='faq-cta'
                    eyebrow={faqFinalCtaData.eyebrow}
                    heading={faqFinalCtaData.heading}
                    description={faqFinalCtaData.description}
                    primaryButton={{
                        text: faqFinalCtaData.primaryButton.text,
                        href: faqFinalCtaData.primaryButton.href,
                    }}
                    secondaryButton={{
                        text: faqFinalCtaData.secondaryButton.text,
                        href: faqFinalCtaData.secondaryButton.href,
                        variant: 'outline',
                    }}
                    variant='luxury'
                    size='lg'
                />
            </main>
        </>
    )
}
