import { BreadcrumbSchema, WebPageSchema } from '@workspace/seo/react'
import { Award, Shield, Users, Building2 } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@workspace/ui/components/button'

import { ContentWrapper } from '@/components/shared/content-wrapper.component'
import { SectionContainer } from '@/components/shared/section-container.component'
import { CTASection } from '@/components/shared/cta-section.component'
import { TestimonialCard } from '@/components/testimonials/testimonial-card.component'
import { siteConfig } from '@/lib/data/site-config'
import {
    getPublishedTestimonials,
    getTestimonialProcedures,
} from '@/lib/queries/testimonials/testimonial.query'
import { seoConfig } from '@/lib/seo-config'
import { toNextMetadata } from '@/lib/seo/metadata'
import { env } from '@/env'

const siteUrl = env.NEXT_PUBLIC_SITE_URL ?? siteConfig.seo.siteUrl
const pageUrl = `${siteUrl}/testimonials`

const pageTitle = 'Patient Testimonials | Real Stories from Real Patients'

export const metadata = toNextMetadata(seoConfig, {
    canonical: '/testimonials',
    title: pageTitle,
    description:
        'Hear from real patients about their transformation journey at Alluring Plastic Surgery. Read and watch video testimonials from Brazilian butt lift, tummy tuck, breast augmentation, and more.',
    keywords: [
        'plastic surgery testimonials',
        'patient reviews Miami',
        'cosmetic surgery reviews',
        'BBL testimonials',
        'breast augmentation reviews',
        'tummy tuck testimonials',
        'plastic surgery patient stories',
        'real patient results',
    ],
    openGraph: {
        type: 'website',
        url: pageUrl,
        title: pageTitle,
        description:
            'Hear from real patients about their transformation journey at Alluring Plastic Surgery. Read and watch video testimonials.',
        siteName: siteConfig.business.name,
        images: [
            {
                url: `${siteUrl}/og-image.jpg`,
                width: 1200,
                height: 630,
                alt: `Patient Testimonials at ${siteConfig.business.name} Miami`,
            },
        ],
    },
    robots: {
        index: true,
        follow: true,
    },
})

type SearchParams = Promise<{
    procedure?: string
    page?: string
}>

