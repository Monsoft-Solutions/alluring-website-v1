/**
 * Quiz Page
 *
 * Interactive procedure finder quiz that recommends personalized
 * procedures based on user goals and preferences.
 *
 * Features:
 * - Multi-step quiz with elegant animations
 * - Body area and concern selection
 * - Lifestyle and budget matching
 * - Personalized procedure recommendations
 * - Package builder for combinations
 * - Lead capture integration
 *
 * @module app/quiz/page
 */
import { BreadcrumbSchema, WebPageSchema } from '@workspace/seo/react'
import type { Metadata } from 'next'

import { ContainerLayout } from '@/components/container-layout.component'
import { QuizContainer } from '@/components/quiz'
import { siteConfig } from '@/lib/data/site-config'
import { seoConfig } from '@/lib/seo-config'
import { toNextMetadata } from '@/lib/seo/metadata'

const siteUrl = siteConfig.seo.siteUrl
const pageUrl = `${siteUrl}/quiz`

/**
 * Page Metadata
 */
const pageTitle = 'Find Your Perfect Procedure | Free Cosmetic Surgery Quiz'
const pageDescription =
    'Take our 2-minute quiz to discover which cosmetic procedure is right for you. Get personalized recommendations based on your goals, lifestyle, and budget. Free and confidential.'

export const metadata: Metadata = toNextMetadata(seoConfig, {
    canonical: '/quiz',
    title: pageTitle,
    description: pageDescription,
    keywords: [
        'plastic surgery quiz',
        'cosmetic procedure quiz',
        'procedure finder',
        'which plastic surgery is right for me',
        'miami plastic surgery',
        'cosmetic surgery consultation',
        'body contouring quiz',
        'breast surgery quiz',
    ],

    openGraph: {
        type: 'website',
        url: pageUrl,
        title: pageTitle,
        description: pageDescription,
        siteName: siteConfig.business.name,
        images: [
            {
                url: `${siteUrl}/images/hero-beautiful-latin-woman.jpg`,
                width: 1200,
                height: 630,
                alt: 'Find Your Perfect Procedure Quiz - Alluring Plastic Surgery Miami',
            },
        ],
    },

    twitter: {
        card: 'summary_large_image',
        title: pageTitle,
        description:
            "Discover your ideal cosmetic procedure with our free 2-minute quiz. Personalized recommendations from Miami's trusted plastic surgery experts.",
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

export default function QuizPage() {
    // Breadcrumb items for schema
    const breadcrumbItems = [
        { name: 'Home', item: siteUrl },
        { name: 'Procedure Quiz', item: pageUrl },
    ]

    return (
        <>
            {/* Structured Data - WebPage Schema */}
            <WebPageSchema
                name='Find Your Perfect Procedure Quiz'
                url={pageUrl}
                description={pageDescription}
            />

            {/* Structured Data - Breadcrumb Schema */}
            <BreadcrumbSchema items={breadcrumbItems} />

            {/* Main Content */}
            <ContainerLayout as='div' size='full'>
                {/* Quiz Section */}
                <section className='relative min-h-screen bg-gradient-to-b from-stone-50 to-white py-12 md:py-20'>
                    {/* Decorative background elements */}
                    <div className='pointer-events-none absolute inset-0 overflow-hidden'>
                        <div className='bg-gold-100/30 absolute -top-40 -right-40 h-80 w-80 rounded-full blur-3xl' />
                        <div className='bg-gold-100/20 absolute -bottom-40 -left-40 h-80 w-80 rounded-full blur-3xl' />
                    </div>

                    {/* Quiz container */}
                    <div className='relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8'>
                        <QuizContainer />
                    </div>
                </section>
            </ContainerLayout>
        </>
    )
}
