/**
 * More Posts Section Component
 *
 * Displays a grid of related Instagram posts.
 * Used on individual post pages to encourage further browsing.
 *
 * @module components/instagram/more-posts-section
 */
import { PostThumbnail } from './post-thumbnail.component'
import { getMoreInstagramPosts } from '@/lib/queries/instagram/instagram-post.query'
import { SectionContainer } from '@/components/shared/section-container.component'
import { ContentWrapper } from '@/components/shared/content-wrapper.component'

type MorePostsSectionProps = {
    currentPostId: string
}

export async function MorePostsSection({
    currentPostId,
}: MorePostsSectionProps) {
    const morePosts = await getMoreInstagramPosts(currentPostId, 6)

    if (morePosts.length === 0) {
        return null
    }

    return (
        <SectionContainer className='bg-stone-50'>
            <ContentWrapper size='lg'>
                <div className='space-y-6 py-12 md:py-16'>
                    <h2 className='font-serif text-2xl font-bold text-stone-900 md:text-3xl'>
                        More Posts
                    </h2>
                    <div className='grid grid-cols-3 gap-1 sm:gap-1.5 md:gap-2'>
                        {morePosts.map((post) => (
                            <PostThumbnail key={post.id} post={post} />
                        ))}
                    </div>
                </div>
            </ContentWrapper>
        </SectionContainer>
    )
}
