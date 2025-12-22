/**
 * Blog Analysis Hook
 *
 * TanStack Query hook for blog post quality analysis.
 * Provides methods to fetch and trigger analysis.
 *
 * @module apps/admin/hooks/use-blog-analysis
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import { buildUrl, fetchApi } from '@/lib/utils/api-client.util'

/**
 * Analysis data structure
 */
export type BlogAnalysis = {
    id: string
    overallScore: number
    grade: string
    categories: {
        title: number
        metaDescription: number
        contentLength: number
        readability: number
        headingStructure: number
        keywords: number
        linking: number
        visualContent: number
        structure: number
    }
    analysisDetails: {
        categories: {
            title: {
                score: number
                findings: string[]
                suggestions: string[]
            }
            metaDescription: {
                score: number
                findings: string[]
                suggestions: string[]
            }
            contentLength: {
                score: number
                wordCount: number
                findings: string[]
                suggestions: string[]
            }
            readability: {
                score: number
                avgSentenceLength: number
                avgParagraphLength: number
                findings: string[]
                suggestions: string[]
            }
            headingStructure: {
                score: number
                h1Count: number
                h2Count: number
                h3Count: number
                findings: string[]
                suggestions: string[]
            }
            keywords: {
                score: number
                density: number
                keywordInFirst100Words: boolean
                findings: string[]
                suggestions: string[]
            }
            linking: {
                score: number
                internalLinkCount: number
                externalLinkCount: number
                findings: string[]
                suggestions: string[]
            }
            visualContent: {
                score: number
                imageCount: number
                hasFeaturedImage: boolean
                imagesWithAlt: number
                findings: string[]
                suggestions: string[]
            }
            structure: {
                score: number
                hasTLDR: boolean
                hasCTA: boolean
                findings: string[]
                suggestions: string[]
            }
        }
        topSuggestions: Array<{
            priority: 'high' | 'medium' | 'low'
            category: string
            suggestion: string
        }>
        summary: string
    }
    analyzedAt: Date
}

type AnalysisResponse = {
    success: boolean
    analysis?: BlogAnalysis
    error?: string
}

/**
 * Centralized query keys for cache invalidation
 */
export const blogAnalysisKeys = {
    all: ['admin', 'blog', 'analysis'] as const,
    detail: (blogPostId: string) =>
        [...blogAnalysisKeys.all, blogPostId] as const,
} as const

/**
 * Fetch the latest analysis for a blog post
 */
export function useBlogAnalysis(blogPostId: string | undefined) {
    return useQuery({
        queryKey: blogAnalysisKeys.detail(blogPostId ?? ''),
        queryFn: async () => {
            const response = await fetchApi<AnalysisResponse>(
                buildUrl('/api/blog/analyze', { blogPostId: blogPostId ?? '' })
            )

            if (!response.success || !response.analysis) {
                throw new Error(response.error ?? 'Failed to fetch analysis')
            }

            // Convert analyzedAt to Date object
            return {
                ...response.analysis,
                analyzedAt: new Date(response.analysis.analyzedAt),
            }
        },
        enabled: !!blogPostId,
        staleTime: 5 * 60 * 1000, // 5 minutes - analysis doesn't change often
        retry: false, // Don't retry if analysis doesn't exist
    })
}

/**
 * Trigger a new analysis for a blog post
 */
export function useAnalyzeBlogPost() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (blogPostId: string) => {
            const response = await fetchApi<AnalysisResponse>(
                '/api/blog/analyze',
                {
                    method: 'POST',
                    body: { blogPostId }, // Let fetchApi handle stringification
                }
            )

            if (!response.success || !response.analysis) {
                throw new Error(response.error ?? 'Failed to analyze blog post')
            }

            // Convert analyzedAt to Date object
            return {
                ...response.analysis,
                analyzedAt: new Date(response.analysis.analyzedAt),
            }
        },
        onSuccess: (data, blogPostId) => {
            // Invalidate and update the cache with new analysis
            queryClient.setQueryData(blogAnalysisKeys.detail(blogPostId), data)
        },
    })
}
