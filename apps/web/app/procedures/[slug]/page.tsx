import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import {
    BreadcrumbSchema,
    FAQSchema,
    MedicalProcedureSchema,
    WebPageSchema,
} from '@workspace/seo/react'

import { ContainerLayout } from '@/components/container-layout.component'
import { BlogPostsSection } from '@/components/shared/blog-posts-section.component'
import { CTASection } from '@/components/shared/cta-section.component'
import { FAQComponent } from '@/components/shared/faq.component'
import { LastUpdated } from '@/components/shared/last-updated.component'
import { QuickAnswer } from '@/components/shared/quick-answer.component'
import { ProcedureBeforeAfterSection } from '@/components/shared/procedure-before-after-section.component'
import { PostMarkdown } from '@/components/blog/post-markdown.component'
import { procedures, getProcedureBySlug } from '@/lib/data/procedures.data'
import { siteConfig } from '@/lib/data/site-config'
import { ProcedureDetailHero } from '@/components/procedures/procedure-detail-hero.component'
import { ProcedureStats } from '@/components/procedures/procedure-stats.component'
import { ProcedureBenefits } from '@/components/procedures/procedure-benefits.component'
import { ProcedureProcess } from '@/components/procedures/procedure-process.component'
import { ProcedureCard } from '@/components/procedures/procedure-card.component'
import { ProcedureIntro } from '@/components/procedures/procedure-intro.component'
import { ProcedureGallerySection } from '@/components/procedures/procedure-gallery-section.component'
import { generateProcedureTitle } from '@/lib/seo/generate-title.util'
import { env } from '@/env'

/**
 * Maps procedure slugs to their corresponding blog category slugs
 * Procedures without a matching category will show general blog posts
 */
const procedureToBlogCategory: Record<string, string> = {
    'breast-augmentation-miami': 'breast-augmentation',
    'breast-lift-miami': 'breast-augmentation', // Related breast content
    'breast-reduction-miami': 'breast-reduction',
    'liposuction-miami': 'liposuction',
    'brazilian-butt-lift-bbl-miami': 'bbl',
    'tummy-tuck-miami': 'tummy-tuck',
    'mommy-makeover-miami': 'mommy-makeover',
    // facelift-miami and blepharoplasty-miami have no matching category
}

interface ProcedurePageProps {
    params: Promise<{
        slug: string
    }>
}

export function generateStaticParams() {
    return procedures.map((procedure) => ({
        slug: procedure.slug,
    }))
}

/**
 * Generate CTR-optimized meta description for procedure pages
 * Includes trust signals, financing mention, and clear CTA
 */
