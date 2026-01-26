/**
 * Blog Category Detail Page
 *
 * Displays posts from a specific category with enhanced content for SEO/LLM optimization.
 * Features luxury styling with dark header and gold accents.
 * Includes category-specific descriptions, FAQs, and related category links.
 */
import {
    BreadcrumbSchema,
    CollectionPageSchema,
    FAQSchema,
    WebPageSchema,
} from '@workspace/seo/react'
import { ArrowLeft, ArrowRight, FolderOpen } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { cache } from 'react'

import { InfinitePostList } from '@/components/blog/infinite-post-list.component'
import { ContentWrapper } from '@/components/shared/content-wrapper.component'
import { FAQComponent } from '@/components/shared/faq.component'
import { SectionContainer } from '@/components/shared/section-container.component'
import { getCategoryDescription } from '@/lib/data/category-descriptions.data'
import { getPublishedPostCardsPage } from '@/lib/queries/blog/post-list.query'
import {
    getActiveCategoryBySlug,
    listActiveCategoriesWithCounts,
} from '@/lib/queries/blog/taxonomy.query'
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

    // Get enhanced description if available
    const categoryDescription = getCategoryDescription(slug)
    const description =
        categoryDescription?.shortDescription ||
        `Browse all articles in the ${category.name} category. Expert insights and guides from our board-certified surgeons.`

    const title = categoryDescription?.title || `${category.name} Articles`

    return toNextMetadata(seoConfig, {
        title,
        description,
        canonical: `/blog/categories/${category.slug}`,
    })
}

export default async function CategoryDetailPage({ params }: PageProps) {
    const { slug } = await params

    const [category, allCategories] = await Promise.all([
        getCachedCategoryBySlug(slug),
        listActiveCategoriesWithCounts(),
    ])

    // Get enhanced description if available
    const categoryDescription = getCategoryDescription(slug)
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

    // Get related categories for internal linking
    const relatedCategorySlugs = categoryDescription?.relatedCategories || []
    const relatedCategories = allCategories.filter((cat) =>
        relatedCategorySlugs.includes(cat.slug)
    )

    // Prepare FAQ items for schema
    const faqItems = categoryDescription?.faqs?.map((faq) => ({
        question: faq.question,
        answer: faq.answer,
    }))

    const pageDescription =
        categoryDescription?.shortDescription ||
        `Browse all articles in the ${category.name} category. Expert insights and guides from our board-certified surgeons.`

    const pageTitle = categoryDescription?.title || `${category.name} Articles`

    // Breadcrumb items for navigation schema
    const breadcrumbItems = [
        { name: 'Home', item: seoConfig.siteUrl },
        { name: 'Blog', item: `${seoConfig.siteUrl}/blog` },
        {
            name: category.name,
            item: `${seoConfig.siteUrl}/blog/categories/${category.slug}`,
        },
    ]

    return (
        <>
            <WebPageSchema
                name={pageTitle}
                url={`${seoConfig.siteUrl}/blog/categories/${category.slug}`}
                description={pageDescription}
            />

            {/* Breadcrumb Schema for navigation signals */}
            <BreadcrumbSchema items={breadcrumbItems} />

            {/* FAQ Schema if FAQs exist */}
            {faqItems && faqItems.length > 0 && <FAQSchema items={faqItems} />}

            {/* CollectionPage Schema for enhanced category page SEO */}
            <CollectionPageSchema
                url={`${seoConfig.siteUrl}/blog/categories/${category.slug}`}
                name={pageTitle}
                description={pageDescription}
                about={{
                    // Use MedicalSpecialty for surgery-related categories
                    '@type': 'MedicalSpecialty',
                    name: category.name,
                    description:
                        categoryDescription?.shortDescription ??
                        `Information about ${category.name} procedures and treatments`,
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
                numberOfItems={initialPosts.length}
                isCategory={true}
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

                            {/* Description - Enhanced if available */}
                            <p className='text-base leading-relaxed font-light text-stone-300 md:text-lg'>
                                {pageDescription}
                            </p>
                        </div>
                    </ContentWrapper>
                </SectionContainer>

                {/* Full Description Section - Enhanced content for LLM/SEO */}
                {categoryDescription?.fullDescription && (
                    <SectionContainer variant='default' className='py-12'>
                        <ContentWrapper size='lg' paddingX='px-6 md:px-12'>
                            <article className='mx-auto max-w-3xl'>
                                <div className='prose prose-stone prose-lg prose-headings:font-serif prose-p:font-light prose-p:leading-relaxed'>
                                    {categoryDescription.fullDescription
                                        .split('\n\n')
                                        .map((paragraph, i) => (
                                            <p key={i}>{paragraph}</p>
                                        ))}
                                </div>
                            </article>
                        </ContentWrapper>
                    </SectionContainer>
                )}

                {/* Posts List */}
                <InfinitePostList
                    initialPosts={initialPosts}
                    initialCursor={encodedCursor}
                    pageSize={pageSize}
                    categorySlug={slug}
                    showHeader={false}
                />

                {/* FAQs Section */}
                {categoryDescription?.faqs &&
                    categoryDescription.faqs.length > 0 && (
                        <FAQComponent
                            faqs={categoryDescription.faqs}
                            title={`Frequently Asked Questions About ${category.name}`}
                            variant='muted'
                            includeSchema={false} // Schema is already added above
                        />
                    )}

                {/* Related Categories Section */}
                {relatedCategories.length > 0 && (
                    <SectionContainer variant='default' className='py-16'>
                        <ContentWrapper size='lg' paddingX='px-6 md:px-12'>
                            <h2 className='mb-8 font-serif text-2xl text-stone-900 md:text-3xl'>
                                Related Topics
                            </h2>
                            <div className='flex flex-wrap gap-4'>
                                {relatedCategories.map((relatedCat) => (
                                    <Link
                                        key={relatedCat.id}
                                        href={`/blog/categories/${relatedCat.slug}`}
                                        className='group hover:border-gold-400 hover:text-gold-600 inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-5 py-2.5 text-sm font-medium text-stone-700 transition-all'
                                    >
                                        {relatedCat.name}
                                        <ArrowRight className='h-4 w-4 transition-transform group-hover:translate-x-1' />
                                    </Link>
                                ))}
                            </div>
                        </ContentWrapper>
                    </SectionContainer>
                )}
            </main>
        </>
    )
}