export default async function TestimonialsPage({
    searchParams,
}: {
    searchParams: SearchParams
}) {
    const params = await searchParams
    const pageSize = 12
    const currentPage = Number(params.page) || 1

    // Fetch data in parallel
    const [{ testimonials, total }, procedures] = await Promise.all([
        getPublishedTestimonials({
            page: currentPage,
            pageSize,
            procedureSlug: params.procedure,
        }),
        getTestimonialProcedures(),
    ])

    const totalPages = Math.ceil(total / pageSize)

    // Breadcrumb items for schema
    const breadcrumbItems = [
        { name: 'Home', item: siteUrl },
        { name: 'Testimonials', item: pageUrl },
    ]

    return (
        <>
            {/* Structured Data - WebPage Schema */}
            <WebPageSchema
                name={`Patient Testimonials | ${siteConfig.business.name} Miami`}
                url={pageUrl}
                description={`Read and watch video testimonials from real patients at ${siteConfig.business.name}. Discover their transformation journey and results.`}
            />

            {/* Structured Data - Breadcrumb Schema */}
            <BreadcrumbSchema items={breadcrumbItems} />

            {/* Hero Section */}
            <SectionContainer className='bg-gradient-to-b from-stone-50 to-white py-16 lg:py-24'>
                <ContentWrapper>
                    <div className='mx-auto max-w-3xl text-center'>
                        <span className='text-gold-600 mb-4 inline-block text-sm font-medium tracking-wider uppercase'>
                            Patient Stories
                        </span>
                        <h1 className='mb-6 font-serif text-4xl font-medium text-stone-900 md:text-5xl lg:text-6xl'>
                            Real Patients, Real Results
                        </h1>
                        <p className='text-lg leading-relaxed text-stone-600'>
                            Hear directly from our patients about their
                            transformation journey. Watch video testimonials and
                            read reviews from real people who trusted us with
                            their care.
                        </p>
                    </div>
                </ContentWrapper>
            </SectionContainer>

            {/* Filters */}
            {procedures.length > 0 && (
                <SectionContainer className='border-b border-stone-100 bg-white py-4'>
                    <ContentWrapper>
                        <div className='flex flex-wrap items-center gap-2'>
                            <span className='text-sm font-medium text-stone-500'>
                                Filter by procedure:
                            </span>
                            <Link href='/testimonials'>
                                <Button
                                    variant={
                                        !params.procedure
                                            ? 'secondary'
                                            : 'ghost'
                                    }
                                    size='sm'
                                >
                                    All
                                </Button>
                            </Link>
                            {procedures.map((proc) => (
                                <Link
                                    key={proc.procedureSlug ?? proc.procedure}
                                    href={`/testimonials?procedure=${proc.procedureSlug}`}
                                >
                                    <Button
                                        variant={
                                            params.procedure ===
                                            proc.procedureSlug
                                                ? 'secondary'
                                                : 'ghost'
                                        }
                                        size='sm'
                                    >
                                        {proc.procedure} ({proc.count})
                                    </Button>
                                </Link>
                            ))}
                        </div>
                    </ContentWrapper>
                </SectionContainer>
            )}

            {/* Testimonials Grid */}
            <SectionContainer className='bg-stone-50 py-16'>
                <ContentWrapper>
                    {testimonials.length === 0 ? (
                        <div className='py-16 text-center'>
                            <p className='text-lg text-stone-500'>
                                No testimonials found for this filter.
                            </p>
                            <Link href='/testimonials'>
                                <Button variant='outline' className='mt-4'>
                                    View all testimonials
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
                                {testimonials.map((testimonial) => (
                                    <TestimonialCard
                                        key={testimonial.id}
                                        testimonial={testimonial}
                                    />
                                ))}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className='mt-12 flex items-center justify-center gap-2'>
                                    {currentPage > 1 && (
                                        <Link
                                            href={`/testimonials?page=${currentPage - 1}${params.procedure ? `&procedure=${params.procedure}` : ''}`}
                                        >
                                            <Button variant='outline'>
                                                Previous
                                            </Button>
                                        </Link>
                                    )}
                                    <span className='px-4 text-sm text-stone-600'>
                                        Page {currentPage} of {totalPages}
                                    </span>
                                    {currentPage < totalPages && (
                                        <Link
                                            href={`/testimonials?page=${currentPage + 1}${params.procedure ? `&procedure=${params.procedure}` : ''}`}
                                        >
                                            <Button variant='outline'>
                                                Next
                                            </Button>
                                        </Link>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </ContentWrapper>
            </SectionContainer>

            {/* CTA Section */}
            <CTASection
                variant='luxury'
                eyebrow='Ready to Start Your Journey?'
                heading='Your Story Could Be Next'
                description='Join thousands of satisfied patients who have transformed their lives. Schedule your free consultation and take the first step toward your dream results.'
                primaryButton={{
                    text: 'Schedule Your Consultation',
                    href: '/contact-us',
                }}
                secondaryButton={{
                    text: 'Call Us Now',
                    href: `tel:${siteConfig.contact.phone.replace(/\D/g, '')}`,
                }}
                backgroundImage='/images/hero-beautiful-latin-woman.jpg'
                trustBadges={[
                    {
                        icon: <Award className='h-5 w-5' />,
                        label: 'Board-Certified Surgeons',
                    },
                    {
                        icon: <Shield className='h-5 w-5' />,
                        label: 'Accredited Facility',
                    },
                    {
                        icon: <Users className='h-5 w-5' />,
                        label: `${siteConfig.trustStats?.patients ?? '5,000+'} Happy Patients`,
                    },
                    {
                        icon: <Building2 className='h-5 w-5' />,
                        label: `${siteConfig.trustStats?.years ?? '15+'} Years Experience`,
                    },
                ]}
            />
        </>
    )
}
