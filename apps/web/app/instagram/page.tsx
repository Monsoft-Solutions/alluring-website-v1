/**
 * Instagram Page
 *
 * Displays all synced Instagram posts in a grid layout.
 * SSR-paginated for SEO crawlability.
 *
 * @module app/instagram/page
 */
import type { Metadata } from 'next'
import { BreadcrumbSchema, WebPageSchema } from '@workspace/seo/react'

import { SectionContainer } from '@/components/shared/section-container.component'
import { ContentWrapper } from '@/components/shared/content-wrapper.component'
import { InstagramGrid } from '@/components/instagram/instagram-grid.component'
import { InstagramHero } from '@/components/instagram/instagram-hero.component'
import { InstagramPagination } from '@/components/instagram/instagram-pagination.component'
import { CTASection } from '@/components/shared/cta-section.component'
import {
    getInstagramPosts,
    getInstagramPostCount,
} from '@/lib/queries/instagram/instagram-list.query'
import { getInstagramProfile } from '@/lib/queries/instagram/instagram-profile.query'
import { siteConfig } from '@/lib/data/site-config'
import { seoConfig } from '@/lib/seo-config'
import { toNextMetadata } from '@/lib/seo/metadata'
import { env } from '@/env'

const siteUrl = env.NEXT_PUBLIC_SITE_URL ?? siteConfig.seo.siteUrl

/** Number of posts per page */
const PAGE_SIZE = 24

type PageProps = {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

/**
 * Generate dynamic metadata with pagination support
 */
export async function generateMetadata({
    searchParams,
}: PageProps): Promise<Metadata> {
    const params = await searchParams
    const pageParam = params.page
    const currentPage =
        typeof pageParam === 'string' ? parseInt(pageParam, 10) : 1
    const validPage = isNaN(currentPage) || currentPage < 1 ? 1 : currentPage

    // Get total pages for prev/next links
    const postCount = await getInstagramPostCount()
    const totalPages = Math.ceil(postCount / PAGE_SIZE)

    // Build canonical URL
    const canonical =
        validPage === 1 ? '/instagram' : `/instagram?page=${validPage}`

    // Build page title
    const pageTitle =
        validPage === 1
            ? 'Instagram | Follow Our Journey'
            : `Instagram | Follow Our Journey - Page ${validPage}`

    // Build page URL for Open Graph
    const pageUrl =
        validPage === 1
            ? `${siteUrl}/instagram`
            : `${siteUrl}/instagram?page=${validPage}`

    // Build alternates with canonical
    const alternates: NonNullable<Metadata['alternates']> & {
        prev?: string
        next?: string
    } = {
        canonical,
    }

    // Add prev link (if not on first page)
    if (validPage > 1) {
        const prevPage = validPage - 1
        alternates.prev =
            prevPage === 1 ? '/instagram' : `/instagram?page=${prevPage}`
    }

    // Add next link (if not on last page)
    if (validPage < totalPages) {
        alternates.next = `/instagram?page=${validPage + 1}`
    }

    return toNextMetadata(seoConfig, {
        title: pageTitle,
        description:
            "Follow Alluring Plastic Surgery on Instagram. See real patient transformations, behind-the-scenes content, and the latest in cosmetic surgery from Miami's top plastic surgeons.",
        keywords: [
            'alluring plastic surgery instagram',
            'plastic surgery before after instagram',
            'cosmetic surgery miami instagram',
            'bbl transformation instagram',
            'plastic surgeon social media',
        ],
        openGraph: {
            type: 'website',
            url: pageUrl,
            title: pageTitle,
            description:
                "Follow Alluring Plastic Surgery on Instagram. See real patient transformations, behind-the-scenes content, and the latest in cosmetic surgery from Miami's top plastic surgeons.",
            siteName: siteConfig.business.name,
            images: [
                {
                    url: `${siteUrl}/og-image.jpg`,
                    width: 1200,
                    height: 630,
                    alt: `Instagram - ${siteConfig.business.name}`,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: pageTitle,
            description:
                "Follow Alluring Plastic Surgery on Instagram. See real patient transformations and the latest in cosmetic surgery from Miami's top plastic surgeons.",
            images: [`${siteUrl}/og-image.jpg`],
        },
        alternates: alternates as Metadata['alternates'],
    })
}

export default async function InstagramPage({ searchParams }: PageProps) {
    const params = await searchParams
    const pageParam = params.page
    const currentPage =
        typeof pageParam === 'string' ? parseInt(pageParam, 10) : 1
    const validPage = isNaN(currentPage) || currentPage < 1 ? 1 : currentPage

    // Fetch data in parallel
    const [postsResult, profile] = await Promise.all([
        getInstagramPosts(validPage, PAGE_SIZE),
        getInstagramProfile(),
    ])

    const { posts, total, totalPages } = postsResult

    // Build page URL for structured data
    const pageUrl = `${siteUrl}/instagram`

    // Breadcrumb items for schema
    const breadcrumbItems = [
        { name: 'Home', item: siteUrl },
        { name: 'Instagram', item: pageUrl },
    ]

    const instagramUrl =
        siteConfig.social.find((s) => s.platform === 'instagram')?.url ??
        'https://instagram.com/alluringplasticsurgery'

    return (
        <>
            {/* Structured Data - WebPage Schema */}
            <WebPageSchema
                name={`Instagram | ${siteConfig.business.name}`}
                url={pageUrl}
                description='Follow our Instagram for real patient transformations, behind-the-scenes content, and the latest in cosmetic surgery.'
            />

            {/* Structured Data - Breadcrumb Schema */}
            <BreadcrumbSchema items={breadcrumbItems} />

            {/* Hero Section with Profile Info */}
            <InstagramHero profile={profile} totalPosts={total} />

            {/* Posts Grid */}
            <SectionContainer className='bg-white pb-8'>
                <ContentWrapper size='lg'>
                    <InstagramGrid posts={posts} />
                    <InstagramPagination
                        currentPage={validPage}
                        totalPages={totalPages}
                    />
                </ContentWrapper>
            </SectionContainer>

            {/* CTA Section */}
            <CTASection
                variant='luxury'
                eyebrow='Start Your Transformation'
                heading='Ready to Make a Change?'
                description='Every transformation starts with a single conversation. Schedule your free consultation with our board-certified surgeons.'
                primaryButton={{
                    text: 'Schedule Your Consultation',
                    href: '/contact-us',
                }}
                secondaryButton={{
                    text: 'Follow Us on Instagram',
                    href: instagramUrl,
                }}
                backgroundImage='/images/hero-beautiful-latin-woman.jpg'
            />
        </>
    )
}
