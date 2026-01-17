/**
 * BMI Calculator Page
 *
 * SEO-optimized BMI calculator page tailored for plastic surgery patients.
 * Helps patients understand their surgical candidacy based on BMI.
 *
 * Features:
 * - SSR for main content (SEO/crawlability)
 * - Comprehensive structured data (WebPage, FAQPage schemas)
 * - Full meta tags and Open Graph optimization
 * - Interactive BMI calculator with Imperial/Metric modes
 * - Mobile-responsive luxury design
 */
import {
    BreadcrumbSchema,
    FAQSchema,
    WebPageSchema,
} from '@workspace/seo/react'

import { BmiCalculator } from '@/components/bmi-calculator/bmi-calculator.component'
import { BmiCategories } from '@/components/bmi-calculator/bmi-categories.component'
import { BmiConsultationSection } from '@/components/bmi-calculator/bmi-consultation-section.component'
import { BmiHero } from '@/components/bmi-calculator/bmi-hero.component'
import { ContainerLayout } from '@/components/container-layout.component'
import { CTASection } from '@/components/shared/cta-section.component'
import { FAQComponent } from '@/components/shared/faq.component'
import { bmiFaqConfig, bmiFaqData } from '@/lib/data/faq/bmi-faq.data'
import { siteConfig } from '@/lib/data/site-config'
import {
    bmiCategoriesData,
    bmiCtaData,
    bmiHeroData,
    bmiSeoData,
} from '@/lib/data/webpages/bmi-calculator.data'
import { seoConfig } from '@/lib/seo-config'
import { toNextMetadata } from '@/lib/seo/metadata'

const siteUrl = siteConfig.seo.siteUrl
const pageUrl = `${siteUrl}/bmi-calculator`

/**
 * Page Metadata
 *
 * SEO-optimized metadata targeting BMI calculator searches.
 * CTR-optimized with trust signals and clear value proposition.
 */
const pageTitle = 'BMI Calculator for Plastic Surgery | Free Tool | Miami'

export const metadata = toNextMetadata(seoConfig, {
    canonical: bmiSeoData.canonical,
    title: pageTitle,
    description: bmiSeoData.description,
    keywords: bmiSeoData.keywords as unknown as string[],

    openGraph: {
        type: 'website',
        url: pageUrl,
        title: pageTitle,
        description: bmiSeoData.description,
        siteName: siteConfig.business.name,
        images: [
            {
                url: `${siteUrl}/images/hero-beautiful-latin-woman.jpg`,
                width: 1200,
                height: 630,
                alt: `BMI Calculator for Plastic Surgery at ${siteConfig.business.name} Miami`,
            },
        ],
    },

    twitter: {
        card: 'summary_large_image',
        title: pageTitle,
        description:
            'Free BMI calculator for cosmetic surgery candidacy. Understand your eligibility for BBL, tummy tuck, breast surgery & more.',
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

export default function BmiCalculatorPage() {
    // Breadcrumb items for schema and navigation
    const breadcrumbItems = [
        { name: 'Home', item: siteUrl },
        { name: 'BMI Calculator', item: pageUrl },
    ]

    // Transform FAQ data for schema
    const faqSchemaItems = bmiFaqData.map((faq) => ({
        question: faq.question,
        answer: faq.answer,
    }))

    return (
        <>
            {/* Structured Data - WebPage Schema */}
            <WebPageSchema
                name='BMI Calculator for Plastic Surgery Miami'
                url={pageUrl}
                description={bmiSeoData.description}
            />

            {/* Structured Data - Breadcrumb Schema */}
            <BreadcrumbSchema items={breadcrumbItems} />

            {/* Structured Data - FAQ Schema for rich snippets */}
            <FAQSchema items={faqSchemaItems} />

            {/* Main Content */}
            <ContainerLayout as='div' noPaddingTop noPadding size='full'>
                {/* Hero Section - Educational intro */}
                <BmiHero id='bmi-hero' {...bmiHeroData} />

                {/* BMI Calculator Section - Interactive tool */}
                <BmiCalculator id='calculator' variant='default' />

                {/* BMI Categories Section - Range explanations */}
                <BmiCategories id='bmi-categories' {...bmiCategoriesData} />

                {/* FAQ Section */}
                <FAQComponent
                    id='bmi-faq'
                    title={bmiFaqConfig.title}
                    description={bmiFaqConfig.description}
                    faqs={bmiFaqData}
                    variant='default'
                    includeSchema={false}
                />

                {/* Consultation Form Section */}
                <BmiConsultationSection id='consultation' />

                {/* Final CTA Section - Luxury variant */}
                <CTASection
                    id='bmi-cta'
                    eyebrow={bmiCtaData.eyebrow}
                    heading={bmiCtaData.heading}
                    description={bmiCtaData.description}
                    primaryButton={{
                        text: bmiCtaData.primaryButton.text,
                        href: bmiCtaData.primaryButton.href,
                    }}
                    secondaryButton={
                        bmiCtaData.secondaryButton
                            ? {
                                  text: bmiCtaData.secondaryButton.text,
                                  href: bmiCtaData.secondaryButton.href,
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
