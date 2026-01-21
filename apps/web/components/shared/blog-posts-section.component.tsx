/**
 * BlogPostsSection Component
 *
 * A reusable server component that displays blog posts filtered by category.
 * Designed for use on procedure pages and other sections requiring contextually
 * relevant blog content.
 *
 * @example
 * ```tsx
 * <BlogPostsSection
 *   categorySlug="breast-procedures"
 *   title="Breast Augmentation Insights"
 *   description="Expert advice and patient stories"
 *   badge="From Our Blog"
 *   limit={3}
 * />
 * ```
 */
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

import { cn } from '@workspace/ui/lib/utils'

import { PostCard } from '@/components/blog/post-card.component'
import { ContentWrapper } from '@/components/shared/content-wrapper.component'
import { SectionContainer } from '@/components/shared/section-container.component'
import { SectionHeader } from '@/components/shared/section-header.component'
import { getPublishedPostCardsPage } from '@/lib/queries/blog/post-list.query'

import type { SectionBackgroundVariant } from '@/lib/types/sections/section-container.type'

type BlogPostsSectionProps = {
    /**
     * Filter posts by category slug (e.g., 'body-procedures')
     */
    categorySlug?: string

    /**
     * Exclude a post by slug (useful to exclude current post in "More from This Category")
     */
    excludeSlug?: string

    /**
     * Number of posts to display (3-6)
     * @default 3
     */
    limit?: number

    /**
     * Section title
     * @default "From Our Blog"
     */
    title?: string

    /**
     * Section description
     */
    description?: string

    /**
     * Optional badge text above title
     */
    badge?: string

    /**
     * Background variant for the section
     * @default "default"
     */
    variant?: SectionBackgroundVariant

    /**
     * Whether to show "View all" link
     * @default true
     */
    showViewAll?: boolean

    /**
     * Custom text for "View all" link
     * @default "View all articles"
     */
    viewAllText?: string

    /**
     * Custom href for "View all" link
     * Defaults to /blog or /blog/categories/{slug} based on categorySlug
     */
    viewAllHref?: string

    /**
     * Number of grid columns
     * @default 3
     */
    columns?: 2 | 3

    /**
     * Additional CSS classes
     */
    className?: string

    /**
     * Section ID for anchor links
     */
    id?: string
}

export async function BlogPostsSection({
    categorySlug,
    excludeSlug,
    limit = 3,
    title = 'From Our Blog',
    description,
    badge,
    variant = 'default',
    showViewAll = true,
    viewAllText = 'View all articles',
    viewAllHref,
    columns = 3,
    className,
    id,
}: BlogPostsSectionProps) {
    // Fetch posts, optionally filtered by category and excluding a specific post
    const { items: posts } = await getPublishedPostCardsPage({
        limit,
        categorySlug: categorySlug ?? null,
        excludeSlug: excludeSlug ?? null,
    })

    // Return null if no posts found
    if (posts.length === 0) {
        return null
    }

    // Determine the "View all" href
    const resolvedViewAllHref =
        viewAllHref ??
        (categorySlug ? `/blog/categories/${categorySlug}` : '/blog')

    // Grid columns class
    const gridColumnsClass = columns === 2 ? 'lg:grid-cols-2' : 'lg:grid-cols-3'

    return (
        <SectionContainer variant={variant} id={id} className={className}>
            <ContentWrapper size='lg'>
                {/* Header with optional "View all" link */}
                <div className='mb-10 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end'>
                    <SectionHeader
                        title={title}
                        description={description}
                        badge={badge}
                        align='left'
                    />

                    {showViewAll && (
                        <Link
                            href={resolvedViewAllHref}
                            className={cn(
                                'group inline-flex items-center gap-2',
                                'text-sm font-semibold tracking-wide uppercase',
                                'text-gold-600 hover:text-gold-500',
                                'transition-colors duration-300',
                                'shrink-0'
                            )}
                        >
                            {viewAllText}
                            <ArrowRight
                                className='h-4 w-4 transition-transform duration-300 group-hover:translate-x-1'
                                aria-hidden='true'
                            />
                        </Link>
                    )}
                </div>

                {/* Posts grid */}
                <div
                    className={cn(
                        'grid grid-cols-1 gap-8 sm:grid-cols-2',
                        gridColumnsClass
                    )}
                >
                    {posts.map((post) => (
                        <PostCard key={post.id} post={post} />
                    ))}
                </div>
            </ContentWrapper>
        </SectionContainer>
    )
}
