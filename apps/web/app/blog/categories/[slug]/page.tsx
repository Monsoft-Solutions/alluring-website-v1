/**
 * Blog Category Detail Page
 *
 * Displays posts from a specific category.
 * Features luxury styling with dark header and gold accents.
 */
import { WebPageSchema } from '@workspace/seo/react'
import { ArrowLeft, FolderOpen } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { cache } from 'react'

import { InfinitePostList } from '@/components/blog/infinite-post-list.component'
import { ContentWrapper } from '@/components/shared/content-wrapper.component'
import { SectionContainer } from '@/components/shared/section-container.component'
import { getPublishedPostCardsPage } from '@/lib/queries/blog/post-list.query'
import { getActiveCategoryBySlug } from '@/lib/queries/blog/taxonomy.query'
import { seoConfig } from '@/lib/seo-config'
import { toNextMetadata } from '@/lib/seo/metadata'

type PageProps = {
    params: Promise<{ slug: string }>
}

const getCachedCategoryBySlug = cache(async (slug: string) =>
    getActiveCategoryBySlug(slug)
)

export async function generateMetadata({
    params,
}: PageProps): Promise<Metadata> {
    const { slug } = await params
    const category = await getCachedCategoryBySlug(slug)

    if (!category) {
        return { title: 'Category not found' }
    }

    return toNextMetadata(seoConfig, {
        title: `${category.name} Articles | Alluring Plastic Surgery Blog`,
        description: `Browse all articles in the ${category.name} category. Expert insights and guides from our board-certified surgeons.`,
        canonical: `/blog/categories/${category.slug}`,
    })
}

export default async function CategoryDetailPage({ params }: PageProps) {
    const { slug } = await params

    const category = await getCachedCategoryBySlug(slug)
    if (!category) {
        return (
            <main className='bg-stone-50'>
                <SectionContainer
                    variant='default'
                    className='bg-stone-900 py-24'
                >
                    <ContentWrapper size='lg' paddingX='px-6 md:px-12'>
                        <h1 className='font-serif text-3xl text-white'>
                            Category Not Found
                        </h1>
                        <p className='mt-4 text-stone-400'>
                            The category you are looking for does not exist.
                        </p>
                        <Link
                            href='/blog/categories'
                            className='text-gold-400 hover:text-gold-300 mt-8 inline-flex items-center gap-2 text-sm font-medium transition-colors'
                        >
                            <ArrowLeft className='h-4 w-4' />
                            Back to Categories
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
            categorySlug: slug,
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

    return (
        <>
            <WebPageSchema
                name={`${category.name} Articles`}
                url={`${seoConfig.siteUrl}/blog/categories/${category.slug}`}
                description={`Browse all articles in the ${category.name} category. Expert insights and guides from our board-certified surgeons.`}
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
                            href='/blog/categories'
                            className='text-gold-400 hover:text-gold-300 mb-8 inline-flex items-center gap-2 text-sm font-medium transition-colors'
                        >
                            <ArrowLeft className='h-4 w-4' />
                            All Categories
                        </Link>

                        <div className='max-w-2xl'>
                            {/* Badge */}
                            <div className='mb-4 flex items-center gap-3'>
                                <span className='bg-gold-400 h-px w-12' />
                                <span className='text-gold-500 inline-flex items-center gap-2 text-sm font-bold tracking-[0.2em] uppercase'>
                                    <FolderOpen className='h-4 w-4' />
                                    Category
                                </span>
                            </div>

                            {/* Title */}
                            <h1 className='mb-4 font-serif text-4xl text-white md:text-5xl'>
                                {category.name}
                            </h1>

                            {/* Gold accent line */}
                            <div className='bg-gold-500 mb-6 h-1 w-16 shadow-[0_0_15px_rgba(234,179,8,0.3)]' />

                            {/* Description */}
                            <p className='text-base leading-relaxed font-light text-stone-300 md:text-lg'>
                                Browse all articles in this category and
                                discover expert insights, recovery guides, and
                                best practices.
                            </p>
                        </div>
                    </ContentWrapper>
                </SectionContainer>

                {/* Posts List */}
                <InfinitePostList
                    initialPosts={initialPosts}
                    initialCursor={encodedCursor}
                    pageSize={pageSize}
                    categorySlug={slug}
                    showHeader={false}
                />
            </main>
        </>
    )
}
