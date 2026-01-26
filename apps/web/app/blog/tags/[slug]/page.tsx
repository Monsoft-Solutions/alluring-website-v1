/**
 * Blog Tag Detail Page
 *
 * Displays posts with a specific tag.
 * Features luxury styling with dark header and gold accents.
 */
import {
    BreadcrumbSchema,
    CollectionPageSchema,
    WebPageSchema,
} from '@workspace/seo/react'
import { ArrowLeft, Hash } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { cache } from 'react'

import { InfinitePostList } from '@/components/blog/infinite-post-list.component'
import { ContentWrapper } from '@/components/shared/content-wrapper.component'
import { SectionContainer } from '@/components/shared/section-container.component'
import { getPublishedPostCardsPage } from '@/lib/queries/blog/post-list.query'
import {
    getActiveTagBySlug,
    listActiveTagsWithCounts,
} from '@/lib/queries/blog/taxonomy.query'
import { seoConfig } from '@/lib/seo-config'
import { toNextMetadata } from '@/lib/seo/metadata'

type PageProps = {
    params: Promise<{ slug: string }>
}

const getCachedTagBySlug = cache(async (slug: string) =>
    getActiveTagBySlug(slug)
)

export async function generateMetadata({
    params,
}: PageProps): Promise<Metadata> {
    const { slug } = await params
    const tag = await getCachedTagBySlug(slug)

    if (!tag) {
        return { title: 'Tag not found' }
    }

    return toNextMetadata(seoConfig, {
        title: `${tag.name} Articles`,
        description: `Explore articles tagged with ${tag.name}. Expert insights and guides from our board-certified surgeons.`,
        canonical: `/blog/tags/${tag.slug}`,
    })
}

export default async function TagDetailPage({ params }: PageProps) {
    const { slug } = await params

    const [tag, allTags] = await Promise.all([
        getCachedTagBySlug(slug),
        listActiveTagsWithCounts(),
    ])

    if (!tag) {
        return (
            <main className='bg-stone-50'>
                <SectionContainer
                    variant='default'
                    className='bg-stone-900 py-24'
                >
                    <ContentWrapper size='lg' paddingX='px-6 md:px-12'>
                        <h1 className='font-serif text-3xl text-white'>
                            Tag Not Found
                        </h1>
                        <p className='mt-4 text-stone-400'>
                            The tag you are looking for does not exist.
                        </p>
                        <Link
                            href='/blog/tags'
                            className='text-gold-400 hover:text-gold-300 mt-8 inline-flex items-center gap-2 text-sm font-medium transition-colors'
                        >
                            <ArrowLeft className='h-4 w-4' />
                            Back to Tags
                        </Link>
                    </ContentWrapper>
                </SectionContainer>
            </main>
        )
    }

    const pageSize = 12
    const { items: initialPosts, nextCursor } = await getPublishedPostCardsPage(
        {
            limit: pageSize,
            tagSlug: slug,
        }
    )

    const encodedCursor = nextCursor
        ? Buffer.from(
              JSON.stringify({
                  publishedAt: nextCursor.publishedAt.toISOString(),
                  id: nextCursor.id,
              })
          ).toString('base64')
        : undefined

    // Breadcrumb items for navigation schema
    const breadcrumbItems = [
        { name: 'Home', item: seoConfig.siteUrl },
        { name: 'Blog', item: `${seoConfig.siteUrl}/blog` },
        {
            name: tag.name,
            item: `${seoConfig.siteUrl}/blog/tags/${tag.slug}`,
        },
    ]

    return (
        <>
            <WebPageSchema
                name={`${tag.name} Articles`}
                url={`${seoConfig.siteUrl}/blog/tags/${tag.slug}`}
                description={`Explore articles tagged with ${tag.name}. Expert insights and guides from our board-certified surgeons.`}
            />

            {/* Breadcrumb Schema for navigation signals */}
            <BreadcrumbSchema items={breadcrumbItems} />

            {/* CollectionPage Schema for enhanced tag page SEO */}
            <CollectionPageSchema
                url={`${seoConfig.siteUrl}/blog/tags/${tag.slug}`}
                name={`${tag.name} Articles`}
                description={`Explore articles tagged with ${tag.name}. Expert insights and guides from our board-certified surgeons.`}
                about={{
                    '@type': 'Thing',
                    name: tag.name,
                    description: `Topics related to ${tag.name} in plastic surgery`,
                }}
                hasPart={initialPosts.map((post) => ({
                    url: `${seoConfig.siteUrl}/${post.slug}`,
                    name: post.title,
                    headline: post.title,
                    description: post.excerpt ?? undefined,
                    image: post.featuredImage?.url,
                    datePublished: post.publishedAt ?? undefined,
                    author: post.author?.name ?? 'Alluring Plastic Surgery',
                }))}
                numberOfItems={
                    allTags.find((t) => t.slug === slug)?.count ??
                    initialPosts.length
                }
                isCategory={false}
            />

            <main className='bg-stone-50'>
                {/* Header */}
                <SectionContainer
                    variant='default'
                    className='bg-stone-900 py-16 md:py-24'
                >
                    <ContentWrapper size='lg' paddingX='px-6 md:px-12'>
                        {/* Back Link */}
                        <Link
                            href='/blog/tags'
                            className='text-gold-400 hover:text-gold-300 mb-8 inline-flex items-center gap-2 text-sm font-medium transition-colors'
                        >
                            <ArrowLeft className='h-4 w-4' />
                            All Tags
                        </Link>

                        <div className='max-w-2xl'>
                            {/* Badge */}
                            <div className='mb-4 flex items-center gap-3'>
                                <span className='bg-gold-400 h-px w-12' />
                                <span className='text-gold-500 inline-flex items-center gap-2 text-sm font-bold tracking-[0.2em] uppercase'>
                                    <Hash className='h-4 w-4' />
                                    Tag
                                </span>
                            </div>

                            {/* Title */}
                            <div className='mb-4 flex items-center gap-3'>
                                <span
                                    className='text-gold-500/50 text-4xl font-light md:text-5xl'
                                    aria-hidden='true'
                                >
                                    #
                                </span>
                                <h1 className='font-serif text-4xl text-white md:text-5xl'>
                                    {tag.name}
                                </h1>
                            </div>

                            {/* Gold accent line */}
                            <div className='bg-gold-500 mb-6 h-1 w-16 shadow-[0_0_15px_rgba(234,179,8,0.3)]' />

                            {/* Description */}
                            <p className='text-base leading-relaxed font-light text-stone-300 md:text-lg'>
                                Explore articles tagged with this topic and
                                discover related insights, guides, and best
                                practices.
                            </p>
                        </div>
                    </ContentWrapper>
                </SectionContainer>

                {/* Posts List */}
                <InfinitePostList
                    initialPosts={initialPosts}
                    initialCursor={encodedCursor}
                    pageSize={pageSize}
                    tagSlug={slug}
                    showHeader={false}
                />
            </main>
        </>
    )
}
