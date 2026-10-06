import {
    BreadcrumbSchema,
    ImageGallerySchema,
    WebPageSchema,
} from '@workspace/seo/react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { cache } from 'react'
import { ArrowLeft, Award, Users, Building2 } from 'lucide-react'

import { ContainerLayout } from '@/components/container-layout.component'
import { GalleryMediaGrid } from '@/components/gallery/gallery-media-grid.component'
import {
    GalleryProcedureCards,
    GalleryProcedureChips,
} from '@/components/gallery-page/gallery-procedure-nav.component'
import { ContentWrapper } from '@/components/shared/content-wrapper.component'
import { CTASection } from '@/components/shared/cta-section.component'
import { SectionContainer } from '@/components/shared/section-container.component'
import { siteConfig } from '@/lib/data/site-config'
import {
    getAllGalleryGroupSlugs,
    getGalleryGroupBySlug,
} from '@/lib/queries/gallery/gallery-detail.query'
import { getGalleryOverview } from '@/lib/queries/gallery/gallery-overview.query'
import { seoConfig } from '@/lib/seo-config'
import { toNextMetadata } from '@/lib/seo/metadata'
import { env } from '@/env'

type PageProps = {
    params: Promise<{ slug: string }>
}

const siteUrl = env.NEXT_PUBLIC_SITE_URL ?? siteConfig.seo.siteUrl

/**
 * Gallery groups with a procedure page to link back to. The procedure page
 * links to its gallery; this link closes the loop, so a reader who arrives on
 * the photos can reach the page that answers cost, safety and recovery (#256).
 */
const procedurePageByGroup: Record<string, { href: string; label: string }> = {
    'brazilian-butt-lift': {
        href: '/procedures/brazilian-butt-lift-bbl-miami',
        label: 'BBL in Miami: cost, safety and recovery',
    },
    'tummy-tuck': {
        href: '/procedures/tummy-tuck-miami',
        label: 'Tummy tuck in Miami: cost, safety and recovery',
    },
    liposuction: {
        href: '/procedures/liposuction-miami',
        label: 'Liposuction and Lipo 360 in Miami: cost and recovery',
    },
    'mommy-makeover': {
        href: '/procedures/mommy-makeover-miami',
        label: 'Mommy makeover in Miami: what it includes and costs',
    },
    'breast-augmentation': {
        href: '/procedures/breast-augmentation-miami',
        label: 'Breast augmentation in Miami: implants, cost and recovery',
    },
    'breast-lift': {
        href: '/procedures/breast-lift-miami',
        label: 'Breast lift in Miami: cost and recovery',
    },
    'breast-reduction': {
        href: '/procedures/breast-reduction-miami',
        label: 'Breast reduction in Miami: cost and recovery',
    },
    facelift: {
        href: '/procedures/facelift-miami',
        label: 'Facelift in Miami: cost and recovery',
    },
    blepharoplasty: {
        href: '/procedures/blepharoplasty-miami',
        label: 'Eyelid surgery in Miami: cost and recovery',
    },
}

const getCachedGroupBySlug = cache(async (slug: string) =>
    getGalleryGroupBySlug(slug)
)

