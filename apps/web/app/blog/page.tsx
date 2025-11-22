import { WebPageSchema } from '@workspace/seo/react'
import { BookOpen, Tag } from 'lucide-react'
import type { Metadata } from 'next'

import { ContainerLayout } from '@/components/ContainerLayout.component'
import { BlogHeroSection } from '@/components/blog/BlogHeroSection.component'
import { InfinitePostList } from '@/components/blog/InfinitePostList.component'
import { Breadcrumbs } from '@/components/shared/Breadcrumbs.component'
import { getPublishedPostCardsPage } from '@/lib/queries/blog/post-list.query'
import { seoConfig } from '@/lib/seo-config'
import { toNextMetadata } from '@/lib/seo/metadata'

export const metadata: Metadata = toNextMetadata(seoConfig, {
    title: 'Blog',
    description:
        'Read our latest articles, tutorials, and insights on web development, design, and technology.',
    canonical: '/blog',
})

export default async function BlogPage() {
    const pageSize = 12
    const { items: initialPosts, nextCursor } = await getPublishedPostCardsPage(
        {
            limit: pageSize,
        }
    )

    // Encode the cursor for client-side use
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
                name='Blog'
                url={`${seoConfig.siteUrl}/blog`}
                description='Read our latest articles, tutorials, and insights on web development, design, and technology.'
            />

            <div className='mb-16'>
                <Breadcrumbs
                    items={[{ label: 'Home', href: '/' }, { label: 'Blog' }]}
                    showBackground={true}
                />
            </div>

            <BlogHeroSection
                badge={{
                    icon: <BookOpen className='mr-2 h-4 w-4' />,
                    text: 'Knowledge Hub',
                }}
                title='Our Blog'
                description={
                    <>
                        Discover insights, tutorials, and stories from our team.
                        <span className='text-foreground font-medium'>
                            {' '}
                            Stay ahead
                        </span>{' '}
                        with the latest trends, best practices, and innovative
                        approaches in web development and design.
                    </>
                }
                navigationLinks={[
                    {
                        href: '/blog/categories',
                        icon: <Tag className='h-4 w-4' />,
                        text: 'Browse by Category',
                    },
                    {
                        href: '/blog/tags',
                        icon: <Tag className='h-4 w-4' />,
                        text: 'Browse by Tag',
                    },
                ]}
            />

            <InfinitePostList
                initialPosts={initialPosts}
                initialCursor={encodedCursor}
                pageSize={pageSize}
            />
        </ContainerLayout>
    )
}
