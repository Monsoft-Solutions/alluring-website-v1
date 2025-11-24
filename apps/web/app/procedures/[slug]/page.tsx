import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import {
    BreadcrumbSchema,
    FAQSchema,
    WebPageSchema,
} from '@workspace/seo/react'

import { ContainerLayout } from '@/components/container-layout.component'
import { CTASection } from '@/components/shared/cta-section.component'
import { FAQComponent } from '@/components/shared/faq.component'
import { PostMarkdown } from '@/components/blog/post-markdown.component'
import { procedures, getProcedureBySlug } from '@/lib/data/procedures.data'
import { siteConfig } from '@/lib/data/site-config'
import { ProcedureDetailHero } from '@/components/procedures/procedure-detail-hero.component'
import { ProcedureStats } from '@/components/procedures/procedure-stats.component'
import { ProcedureBenefits } from '@/components/procedures/procedure-benefits.component'
import { ProcedureProcess } from '@/components/procedures/procedure-process.component'
import { ProcedureCard } from '@/components/procedures/procedure-card.component'
import { ProcedureIntro } from '@/components/procedures/procedure-intro.component'
import { env } from '@/env'

interface ProcedurePageProps {
    params: Promise<{
        slug: string
    }>
}

export async function generateStaticParams() {
    return procedures.map((procedure) => ({
        slug: procedure.slug,
    }))
}