export async function generateStaticParams() {
    const slugs = await getAllGalleryGroupSlugs()
    return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({
    params,
}: PageProps): Promise<Metadata> {
    const { slug } = await params
    const group = await getCachedGroupBySlug(slug)

    if (!group) {
        return { title: 'Gallery Not Found' }
    }

    const pageUrl = `${siteUrl}/gallery/${group.slug}`
    const pageTitle = `${group.name} Gallery | Before & After Photos Miami`

    return toNextMetadata(seoConfig, {
        title: pageTitle,
        description:
            group.description ??
            `View our ${group.name} gallery featuring real before and after photos from ${siteConfig.business.name} in Miami.`,
        canonical: `/gallery/${group.slug}`,
        openGraph: {
            type: 'website',
            url: pageUrl,
            title: pageTitle,
            description:
                group.description ??
                `Explore our ${group.name} photo gallery showcasing exceptional results from our board-certified surgeons.`,
            images: group.coverImage
                ? [
                      {
                          url: group.coverImage.url,
                          alt: group.coverImage.alt,
                      },
                  ]
                : undefined,
        },
        twitter: {
            card: 'summary_large_image',
            title: pageTitle,
            description:
                group.description ??
                `Explore our ${group.name} photo gallery showcasing exceptional results.`,
            images: group.coverImage ? [group.coverImage.url] : undefined,
        },
    })
}

export default async function GalleryGroupPage({ params }: PageProps) {
    const { slug } = await params
    const [group, overview] = await Promise.all([
        getCachedGroupBySlug(slug),
        getGalleryOverview(),
    ])

    if (!group) {
        notFound()
    }

    const otherProcedures = overview.procedures.filter(
        (p) => p.slug !== group.slug
    )
    const photoCount = group.media.filter((m) => m.type === 'image').length
    const videoCount = group.media.length - photoCount
    const countLine = [
        photoCount > 0 &&
            `${photoCount} ${photoCount === 1 ? 'photo' : 'photos'}`,
        videoCount > 0 &&
            `${videoCount} ${videoCount === 1 ? 'video' : 'videos'}`,
    ]
        .filter(Boolean)
        .join(' · ')

    const pageUrl = `${siteUrl}/gallery/${group.slug}`

    const procedurePage = procedurePageByGroup[group.slug]

    // Breadcrumb items
    const breadcrumbItems = [
        { name: 'Home', item: siteUrl },
        { name: 'Gallery', item: `${siteUrl}/gallery` },
        { name: group.name, item: pageUrl },
    ]

    return (
        <>
            {/* Structured Data */}
            <WebPageSchema
                name={`${group.name} Gallery | ${siteConfig.business.name}`}
                url={pageUrl}
                description={
                    group.description ??
                    `View our ${group.name} gallery featuring real before and after photos.`
                }
            />
            <BreadcrumbSchema items={breadcrumbItems} />

            <ContainerLayout as='div' noPadding size='full'>
                {/* ImageGallery Schema */}
                <ImageGallerySchema
                    name={`${group.name} Gallery`}
                    description={
                        group.description ??
                        `Photo gallery showcasing ${group.name} results`
                    }
                    url={pageUrl}
                    images={group.media.slice(0, 10).map((m) => ({
                        url: m.url,
                        name: m.title,
                        description: m.alt,
                    }))}
                />

                {/* Header Section */}
                <SectionContainer variant='default' className='pb-0'>
                    <ContentWrapper>
                        {/* Way back, and across to the other procedures */}
                        <div className='mb-10 flex flex-col gap-4 md:mb-14'>
                            <Link
                                href='/gallery'
                                className='inline-flex w-fit items-center gap-2 text-sm text-stone-600 underline-offset-4 hover:text-stone-900 hover:underline'
                            >
                                <ArrowLeft
                                    aria-hidden='true'
                                    className='h-4 w-4'
                                />
                                All results
                            </Link>
                            <GalleryProcedureChips
                                procedures={overview.procedures}
                                currentSlug={group.slug}
                            />
                        </div>

                        {/* Group Header */}
                        <div className='mb-12 max-w-3xl md:mb-16'>
                            <div className='mb-4 flex items-center gap-3'>
                                <span className='bg-gold-400 h-px w-12'></span>
                                <span className='text-gold-500 text-sm font-bold tracking-[0.2em] uppercase'>
                                    Photo Gallery
                                </span>
                            </div>

                            <h1 className='mb-6 font-serif text-4xl text-stone-900 md:text-5xl lg:text-6xl'>
                                {group.name}
                            </h1>

                            {group.description && (
                                <p className='text-lg leading-relaxed font-light text-stone-600 md:text-xl'>
                                    {group.description}
                                </p>
                            )}

                            <p className='mt-4 text-sm text-stone-500'>
                                {countLine}
                            </p>

                            {procedurePage && (
                                <p className='mt-6 text-base'>
                                    <Link
                                        href={procedurePage.href}
                                        className='decoration-gold-500 text-stone-900 underline underline-offset-4 hover:decoration-stone-900'
                                    >
                                        {procedurePage.label}
                                    </Link>
                                </p>
                            )}
                        </div>
                    </ContentWrapper>
                </SectionContainer>

                {/* Gallery Grid */}
                <SectionContainer variant='default' className='pt-0'>
                    <ContentWrapper>
                        <GalleryMediaGrid
                            media={group.media}
                            linkToDetail={false}
                        />
                    </ContentWrapper>
                </SectionContainer>

                {/* Other procedures */}
                {otherProcedures.length > 0 && (
                    <section
                        aria-labelledby='other-procedures-title'
                        className='bg-[var(--gp-linen)] py-16 md:py-24'
                    >
                        <div className='mx-auto w-full max-w-[78rem] px-5 md:px-8'>
                            <div className='flex flex-wrap items-end justify-between gap-6'>
                                <div className='max-w-[40rem]'>
                                    <p className='gp-eyebrow'>Keep exploring</p>
                                    <h2
                                        id='other-procedures-title'
                                        className='gp-display mt-5 text-[2.25rem] leading-[1.02] tracking-[-0.015em] text-balance md:text-[3rem]'
                                    >
                                        Results for <em>other</em> procedures
                                    </h2>
                                </div>
                                <Link
                                    href='/gallery'
                                    className='inline-flex items-center gap-2 rounded-full border border-[var(--gp-line)] px-5 py-2.5 text-sm transition hover:border-[var(--gp-champagne-2)] hover:bg-white'
                                >
                                    <ArrowLeft
                                        aria-hidden='true'
                                        className='h-4 w-4'
                                    />
                                    Back to the full gallery
                                </Link>
                            </div>
                            <GalleryProcedureCards
                                procedures={otherProcedures}
                                className='mt-12'
                            />
                        </div>
                    </section>
                )}

                {/* CTA Section */}
                <CTASection
                    variant='luxury'
                    eyebrow='Inspired by These Results?'
                    heading='Your Transformation Story Starts Here'
                    description='Every photo in this gallery represents a journey of confidence and self-improvement. Schedule your complimentary consultation to discuss your personal goals.'
                    primaryButton={{
                        text: 'Book Free Consultation',
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
                            icon: <Users className='h-5 w-5' />,
                            label: `${siteConfig.trustStats?.patients ?? '5,000+'} Happy Patients`,
                        },
                        {
                            icon: <Building2 className='h-5 w-5' />,
                            label: `${siteConfig.trustStats?.years ?? '15+'} Years Experience`,
                        },
                    ]}
                />
            </ContainerLayout>
        </>
    )
}
