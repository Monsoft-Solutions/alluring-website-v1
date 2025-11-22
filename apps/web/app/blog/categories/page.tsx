import { WebPageSchema } from '@workspace/seo/react'
import { ArrowRight, Tag, Zap } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'

import { ContainerLayout } from '@/components/container-layout.component'
import { BlogHeroSection } from '@/components/blog/blog-hero-section.component'
import { Breadcrumbs } from '@/components/shared/breadcrumbs.component'
import { listActiveCategoriesWithCounts } from '@/lib/queries/blog/taxonomy.query'
import { seoConfig } from '@/lib/seo-config'
import { toNextMetadata } from '@/lib/seo/metadata'

export const metadata: Metadata = toNextMetadata(seoConfig, {
    title: 'Blog Categories',
    description:
        'Browse our blog posts by category. Find articles on web development, design, technology, and more.',
    canonical: '/blog/categories',
})

export default async function CategoriesIndexPage() {
    const categories = await listActiveCategoriesWithCounts()

    return (
        <ContainerLayout as='main' className='py-16 lg:py-20'>
            <WebPageSchema
                name='Blog Categories'
                url={`${seoConfig.siteUrl}/blog/categories`}
                description='Browse our blog posts by category. Find articles on web development, design, technology, and more.'
            />

            <div className='mb-16'>
                <Breadcrumbs
                    items={[
                        { label: 'Home', href: '/' },
                        { label: 'Blog', href: '/blog' },
                        { label: 'Categories' },
                    ]}
                    showBackground={false}
                />
            </div>

            <BlogHeroSection
                title='Categories'
                description='Browse articles by topic and discover content that interests you most.'
                navigationLinks={[
                    {
                        href: '/blog',
                        icon: <Zap className='h-4 w-4' />,
                        text: 'View All Posts',
                    },
                    {
                        href: '/blog/tags',
                        icon: <Tag className='h-4 w-4' />,
                        text: 'Browse by Tag',
                    },
                ]}
            />

            <div className='grid gap-8 sm:grid-cols-2 lg:grid-cols-3'>
                {categories.map((cat, index) => (
                    <Link
                        key={cat.id}
                        href={`/blog/categories/${cat.slug}`}
                        style={{
                            animationDelay: `${index * 0.05}s`,
                            animationFillMode: 'backwards',
                        }}
                        className='bg-card hover:bg-card/80 focus-visible:ring-ring focus-visible:ring-offset-background group animate-fade-in flex items-center justify-between rounded-lg border-0 p-8 transition-all duration-200 hover:shadow-sm focus-visible:ring-1 focus-visible:ring-offset-1 focus-visible:outline-none'
                    >
                        <div className='flex-1'>
                            <h2 className='text-foreground group-hover:text-foreground/90 mb-2 text-xl font-semibold transition-colors duration-200'>
                                {cat.name}
                            </h2>
                            {typeof cat.count === 'number' && (
                                <p className='text-muted-foreground text-sm font-normal'>
                                    {cat.count} post{cat.count === 1 ? '' : 's'}
                                </p>
                            )}
                        </div>
                        <ArrowRight
                            className='text-muted-foreground group-hover:text-primary ml-6 h-5 w-5 flex-shrink-0 transition-all duration-200 group-hover:translate-x-0.5'
                            aria-hidden='true'
                        />
                    </Link>
                ))}
            </div>
        </ContainerLayout>
    )
}