export async function generateMetadata(
    props: ProcedurePageProps
): Promise<Metadata> {
    const params = await props.params
    const procedure = getProcedureBySlug(params.slug)

    if (!procedure) {
        return {
            title: 'Procedure Not Found',
        }
    }

    const siteUrl = env.NEXT_PUBLIC_SITE_URL ?? siteConfig.seo.siteUrl
    const pageUrl = `${siteUrl}/procedures/${params.slug}`
    const ogImage = procedure.image
        ? `${siteUrl}${procedure.image}`
        : `${siteUrl}/og-image.jpg`

    return {
        title: procedure.title,
        description: procedure.description,
        keywords: procedure.keywords,

        // Canonical URL
        alternates: {
            canonical: pageUrl,
        },

        // Open Graph tags for social sharing (Facebook, LinkedIn, etc.)
        openGraph: {
            type: 'website',
            url: pageUrl,
            title: procedure.title,
            description: procedure.shortDescription || procedure.description,
            siteName: siteConfig.business.name,
            locale: 'en_US',
            images: [
                {
                    url: ogImage,
                    width: 1200,
                    height: 630,
                    alt: `${procedure.title} - ${siteConfig.business.name}`,
                },
            ],
        },

        // Twitter Card tags
        twitter: {
            card: 'summary_large_image',
            title: procedure.title,
            description: procedure.shortDescription || procedure.description,
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

export default async function ProcedurePage(props: ProcedurePageProps) {
    const params = await props.params
    const procedure = getProcedureBySlug(params.slug)

    if (!procedure) {
        notFound()
    }

    const siteUrl = env.NEXT_PUBLIC_SITE_URL ?? siteConfig.seo.siteUrl
    const pageUrl = `${siteUrl}/procedures/${params.slug}`

    // Filter out the current procedure from related procedures
    const relatedProcedures = procedures
        .filter(
            (p) =>
                p.category === procedure.category && p.slug !== procedure.slug
        )
        .slice(0, 3)

    // Prepare FAQ items for schema (if FAQs exist)
    const faqSchemaItems = procedure.faqs?.map((faq) => ({
        question: faq.question,
        answer: faq.answer,
    }))

    // Breadcrumb items for schema
    const breadcrumbItems = [
        { name: 'Home', item: siteUrl },
        { name: 'Procedures', item: `${siteUrl}/procedures` },
        { name: procedure.title, item: pageUrl },
    ]

    return (
        <>
            {/* Structured Data - WebPage Schema */}
            <WebPageSchema
                name={procedure.title}
                url={pageUrl}
                description={procedure.description}
            />

            {/* Structured Data - Breadcrumb Schema */}
            <BreadcrumbSchema items={breadcrumbItems} />

            {/* Structured Data - FAQ Schema (only if FAQs exist) */}
            {faqSchemaItems && faqSchemaItems.length > 0 && (
                <FAQSchema items={faqSchemaItems} />
            )}

            {/* Hero Section */}
            <ProcedureDetailHero
                title={procedure.title}
                subtitle={procedure.heroSubtitle || procedure.shortDescription}
                image={procedure.image}
            />

            {/* Stats Section - Only render if data exists */}
            {procedure.quickStats && (
                <ProcedureStats stats={procedure.quickStats} />
            )}

            {/* Intro Section */}
            <ProcedureIntro
                title={procedure.title}
                description={
                    procedure.shortDescription || procedure.description
                }
            />

            {/* Benefits Section */}
            {procedure.benefits && (
                <ProcedureBenefits benefits={procedure.benefits} />
            )}

            {/* Process Section */}
            {procedure.process && (
                <ProcedureProcess steps={procedure.process} />
            )}

            {/* Main Content Section - Markdown */}
            {procedure.content ? (
                <section className='bg-white py-16 lg:py-24'>
                    <ContainerLayout>
                        <div className='mx-auto max-w-3xl'>
                            <div className='prose prose-stone prose-lg prose-headings:font-serif prose-headings:font-medium prose-p:font-light prose-p:leading-relaxed prose-a:text-gold-600 prose-a:no-underline hover:prose-a:underline mx-auto'>
                                <PostMarkdown content={procedure.content} />
                            </div>
                        </div>
                    </ContainerLayout>
                </section>
            ) : (
                <section className='py-16 lg:py-24'>
                    <ContainerLayout>
                        <div className='mx-auto max-w-3xl'>
                            <p className='text-muted-foreground text-lg leading-relaxed'>
                                At Alluring Plastic Surgery, we take pride in
                                delivering life-changing results that enhance
                                our patients&apos; natural beauty. Explore our
                                gallery of real patient transformations to see
                                the incredible outcomes from procedures like
                                Brazilian Butt Lift, Breast Augmentation,
                                Rhinoplasty, and more. Each photo reflects the
                                personalized care and attention to detail we
                                bring to every surgery.
                            </p>
                        </div>
                    </ContainerLayout>
                </section>
            )}

            {/* FAQs Section */}
            {procedure.faqs && procedure.faqs.length > 0 && (
                <FAQComponent
                    faqs={procedure.faqs}
                    title='Common Questions About Your Procedure'
                    variant='muted'
                />
            )}

            {/* Related Procedures Section */}
            {relatedProcedures.length > 0 && (
                <section className='bg-stone-50 py-16 lg:py-24'>
                    <ContainerLayout>
                        <h2 className='mb-12 text-center font-serif text-3xl text-stone-900 sm:text-4xl'>
                            Explore Other Procedures
                        </h2>
                        <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
                            {relatedProcedures.map(
                                (relatedProcedure, index) => (
                                    <ProcedureCard
                                        key={relatedProcedure.slug}
                                        procedure={relatedProcedure}
                                        index={index}
                                    />
                                )
                            )}
                        </div>
                    </ContainerLayout>
                </section>
            )}

            {/* CTA Section */}
            <CTASection
                heading='Ready to Transform Your Look?'
                description='Schedule a free consultation with our expert surgeons to discuss your goals and create a personalized treatment plan.'
                backgroundImage={procedure.image}
                primaryButton={{
                    text: 'Schedule Consultation',
                    href: '/contact',
                }}
                secondaryButton={{
                    text: 'Call Us Now',
                    href: `tel:${siteConfig.contact.phone.replace(/\D/g, '')}`,
                }}
            />
        </>
    )
}
