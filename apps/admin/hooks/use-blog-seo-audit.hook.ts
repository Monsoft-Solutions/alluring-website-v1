/**
 * Blog SEO Audit Hook
 *
 * TanStack Query hook for fetching blog posts with their SEO analysis scores.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import { fetchApi } from '@/lib/utils/api-client.util'
import type {
    BlogPostWithAnalysis,
    BlogAuditSummary,
} from '@/lib/queries/blog-seo-audit.query'

/**
 * Response type from the blog audit API
 */
type BlogAuditResponse = {
    success: true
    data: {
        posts: BlogPostWithAnalysis[]
        summary: BlogAuditSummary
    }
}

/**
 * Response type from the blog analyze API
 */
type AnalyzeResponse = {
    success: boolean
    analysis?: {
        id: string
        overallScore: number
        grade: string
        analyzedAt: Date
    }
    error?: string
}

/**
 * Query keys for blog SEO audit data
 */
export const blogAuditKeys = {
    all: ['admin', 'seo', 'blog-audit'] as const,
    list: () => [...blogAuditKeys.all, 'list'] as const,
} as const

/**
 * Hook to fetch blog posts with their SEO analysis status
 */
export function useBlogSeoAudit() {
    return useQuery({
        queryKey: blogAuditKeys.list(),
        queryFn: async () => {
            const response = await fetchApi<BlogAuditResponse>(
                '/api/admin/seo/blog-audit'
            )
            return response.data
        },
        staleTime: 60_000, // 1 minute - blog analysis doesn't change frequently
    })
}

/**
 * Hook to analyze a blog post
 */
export function useAnalyzeBlogPost() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (blogPostId: string) => {
            const response = await fetchApi<AnalyzeResponse>(
                '/api/blog/analyze',
                {
                    method: 'POST',
                    body: { blogPostId },
                }
            )
            return response
        },
        onSuccess: () => {
            // Invalidate the blog audit cache to refetch with new analysis
            void queryClient.invalidateQueries({ queryKey: blogAuditKeys.all })
        },
    })
}
