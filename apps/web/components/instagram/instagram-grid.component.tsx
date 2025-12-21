/**
 * Instagram Grid Component
 *
 * Instagram-style 3-column grid with post thumbnails.
 * Thumbnails link to individual post pages.
 *
 * @module components/instagram/instagram-grid
 */
import type { InstagramPostPublic } from '@/types/instagram.type'
import { PostThumbnail } from './post-thumbnail.component'

type InstagramGridProps = {
    posts: InstagramPostPublic[]
}

export function InstagramGrid({ posts }: InstagramGridProps) {
    if (posts.length === 0) {
        return (
            <div className='py-16 text-center'>
                <p className='text-stone-500'>
                    No posts available yet. Check back soon!
                </p>
            </div>
        )
    }

    return (
        <div className='grid grid-cols-3 gap-1 sm:gap-1.5 md:gap-2'>
            {posts.map((post) => (
                <PostThumbnail key={post.id} post={post} />
            ))}
        </div>
    )
}
