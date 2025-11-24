import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { BreadcrumbSchema, WebPageSchema } from '@workspace/seo/react'

import { surgeons } from '@/lib/data/surgeons/surgeons-data'
import { siteConfig } from '@/lib/data/site-config'
import { SurgeonHero } from '@/components/surgeons/surgeon-hero.component'
import { SurgeonBio } from '@/components/surgeons/surgeon-bio.component'
import { SurgeonCredentials } from '@/components/surgeons/surgeon-credentials.component'
import { SurgeonSpecialties } from '@/components/surgeons/surgeon-specialties.component'
import { SurgeonCTA } from '@/components/surgeons/surgeon-cta.component'
import { env } from '@/env'

interface PageProps {
    params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
    return surgeons.map((surgeon) => ({
        slug: surgeon.slug,
    }))
}

export async function generateMetadata({
    params,
}: PageProps): Promise<Metadata> {
    const { slug } = await params
    const surgeon = surgeons.find((s) => s.slug === slug)

    if (!surgeon) {
        return {
            title: 'Surgeon Not Found',
        }
    }

    const siteUrl = env.NEXT_PUBLIC_SITE_URL ?? siteConfig.seo.siteUrl
    const pageUrl = `${siteUrl}/${slug}`
    const ogImage = surgeon.images.featured.startsWith('http')
        ? surgeon.images.featured
        : `${siteUrl}${surgeon.images.featured}`

    const pageTitle = `${surgeon.name} | ${siteConfig.business.name}`
    const pageDescription = surgeon.shortBio

    return {
        title: pageTitle,
        description: pageDescription,

        // Canonical URL
        alternates: {
            canonical: pageUrl,
        },

        // Open Graph tags for social sharing
        openGraph: {
            type: 'profile',
            url: pageUrl,
            title: pageTitle,
            description: pageDescription,
            siteName: siteConfig.business.name,
            locale: 'en_US',
            images: [
                {
                    url: ogImage,
                    width: 1200,
                    height: 630,
                    alt: `${surgeon.name} - Board Certified Plastic Surgeon at ${siteConfig.business.name}`,
                },
            ],
        },

        // Twitter Card tags
        twitter: {
            card: 'summary_large_image',
            title: pageTitle,
            description: pageDescription,
            images: [ogImage],
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
    }
}

export default async function SurgeonPage({ params }: PageProps) {
    const { slug } = await params
    const surgeon = surgeons.find((s) => s.slug === slug)

    if (!surgeon) {
        notFound()
    }

    const siteUrl = env.NEXT_PUBLIC_SITE_URL ?? siteConfig.seo.siteUrl
    const pageUrl = `${siteUrl}/${slug}`

    // Breadcrumb items for schema
    const breadcrumbItems = [
        { name: 'Home', item: siteUrl },
        { name: 'Our Surgeons', item: `${siteUrl}/about` },
        { name: surgeon.name, item: pageUrl },
    ]

    return (
        <>
            {/* Structured Data - WebPage Schema */}
            <WebPageSchema
                name={`${surgeon.name} | ${siteConfig.business.name}`}
                url={pageUrl}
                description={surgeon.shortBio}
            />

            {/* Structured Data - Breadcrumb Schema */}
            <BreadcrumbSchema items={breadcrumbItems} />

            <main className='min-h-screen bg-stone-950'>
                <SurgeonHero surgeon={surgeon} />
                <SurgeonBio surgeon={surgeon} />
                <SurgeonCredentials surgeon={surgeon} />
                <SurgeonSpecialties surgeon={surgeon} />
                <SurgeonCTA />
            </main>
        </>
    )
}
