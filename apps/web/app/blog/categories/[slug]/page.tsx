import { WebPageSchema } from '@workspace/seo/react'
import type { Metadata } from 'next'
import { cache } from 'react'

import { ContainerLayout } from '@/components/container-layout.component'
import { InfinitePostList } from '@/components/blog/infinite-post-list.component'
import { Breadcrumbs } from '@/components/shared/breadcrumbs.component'
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
        title: `${category.name} Articles`,
        description: `Browse all articles in the ${category.name} category. Stay updated with our latest insights and tutorials.`,
        canonical: `/blog/categories/${category.slug}`,
    })
}

export default async function CategoryDetailPage({ params }: PageProps) {
    const { slug } = await params

    const category = await getCachedCategoryBySlug(slug)
    if (!category) {
        return (
            <ContainerLayout className='py-12 lg:py-16'>
                <h1 className='text-2xl font-semibold'>Category not found</h1>
                <p className='text-muted-foreground mt-2'>
                    The category you are looking for does not exist.
                </p>
            </ContainerLayout>
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
        <ContainerLayout as='main' className='py-16 lg:py-20'>
            <WebPageSchema
                name={`${category.name} Articles`}
                url={`${seoConfig.siteUrl}/blog/categories/${category.slug}`}
                description={`Browse all articles in the ${category.name} category. Stay updated with our latest insights and tutorials.`}
            />

            <div className='mb-16'>
                <Breadcrumbs
                    items={[
                        { label: 'Home', href: '/' },
                        { label: 'Blog', href: '/blog' },
                        { label: 'Categories', href: '/blog/categories' },
                        { label: category.name },
                    ]}
                    showBackground={false}
                />
            </div>

            <header className='mb-20 space-y-10'>
                <div className='space-y-6'>
                    <div className='flex flex-wrap items-center gap-4'>
                        <h1 className='text-foreground text-4xl leading-tight font-bold tracking-tight sm:text-5xl sm:leading-tight lg:text-6xl lg:leading-tight'>
                            {category.name}
                        </h1>
                        <span className='bg-primary/10 text-primary inline-flex items-center rounded-full px-4 py-2 text-sm font-medium'>
                            Category
                        </span>
                    </div>
                    <p className='text-muted-foreground max-w-3xl text-lg leading-relaxed sm:text-xl sm:leading-relaxed'>
                        Browse all articles in this category and discover
                        insights, tutorials, and best practices.
                    </p>
                </div>
            </header>

            <InfinitePostList
                initialPosts={initialPosts}
                initialCursor={encodedCursor}
                pageSize={pageSize}
                categorySlug={slug}
            />
        </ContainerLayout>
    )
}
