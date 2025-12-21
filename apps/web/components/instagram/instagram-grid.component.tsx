'use client'

/**
 * Instagram Grid Component
 *
 * Instagram-style 3-column grid with post thumbnails.
 * Opens a dialog when a post is clicked.
 *
 * @module components/instagram/instagram-grid
 */
import { useState } from 'react'

import type {
    InstagramPostPublic,
    InstagramProfileInfo,
} from '@/types/instagram.type'
import { PostThumbnail } from './post-thumbnail.component'
import { InstagramPostDialog } from './instagram-post-dialog.component'

type InstagramGridProps = {
    posts: InstagramPostPublic[]
    profile?: InstagramProfileInfo | null
}

export function InstagramGrid({ posts, profile }: InstagramGridProps) {
    const [selectedPost, setSelectedPost] =
        useState<InstagramPostPublic | null>(null)

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
        <>
            {/* Grid */}
            <div className='grid grid-cols-3 gap-1 sm:gap-1.5 md:gap-2'>
                {posts.map((post) => (
                    <PostThumbnail
                        key={post.id}
                        post={post}
                        onClick={() => setSelectedPost(post)}
                    />
                ))}
            </div>

            {/* Detail Modal */}
            <InstagramPostDialog
                post={selectedPost}
                profile={profile}
                isOpen={!!selectedPost}
                onClose={() => setSelectedPost(null)}
            />
        </>
    )
}
