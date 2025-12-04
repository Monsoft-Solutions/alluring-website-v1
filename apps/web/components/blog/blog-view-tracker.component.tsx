/**
 * Blog View Tracker Component
 *
 * Tracks blog post views asynchronously on mount.
 * Uses session-based deduplication to prevent multiple counts per visit.
 *
 * @module components/blog/blog-view-tracker
 */
'use client'

import { useEffect, useRef } from 'react'

const BLOG_VIEW_API_PATH = '/api/blog/posts'
const VIEWED_POSTS_KEY = 'aps_viewed_posts'

/**
 * Check if running in browser environment
 */
const isBrowser = (): boolean => typeof window !== 'undefined'

/**
 * Check if the post was already viewed in this session
 */
function wasPostViewedInSession(postId: string): boolean {
    if (!isBrowser()) return true

    try {
        const viewedPosts = sessionStorage.getItem(VIEWED_POSTS_KEY)
        if (!viewedPosts) return false

        const parsed = JSON.parse(viewedPosts) as string[]
        return parsed.includes(postId)
    } catch {
        return false
    }
}

/**
 * Mark the post as viewed in this session
 */
function markPostAsViewed(postId: string): void {
    if (!isBrowser()) return

    try {
        const viewedPosts = sessionStorage.getItem(VIEWED_POSTS_KEY)
        const parsed = viewedPosts ? (JSON.parse(viewedPosts) as string[]) : []

        if (!parsed.includes(postId)) {
            parsed.push(postId)
            sessionStorage.setItem(VIEWED_POSTS_KEY, JSON.stringify(parsed))
        }
    } catch {
        // sessionStorage may be disabled - silently fail
    }
}

/**
 * Send view tracking request
 * Uses sendBeacon for reliable delivery, falls back to fetch
 */
function sendViewTrack(postId: string): void {
    if (!isBrowser()) return

    const url = `${BLOG_VIEW_API_PATH}/${postId}/views`

    // Prefer sendBeacon - it's designed for analytics
    if (navigator.sendBeacon) {
        const sent = navigator.sendBeacon(url, '')
        if (sent) return
    }

    // Fallback to fetch with keepalive
    fetch(url, {
        method: 'POST',
        keepalive: true,
    }).catch(() => {
        // Silently fail - view tracking should never break the user experience
    })
}

type BlogViewTrackerProps = {
    /** The blog post ID to track */
    postId: string
}

/**
 * Blog View Tracker
 *
 * Tracks a blog post view once per session.
 * Place this component in blog post pages to automatically track views.
 *
 * Features:
 * - Session-based deduplication (only counts once per browser session)
 * - Non-blocking (uses sendBeacon/fetch with keepalive)
 * - Renders nothing (invisible tracking component)
 *
 * @example
 * ```tsx
 * // In a blog post page
 * <BlogViewTracker postId={post.id} />
 * ```
 */
export function BlogViewTracker({ postId }: BlogViewTrackerProps) {
    const hasTracked = useRef(false)

    useEffect(() => {
        // Prevent double tracking in development (StrictMode)
        if (hasTracked.current) return
        hasTracked.current = true

        // Check if already viewed in this session
        if (wasPostViewedInSession(postId)) return

        // Track the view
        sendViewTrack(postId)
        markPostAsViewed(postId)
    }, [postId])

    // This component renders nothing
    return null
}
