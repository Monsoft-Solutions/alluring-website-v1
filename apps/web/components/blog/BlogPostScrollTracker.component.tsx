'use client'

import { env } from '@/env'
/**
 * Blog Post Scroll Tracker
 *
 * Client component that wraps blog post content to track scroll depth.
 * Automatically tracks reader engagement at 25%, 50%, 75%, and 100% scroll milestones.
 *
 * @module components/blog/BlogPostScrollTracker
 */

import { useScrollDepth } from '@/lib/analytics/useScrollDepth.hook'

export interface BlogPostScrollTrackerProps {
    children: React.ReactNode
    postSlug: string
    postTitle: string
}

/**
 * Wrapper component to track scroll depth in blog posts
 *
 * @example
 * ```tsx
 * <BlogPostScrollTracker postSlug="my-article" postTitle="My Article">
 *   <article>...</article>
 * </BlogPostScrollTracker>
 * ```
 */
export function BlogPostScrollTracker({
    children,
    postSlug,
    postTitle,
}: BlogPostScrollTrackerProps) {
    // Track scroll depth for blog posts
    useScrollDepth({
        thresholds: [25, 50, 75, 100],
        onThresholdReached: (threshold) => {
            // Optional: Log scroll milestone in development
            if (env.NODE_ENV === 'development') {
                console.log(
                    `Blog post "${postTitle}" scrolled ${threshold}%`,
                    `(${postSlug})`
                )
            }
        },
    })

    return <>{children}</>
}
