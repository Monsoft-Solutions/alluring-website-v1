/**
 * Blog Categories Index Page
 *
 * Lists all active blog categories with post counts.
 * Features luxury styling with dark header and gold accents.
 */
import { WebPageSchema } from '@workspace/seo/react'
import { ArrowRight, Tag, Zap } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'

import { BlogSubpageHeader } from '@/components/blog/blog-subpage-header.component'
import { ContentWrapper } from '@/components/shared/content-wrapper.component'
import { SectionContainer } from '@/components/shared/section-container.component'
import { listActiveCategoriesWithCounts } from '@/lib/queries/blog/taxonomy.query'
import { seoConfig } from '@/lib/seo-config'
import { toNextMetadata } from '@/lib/seo/metadata'

export const metadata: Metadata = toNextMetadata(seoConfig, {
    title: 'Blog Categories',
    description:
        'Browse our plastic surgery blog posts by category. Find articles on procedures, recovery tips, patient stories, and expert advice.',
    canonical: '/blog/categories',
})

export default async function CategoriesIndexPage() {
    const categories = await listActiveCategoriesWithCounts()

    return (
        <>
            <WebPageSchema
                name='Blog Categories'
                url={`${seoConfig.siteUrl}/blog/categories`}
                description='Browse our plastic surgery blog posts by category. Find articles on procedures, recovery tips, patient stories, and expert advice.'
            />

            <main className='bg-stone-50'>
                {/* Header */}
                <BlogSubpageHeader
                    badge='Browse by Topic'
                    title='Categories'
                    description='Explore articles organized by topic and discover content that matches your interests and needs.'
                    navigationLinks={[
                        {
                            href: '/blog',
                            icon: <Zap className='h-4 w-4' />,
                            text: 'All Articles',
                        },
                        {
                            href: '/blog/tags',
                            icon: <Tag className='h-4 w-4' />,
                            text: 'Browse by Tag',
                        },
                    ]}
                />

                {/* Categories Grid */}
                <SectionContainer variant='muted' className='py-16 md:py-24'>
                    <ContentWrapper size='lg' paddingX='px-6 md:px-12'>
                        <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
                            {categories.map((cat, index) => (
                                <Link
                                    key={cat.id}
                                    href={`/blog/categories/${cat.slug}`}
                                    className='group animate-fade-in-up hover:border-gold-500/30 hover:shadow-gold-500/5 relative flex items-center justify-between overflow-hidden rounded-xl border border-stone-200/80 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl'
                                    style={{
                                        animationDelay: `${index * 50}ms`,
                                        animationFillMode: 'backwards',
                                    }}
                                >
                                    <div className='flex-1'>
                                        <h2 className='mb-2 font-serif text-xl text-stone-900 transition-colors duration-200 group-hover:text-stone-700'>
                                            {cat.name}
                                        </h2>
                                        {typeof cat.count === 'number' && (
                                            <p className='text-sm text-stone-500'>
                                                {cat.count} article
                                                {cat.count === 1 ? '' : 's'}
                                            </p>
                                        )}
                                    </div>
                                    <ArrowRight
                                        className='text-gold-500 ml-4 h-5 w-5 flex-shrink-0 transition-all duration-200 group-hover:translate-x-1'
                                        aria-hidden='true'
                                    />

                                    {/* Gold accent line at bottom on hover */}
                                    <div className='bg-gold-500 absolute right-0 bottom-0 left-0 h-0.5 origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100' />
                                </Link>
                            ))}
                        </div>

                        {categories.length === 0 && (
                            <div className='py-16 text-center'>
                                <p className='text-stone-500'>
                                    No categories found.
                                </p>
                            </div>
                        )}
                    </ContentWrapper>
                </SectionContainer>
            </main>
        </>
    )
}
