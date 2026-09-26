import { PostNavigation } from '@/components/blog/post-navigation.component'
import { RelatedPosts } from '@/components/blog/related-posts.component'
import { SocialShare } from '@/components/blog/social-share.component'
import type { AdjacentPosts } from '@/lib/queries/blog/adjacent-posts.query'
import type { BlogPostCard } from '@/lib/types/blog/post-card.type'
import type { BlogPostDetail } from '@/lib/types/blog/post-detail.type'
import { getBlogPostUrl } from '@/lib/utils/blog-url.util'

type PostEndProps = {
    post: BlogPostDetail & { publishedAt: string }
    adjacentPosts: AdjacentPosts
    relatedPosts: BlogPostCard[]
}

/**
 * Where the article ends: share it, the previous and next posts, and related
 * reading (two on phones, all six from `sm`). Share sits here, in the flow,
 * because v2 keeps the bottom of a phone's screen for the consult bar.
 */
export function PostEnd({ post, adjacentPosts, relatedPosts }: PostEndProps) {
    return (
        <footer className='bp-end'>
            <SocialShare
                variant='inline'
                title={post.title}
                url={getBlogPostUrl(post.slug, post.publishedAt)}
                description={post.excerpt ?? undefined}
                imageUrl={post.featuredImage?.url}
                className='border-t border-stone-200 pt-8'
            />

            <PostNavigation
                previousPost={adjacentPosts.previousPost}
                nextPost={adjacentPosts.nextPost}
            />

            <div className='bp-related'>
                <RelatedPosts posts={relatedPosts} />
            </div>
        </footer>
    )
}