function generateProcedureDescription(procedureTitle: string): string {
    const trustStats = siteConfig.trustStats
    return `Get exceptional ${procedureTitle.toLowerCase()} results with Miami's top surgeons. ${trustStats?.patients ?? '5,000+'} procedures. Financing available. See real before & afters. Book free consultation.`
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

    // Generate SEO-optimized title with Miami location, year, and trust signal
    const pageTitle = generateProcedureTitle(procedure.title)

    // Generate CTR-optimized description
    const metaDescription = generateProcedureDescription(procedure.title)

    return {
        title: pageTitle,
        description: metaDescription,
        keywords: procedure.keywords,

        // Canonical URL
        alternates: {
            canonical: pageUrl,
        },

        // Open Graph tags for social sharing (Facebook, LinkedIn, etc.)
        openGraph: {
            type: 'website',
            url: pageUrl,
            title: pageTitle,
            description: metaDescription,
            siteName: siteConfig.business.name,
            locale: 'en_US',
            images: [
                {
                    url: ogImage,
                    width: 1200,
                    height: 630,
                    alt: `${procedure.title} Miami - ${siteConfig.business.name}`,
                },
            ],
        },

        // Twitter Card tags
        twitter: {
            card: 'summary_large_image',
            title: pageTitle,
            description: metaDescription,
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
            {/* Structured Data - WebPage Schema with freshness signals */}
            <WebPageSchema
                name={procedure.title}
                url={pageUrl}
                description={procedure.description}
                dateModified={
                    procedure.dateModified || new Date().toISOString()
                }
                speakable={{
                    cssSelector: ['h1', '.procedure-intro', '.quick-answer'],
                }}
            />

            {/* Structured Data - Breadcrumb Schema */}
            <BreadcrumbSchema items={breadcrumbItems} />

            {/* Structured Data - FAQ Schema (only if FAQs exist) */}
            {faqSchemaItems && faqSchemaItems.length > 0 && (
                <FAQSchema items={faqSchemaItems} />
            )}

            {/* Structured Data - MedicalProcedure Schema */}
            <MedicalProcedureSchema
                name={procedure.title}
                description={procedure.description}
                url={pageUrl}
                mainEntityOfPage={pageUrl}
                image={
                    procedure.image
                        ? `${siteUrl}${procedure.image}`
                        : `${siteUrl}/og-image.jpg`
                }
                bodyLocation={
                    procedure.category === 'face'
                        ? 'face'
                        : procedure.category === 'breast'
                          ? 'breast'
                          : procedure.category === 'body'
                            ? 'abdomen'
                            : undefined
                }
                howPerformed={
                    procedure.process
                        ? procedure.process
                              .map(
                                  (step) => `${step.title}: ${step.description}`
                              )
                              .join('. ')
                        : undefined
                }
                followup={
                    procedure.quickStats?.recovery
                        ? `Recovery time: ${procedure.quickStats.recovery}`
                        : undefined
                }
                procedureType='Surgical'
            />

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

            {/* Quick Answer - AI Citation Optimized */}
            {procedure.quickAnswer && (
                <section className='bg-stone-50 py-16 lg:py-20'>
                    <ContainerLayout>
                        <div className='mx-auto max-w-2xl'>
                            <QuickAnswer
                                question={procedure.quickAnswer.question}
                                answer={procedure.quickAnswer.answer}
                                details={procedure.quickAnswer.details}
                                headingLevel='h2'
                                variant='featured'
                            />
                        </div>
                    </ContainerLayout>
                </section>
            )}

            {/* Freshness Signal */}
            <div className='bg-stone-50 py-4'>
                <ContainerLayout>
                    <div className='flex justify-center'>
                        <LastUpdated
                            date={
                                procedure.dateModified ||
                                new Date().toISOString()
                            }
                            variant='badge'
                        />
                    </div>
                </ContainerLayout>
            </div>

            {/* Benefits Section */}
            {procedure.benefits && (
                <ProcedureBenefits benefits={procedure.benefits} />
            )}

            {/* Before & After Results Section */}
            <ProcedureBeforeAfterSection
                procedureSlug={params.slug}
                procedureTitle={procedure.title}
            />

            {/* Gallery Section */}
            <ProcedureGallerySection
                procedureSlug={params.slug}
                procedureTitle={procedure.title}
            />

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
                                At {siteConfig.business.name}, we take pride in
                                delivering life-changing results that enhance
                                our patients&apos; natural beauty. Explore our
                                gallery of real patient transformations to see
                                the incredible outcomes from procedures like
                                Brazilian Butt Lift, Breast Augmentation,
                                Facelift, and more. Each photo reflects the
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
                    includeSchema={false}
                />
            )}

            {/* Blog Posts Section */}
            <BlogPostsSection
                categorySlug={procedureToBlogCategory[params.slug]}
                title={`${procedure.title} Insights`}
                description={`Expert advice, recovery tips, and patient stories about ${procedure.title.toLowerCase()}`}
                badge='From Our Blog'
                variant='default'
                limit={6}
                columns={3}
            />

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
                    href: '/contact-us',
                }}
                secondaryButton={{
                    text: 'Call Us Now',
                    href: `tel:${siteConfig.contact.phone.replace(/\D/g, '')}`,
                }}
            />
        </>
    )
}
