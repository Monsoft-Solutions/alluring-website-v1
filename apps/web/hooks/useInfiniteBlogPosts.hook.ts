import { useCallback, useEffect, useRef, useState } from 'react'

import type { BlogPostsPaginatedResponse } from '@/lib/types/blog/api-response.type'
import type { BlogPostCard } from '@/lib/types/blog/post-card.type'

type UseInfiniteBlogPostsOptions = {
    initialPosts: BlogPostCard[]
    pageSize?: number
    initialCursor?: string
    categorySlug?: string
    tagSlug?: string
}

type UseInfiniteBlogPostsReturn = {
    posts: BlogPostCard[]
    isLoading: boolean
    hasMore: boolean
    loadMore: () => void
    observerRef: (node: HTMLElement | null) => void
}

/**
 * Custom hook for infinite scroll pagination of blog posts
 * Uses Intersection Observer to automatically load more posts when scrolling
 */
export function useInfiniteBlogPosts({
    initialPosts,
    pageSize = 12,
    initialCursor,
    categorySlug,
    tagSlug,
}: UseInfiniteBlogPostsOptions): UseInfiniteBlogPostsReturn {
    const [posts, setPosts] = useState<BlogPostCard[]>(initialPosts)
    const [isLoading, setIsLoading] = useState(false)
    const [hasMore, setHasMore] = useState(!!initialCursor)
    const [cursor, setCursor] = useState<string | undefined>(initialCursor)

    const observer = useRef<IntersectionObserver | null>(null)

    const loadMore = useCallback(async () => {
        if (isLoading || !hasMore) return

        setIsLoading(true)

        try {
            const params = new URLSearchParams({
                pageSize: pageSize.toString(),
            })

            if (cursor) params.append('cursor', cursor)
            if (categorySlug) params.append('categorySlug', categorySlug)
            if (tagSlug) params.append('tagSlug', tagSlug)

            const response = await fetch(`/api/blog/posts?${params.toString()}`)

            if (!response.ok) {
                throw new Error('Failed to fetch posts')
            }

            const data: BlogPostsPaginatedResponse = await response.json()

            setPosts((prev) => [...prev, ...data.items])
            setCursor(data.nextCursor)
            setHasMore(!!data.nextCursor)
        } catch (error) {
            console.error('Error loading more posts:', error)
            setHasMore(false)
        } finally {
            setIsLoading(false)
        }
    }, [cursor, hasMore, isLoading, pageSize, categorySlug, tagSlug])

    // Intersection Observer callback ref
    const observerRef = useCallback(
        (node: HTMLElement | null) => {
            if (isLoading) return
            if (observer.current) observer.current.disconnect()

            observer.current = new IntersectionObserver((entries) => {
                if (entries[0]?.isIntersecting && hasMore) {
                    void loadMore()
                }
            })

            if (node) observer.current.observe(node)
        },
        [isLoading, hasMore, loadMore]
    )

    // Cleanup observer on unmount
    useEffect(() => {
        return () => {
            if (observer.current) {
                observer.current.disconnect()
            }
        }
    }, [])

    return {
        posts,
        isLoading,
        hasMore,
        loadMore,
        observerRef,
    }
}
