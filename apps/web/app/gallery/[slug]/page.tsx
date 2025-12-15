import { BreadcrumbSchema, WebPageSchema } from '@workspace/seo/react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { cache } from 'react'
import { Award, Shield, Users, Building2 } from 'lucide-react'

import { GalleryMediaGrid } from '@/components/gallery/gallery-media-grid.component'
import { ContentWrapper } from '@/components/shared/content-wrapper.component'
import { CTASection } from '@/components/shared/cta-section.component'
import { SectionContainer } from '@/components/shared/section-container.component'
import { siteConfig } from '@/lib/data/site-config'
import {
    getAllGalleryGroupSlugs,
    getGalleryGroupBySlug,
} from '@/lib/queries/gallery/gallery-detail.query'
import { seoConfig } from '@/lib/seo-config'
import { toNextMetadata } from '@/lib/seo/metadata'
import { env } from '@/env'

type PageProps = {
    params: Promise<{ slug: string }>
}

const siteUrl = env.NEXT_PUBLIC_SITE_URL ?? siteConfig.seo.siteUrl

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

    return toNextMetadata(seoConfig, {
        title: `${group.name} Before & After Photos Miami`,
        description:
            group.description ??
            `View our ${group.name} gallery featuring real before and after photos from ${siteConfig.business.name} in Miami.`,
        canonical: `/gallery/${group.slug}`,
        openGraph: {
            type: 'website',
            url: pageUrl,
            title: `${group.name} Gallery | ${siteConfig.business.name}`,
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
            title: `${group.name} Gallery | ${siteConfig.business.name}`,
            description:
                group.description ??
                `Explore our ${group.name} photo gallery showcasing exceptional results.`,
            images: group.coverImage ? [group.coverImage.url] : undefined,
        },
    })
}

export default async function GalleryGroupPage({ params }: PageProps) {
    const { slug } = await params
    const group = await getCachedGroupBySlug(slug)

    if (!group) {
        notFound()
    }

    const pageUrl = `${siteUrl}/gallery/${group.slug}`

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

            {/* ImageGallery Schema */}
            <script
                type='application/ld+json'
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'ImageGallery',
                        name: `${group.name} Gallery`,
                        description:
                            group.description ??
                            `Photo gallery showcasing ${group.name} results`,
                        url: pageUrl,
                        numberOfItems: group.media.length,
                        image: group.media.slice(0, 10).map((m) => ({
                            '@type': 'ImageObject',
                            url: m.url,
                            name: m.title,
                            description: m.alt,
                        })),
                    }),
                }}
            />

            {/* Header Section */}
            <SectionContainer variant='default' className='pt-24 pb-0 md:pt-32'>
                <ContentWrapper>
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
                            {group.media.length}{' '}
                            {group.media.length === 1 ? 'photo' : 'photos'} in
                            this collection
                        </p>
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
