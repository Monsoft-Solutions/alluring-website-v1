import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { JsonLdGraph } from '@workspace/seo/react'

import { ContainerLayout } from '@/components/container-layout.component'
import { BlogPostsSection } from '@/components/shared/blog-posts-section.component'
import { CTASection } from '@/components/shared/cta-section.component'
import { FAQComponent } from '@/components/shared/faq.component'
import { LastUpdated } from '@/components/shared/last-updated.component'
import { QuickAnswer } from '@/components/shared/quick-answer.component'
import { ProcedureBeforeAfterSection } from '@/components/shared/procedure-before-after-section.component'
import { ProcedureMarkdown } from '@/components/procedures/procedure-markdown.component'
import { procedures, getProcedureBySlug } from '@/lib/data/procedures.data'
import { siteConfig } from '@/lib/data/site-config'
import { getActivePromotionByProcedure } from '@/lib/queries/promotion.query'
import { ProcedureDetailHero } from '@/components/procedures/procedure-detail-hero.component'
import { ProcedureStats } from '@/components/procedures/procedure-stats.component'
import { ProcedureBenefits } from '@/components/procedures/procedure-benefits.component'
import { ProcedureProcess } from '@/components/procedures/procedure-process.component'
import { ProcedureCard } from '@/components/procedures/procedure-card.component'
import { ProcedureIntro } from '@/components/procedures/procedure-intro.component'
import { ProcedureGallerySection } from '@/components/procedures/procedure-gallery-section.component'
import { ProcedureConsultationForm } from '@/components/procedures/procedure-consultation-form.component'
import { ProcedurePricing } from '@/components/procedures/procedure-pricing.component'
import { GoogleReviews } from '@/components/shared/google-reviews.component'
import { generateProcedureTitle } from '@/lib/seo/generate-title.util'
import {
    buildProcedureGraph,
    procedureImageUrl,
    toAbsoluteUrl,
} from '@/lib/seo/procedure-graph.util'
import { toProcedureSummary } from '@/lib/data/procedure-summary.util'
import { clampMetaDescription } from '@/lib/seo/meta-description.util'
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
    const ogImage = procedureImageUrl(procedure, siteUrl)

    // A hand-written title always wins. The generated pattern is a floor for
    // pages nobody has written metadata for, not something to override an
    // author who picked the head term deliberately.
    const pageTitle =
        procedure.seoTitle ?? generateProcedureTitle(procedure.title)

    // Same for the description. Clamping still applies either way — it is a
    // safety net against overrun, and a hand-written one under the limit
    // passes through untouched.
    const metaDescription = clampMetaDescription(
        procedure.metaDescription ??
            generateProcedureDescription(procedure.title)
    )

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

    // Related procedures, projected to what the card renders. The cards are
    // client components, so whatever they receive is serialized into the RSC
    // payload — passing whole procedures put three other procedures' markdown
    // and FAQs on this page (#250).
    const relatedProcedures = procedures
        .filter(
            (p) =>
                p.category === procedure.category && p.slug !== procedure.slug
        )
        .slice(0, 3)
        .map(toProcedureSummary)

    // Fetch related promotion for this procedure (for structured data)
    const relatedPromotion = await getActivePromotionByProcedure(params.slug)

    // The promotion, as a graph node. `offeredBy` is a reference rather than a
    // second copy of the business's address and phone number.
    const promotionOfferNode = relatedPromotion && {
        '@type': 'Offer' as const,
        '@id': `${siteUrl}/promotions/${relatedPromotion.slug}#offer`,
        name: relatedPromotion.title,
        description:
            relatedPromotion.excerpt ??
            relatedPromotion.description ??
            undefined,
        url: `${siteUrl}/promotions/${relatedPromotion.slug}`,
        availability: 'https://schema.org/LimitedAvailability',
        category: relatedPromotion.type ?? undefined,
        offeredBy: { '@id': `${siteUrl}/#organization` },
        // The Service, not the SurgicalProcedure: `itemOffered` takes a
        // Product or Service, and a MedicalProcedure is neither.
        itemOffered: { '@id': `${pageUrl}#service` },
        ...(relatedPromotion.startsAt && {
            validFrom: new Date(relatedPromotion.startsAt).toISOString(),
        }),
        ...(relatedPromotion.endsAt && {
            validThrough: new Date(relatedPromotion.endsAt).toISOString(),
            priceValidUntil: new Date(relatedPromotion.endsAt).toISOString(),
        }),
        ...(relatedPromotion.imageUrl && {
            image: toAbsoluteUrl(relatedPromotion.imageUrl, siteUrl),
        }),
    }

    // Breadcrumb items for schema
    const breadcrumbItems = [
        { name: 'Home', item: siteUrl },
        { name: 'Procedures', item: `${siteUrl}/procedures` },
        { name: procedure.title, item: pageUrl },
    ]

    return (
        <>
            {/* One structured-data graph, not one script per entity. The
                nodes reference each other and the site-wide #organization by
                @id, so the page describes a single subject (#250, #255). */}
            <JsonLdGraph
                nodes={buildProcedureGraph({
                    procedure,
                    pageUrl,
                    siteUrl,
                    faqs: procedure.faqs,
                    breadcrumbs: breadcrumbItems,
                    offer: promotionOfferNode,
                })}
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

            {/* Freshness signal. Only when there is a real date to show — it
                printed today's date for any procedure without one, which is a
                freshness claim the content does not support (#250). */}
            {procedure.dateModified && (
                <div className='bg-stone-50 py-4'>
                    <ContainerLayout>
                        <div className='flex justify-center'>
                            <LastUpdated
                                date={procedure.dateModified}
                                variant='badge'
                            />
                        </div>
                    </ContainerLayout>
                </div>
            )}

            {/* Pricing — cost is the highest-intent question a procedure query
                carries, so it sits above the fold-adjacent content rather than
                inside the markdown body. */}
            {procedure.pricing && (
                <ProcedurePricing
                    procedureTitle={procedure.title}
                    pricing={procedure.pricing}
                />
            )}

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

            {/* Google Reviews - Social Proof */}
            <GoogleReviews
                title={`What Our ${procedure.title} Patients Say`}
                subtitle='Real reviews from real patients'
                limit={3}
                featuredOnly={true}
                showGoogleLink={false}
                showViewAllButton={true}
                includeSchema={true}
            />

            {/* Process Section */}
            {procedure.process && (
                <ProcedureProcess steps={procedure.process} />
            )}

            {/* Lead Capture Form */}
            <ProcedureConsultationForm
                procedureSlug={params.slug}
                procedureTitle={procedure.title}
            />

            {/* Main Content Section - Markdown */}
            {procedure.content ? (
                <section className='bg-white py-16 lg:py-24'>
                    <ContainerLayout>
                        <div className='mx-auto max-w-3xl'>
                            <div className='prose prose-stone prose-lg prose-headings:font-serif prose-headings:font-medium prose-p:font-light prose-p:leading-relaxed prose-a:text-gold-600 prose-a:no-underline hover:prose-a:underline mx-auto'>
                                <ProcedureMarkdown
                                    content={procedure.content}
                                    contentImages={procedure.contentImages}
                                />
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
                limit={3}
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
                            {relatedProcedures.map((relatedProcedure) => (
                                <ProcedureCard
                                    key={relatedProcedure.slug}
                                    procedure={relatedProcedure}
                                    includeSchema={false}
                                />
                            ))}
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
