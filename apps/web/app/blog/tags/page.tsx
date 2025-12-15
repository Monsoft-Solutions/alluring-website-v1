/**
 * Blog Tags Index Page
 *
 * Lists all active blog tags with post counts.
 * Features luxury styling with dark header and gold accents.
 */
import { WebPageSchema } from '@workspace/seo/react'
import { Hash, Tag, Zap } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'

import { BlogSubpageHeader } from '@/components/blog/blog-subpage-header.component'
import { ContentWrapper } from '@/components/shared/content-wrapper.component'
import { SectionContainer } from '@/components/shared/section-container.component'
import { listActiveTagsWithCounts } from '@/lib/queries/blog/taxonomy.query'
import { seoConfig } from '@/lib/seo-config'
import { toNextMetadata } from '@/lib/seo/metadata'

export const metadata: Metadata = toNextMetadata(seoConfig, {
    title: 'Blog Tags',
    description:
        'Browse our plastic surgery blog posts by tag. Discover content on specific procedures and topics.',
    canonical: '/blog/tags',
})

export default async function TagsIndexPage() {
    const tags = await listActiveTagsWithCounts()

    // Sort tags by count (descending) for better visual hierarchy
    const sortedTags = [...tags].sort((a, b) => (b.count ?? 0) - (a.count ?? 0))

    return (
        <>
            <WebPageSchema
                name='Blog Tags'
                url={`${seoConfig.siteUrl}/blog/tags`}
                description='Browse our plastic surgery blog posts by tag. Discover content on specific procedures and topics.'
            />

            <main className='bg-stone-50'>
                {/* Header */}
                <BlogSubpageHeader
                    badge='Browse by Tag'
                    title='Tags'
                    description='Explore articles by tag and discover content on specific topics and procedures that interest you.'
                    navigationLinks={[
                        {
                            href: '/blog',
                            icon: <Zap className='h-4 w-4' />,
                            text: 'All Articles',
                        },
                        {
                            href: '/blog/categories',
                            icon: <Tag className='h-4 w-4' />,
                            text: 'Browse by Category',
                        },
                    ]}
                />

                {/* Tags Cloud */}
                <SectionContainer variant='muted' className='py-16 md:py-24'>
                    <ContentWrapper size='lg' paddingX='px-6 md:px-12'>
                        <div className='flex flex-wrap gap-3'>
                            {sortedTags.map((tag, index) => (
                                <Link
                                    key={tag.id}
                                    href={`/blog/tags/${tag.slug}`}
                                    className='group animate-fade-in-up hover:border-gold-500/50 inline-flex items-center gap-2 rounded-full border border-stone-200/80 bg-white px-4 py-2.5 shadow-sm transition-all duration-200 hover:bg-stone-50 hover:shadow-md'
                                    style={{
                                        animationDelay: `${index * 20}ms`,
                                        animationFillMode: 'backwards',
                                    }}
                                >
                                    <Hash
                                        className='text-gold-500 h-4 w-4 transition-transform duration-200 group-hover:rotate-12'
                                        aria-hidden='true'
                                    />
                                    <span className='font-medium text-stone-700 transition-colors duration-200 group-hover:text-stone-900'>
                                        {tag.name}
                                    </span>
                                    {typeof tag.count === 'number' && (
                                        <span className='group-hover:bg-gold-500/10 group-hover:text-gold-600 rounded-full bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-500 transition-colors duration-200'>
                                            {tag.count}
                                        </span>
                                    )}
                                </Link>
                            ))}
                        </div>

                        {sortedTags.length === 0 && (
                            <div className='py-16 text-center'>
                                <p className='text-stone-500'>No tags found.</p>
                            </div>
                        )}
                    </ContentWrapper>
                </SectionContainer>
            </main>
        </>
    )
}
