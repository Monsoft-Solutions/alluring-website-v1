import { Metadata } from 'next'
import { FAQSchema, WebPageSchema } from '@workspace/seo/react'

import { Hero } from '@/components/home/hero.component'
import { Journey } from '@/components/home/journey.component'
import { Procedures } from '@/components/home/procedures.component'
import { BeforeAfter } from '@/components/home/before-after.component'
import { WhyUs } from '@/components/home/why-us.component'
import { Surgeons } from '@/components/home/surgeons.component'
import { Testimonials } from '@/components/home/testimonials.component'
import { CategorizedFAQ } from '@/components/shared/faq-categorized.component'
import { LeadForm } from '@/components/home/lead-form.component'
import { PromoSection } from '@/components/promotions/promo-section.component'
import { siteConfig } from '@/lib/data/site-config'
import { seoConfig } from '@/lib/seo-config'
import { toNextMetadata } from '@/lib/seo/metadata'
import { faqCategoriesHome, faqDataHome } from '@/lib/data/faq/home-faq-data'
import { getFeaturedPromotion } from '@/lib/queries/promotion.query'
import { env } from '@/env'

const siteUrl = env.NEXT_PUBLIC_SITE_URL ?? siteConfig.seo.siteUrl

/**
 * Homepage Metadata
 * Uses default title from layout.tsx (no template suffix applied to root page)
 * SEO-optimized for plastic surgery + Miami + credentials + value proposition
 */
export const metadata: Metadata = toNextMetadata(seoConfig, {
    canonical: '/',
    description: siteConfig.business.description,

    // Open Graph tags for social sharing
    openGraph: {
        type: 'website',
        url: siteUrl,
        title: `${siteConfig.business.name} | ${siteConfig.business.tagline}`,
        description: siteConfig.seo.siteDescription,
        siteName: siteConfig.business.name,
        locale: 'en_US',
        images: [
            {
                url: `${siteUrl}/og-image.jpg`,
                width: 1200,
                height: 630,
                alt: `${siteConfig.business.name} - Luxury Plastic Surgery in Miami`,
            },
        ],
    },

    // Twitter Card tags
    twitter: {
        card: 'summary_large_image',
        title: `${siteConfig.business.name} | ${siteConfig.business.tagline}`,
        description: siteConfig.seo.siteDescription,
        images: [`${siteUrl}/og-image.jpg`],
    },

    // Robots directives
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

/**
 * Homepage Component
 *
 * The main landing page of the website.
 * Adapted from the prototype design with all sections in order.
 */
export default async function Page() {
    // Fetch featured promotion for homepage section
    const featuredPromotion = await getFeaturedPromotion()

    // Flatten FAQ data for schema (combine all categories)
    const allFaqItems = Object.values(faqDataHome).flat()
    const faqSchemaItems = allFaqItems.map((faq) => ({
        question: faq.question,
        answer: faq.answer,
    }))

    return (
        <>
            {/* Structured Data - WebPage Schema */}
            <WebPageSchema
                name={`${siteConfig.business.name} | ${siteConfig.business.tagline}`}
                url={siteUrl}
                description={siteConfig.seo.siteDescription}
            />

            {/* Structured Data - FAQ Schema for rich snippets */}
            {faqSchemaItems.length > 0 && <FAQSchema items={faqSchemaItems} />}

            <div className='selection:bg-gold-200 bg-stone-50 font-sans text-stone-900 selection:text-stone-900'>
                <Hero />
                <Journey />
                <Procedures />
                {/* Featured Promotion Section - Only shown when active promotion exists */}
                {featuredPromotion && (
                    <PromoSection promotion={featuredPromotion} />
                )}
                <BeforeAfter />
                <WhyUs />
                <Surgeons />
                <Testimonials />
                <CategorizedFAQ
                    categories={faqCategoriesHome}
                    faqData={faqDataHome}
                    badge='Clarity & Confidence'
                    title='Your Questions,'
                    subtitle='Answered.'
                    description='We believe transparency is the ultimate luxury. Here are the answers to the most common questions our patients ask.'
                    variant='default'
                    showBackgroundDecoration={true}
                    ctaConfig={{
                        title: 'Still have questions?',
                        description:
                            'Our patient concierge is ready to help you.',
                        buttonText: 'Chat with Concierge',
                        phoneNumber: '7863058649',
                    }}
                />
                <LeadForm />
            </div>
        </>
    )
}
