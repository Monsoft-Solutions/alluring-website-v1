/**
 * RelatedPosts Component
 *
 * Displays a grid of related blog posts at the end of a blog post.
 *
 * Features:
 * - Responsive grid layout (1/2/3 columns)
 * - Uses existing PostCard component
 * - Returns null if no posts provided
 *
 * @example
 * ```tsx
 * <RelatedPosts posts={relatedPosts} />
 * ```
 */
import type { BlogPostCard } from '@/lib/types/blog/post-card.type'

import { PostCard } from './PostCard.component'

type RelatedPostsProps = {
    readonly posts: BlogPostCard[]
}

export function RelatedPosts({ posts }: RelatedPostsProps) {
    if (posts.length === 0) return null

    return (
        <section className='border-border/30 mt-20 border-t pt-16'>
            <div className='mb-12'>
                <h2 className='text-foreground mb-3 text-2xl font-bold tracking-tight sm:text-3xl'>
                    Related Articles
                </h2>
                <p className='text-muted-foreground text-base'>
                    Continue reading with these related posts
                </p>
            </div>

            <div className='grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3'>
                {posts.map((post) => (
                    <PostCard key={post.id} post={post} />
                ))}
            </div>
        </section>
    )
}
