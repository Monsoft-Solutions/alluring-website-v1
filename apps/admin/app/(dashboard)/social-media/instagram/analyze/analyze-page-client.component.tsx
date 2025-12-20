'use client'

/**
 * Analyze Page Client Component
 *
 * Client-side interactive component for bulk Instagram analysis.
 * Handles post selection and starts analysis. After analysis completes,
 * redirects to the analysis result page for review and application.
 *
 * @module app/(dashboard)/social-media/instagram/analyze/analyze-page-client
 */
import { useState, useTransition, useCallback, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent } from '@workspace/ui/components/card'
import { Badge } from '@workspace/ui/components/badge'
import { Sparkles, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import type {
    InstagramAnalysisStatusFilter,
    InstagramMediaTypeFilter,
    InstagramPostListItem,
} from '@/lib/types/social-media.type'
import { analyzeInstagramPosts } from '@/lib/actions/instagram-analysis.action'
import { AnalysisFilters } from '@/components/instagram/analysis-filters.component'
import { AnalyzingProgress } from '@/components/instagram/analyzing-progress.component'
import { PostSelectCard } from '@/components/instagram/post-select-card.component'

type AnalyzePageClientProps = {
    initialPosts: InstagramPostListItem[]
    initialTotal: number
    statusCounts: {
        pending: number
        analyzed: number
        reviewed: number
        applied: number
    }
}

type AnalysisStep = 'select' | 'analyzing'

const PAGE_SIZE = 24

export function AnalyzePageClient({
    initialPosts,
    initialTotal,
    statusCounts,
}: AnalyzePageClientProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [step, setStep] = useState<AnalysisStep>('select')
    const [selectedPostIds, setSelectedPostIds] = useState<Set<string>>(
        new Set()
    )
    const [analysisProgress, setAnalysisProgress] = useState(0)

    // Infinite scroll state
    const [posts, setPosts] = useState<InstagramPostListItem[]>(initialPosts)
    const [totalCount, setTotalCount] = useState(initialTotal)
    const [page, setPage] = useState(1)
    const [analysisStatus, setAnalysisStatus] =
        useState<InstagramAnalysisStatusFilter>('pending')
    const [mediaType, setMediaType] = useState<InstagramMediaTypeFilter>('all')
    const [isLoading, setIsLoading] = useState(false)
    const [isLoadingMore, setIsLoadingMore] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Refs for stable callbacks and preventing infinite loops
    const loadMoreRef = useRef<HTMLDivElement | null>(null)
    const hasHydrated = useRef(false)
    const isFetchingRef = useRef(false)
    const prevFilterRef = useRef({ analysisStatus, mediaType })
    const handleLoadMoreRef = useRef<() => void>(() => {})

    // Simple hasMore check
    const hasMore = posts.length < totalCount

    const mergePosts = useCallback(
        (incoming: InstagramPostListItem[], replace: boolean) => {
            if (replace) {
                setPosts(incoming)
                return
            }

            setPosts((current) => {
                const seen = new Set(current.map((post) => post.id))
                const merged = [...current]

                for (const post of incoming) {
                    if (!seen.has(post.id)) {
                        merged.push(post)
                        seen.add(post.id)
                    }
                }

                return merged
            })
        },
        []
    )

    // Stable fetchPage - uses ref for concurrency guard
    const fetchPage = useCallback(
        async (nextPage: number, { replace }: { replace: boolean }) => {
            if (isFetchingRef.current) return
            isFetchingRef.current = true

            setError(null)
            if (replace) {
                setIsLoading(true)
            } else {
                setIsLoadingMore(true)
            }

            try {
                const params = new URLSearchParams({
                    page: String(nextPage),
                    pageSize: String(PAGE_SIZE),
                    sortBy: 'date',
                    sortDirection: 'desc',
                    analysisStatus,
                    mediaType,
                })

                const response = await fetch(
                    `/api/social-media/instagram/posts?${params.toString()}`,
                    {
                        method: 'GET',
                        cache: 'no-store',
                    }
                )

                if (!response.ok) {
                    throw new Error('Failed to load posts')
                }

                const data = (await response.json()) as {
                    posts: InstagramPostListItem[]
                    total: number
                }
                mergePosts(data.posts ?? [], replace)
                setTotalCount(data.total ?? 0)
                setPage(nextPage)
            } catch (fetchError) {
                console.error('Error loading Instagram posts', fetchError)
                setError('Unable to load posts right now. Please try again.')
            } finally {
                if (replace) {
                    setIsLoading(false)
                } else {
                    setIsLoadingMore(false)
                }
                isFetchingRef.current = false
            }
        },
        [mergePosts, analysisStatus, mediaType]
    )

    // Update the handleLoadMore ref whenever dependencies change
    useEffect(() => {
        handleLoadMoreRef.current = () => {
            if (isFetchingRef.current || posts.length >= totalCount) return
            void fetchPage(page + 1, { replace: false })
        }
    }, [fetchPage, page, posts.length, totalCount])

    // Stable callback that delegates to the ref
    const handleLoadMore = useCallback(() => {
        handleLoadMoreRef.current()
    }, [])

    // Handle filter changes - only triggers when filter actually changes
    useEffect(() => {
        if (!hasHydrated.current) {
            hasHydrated.current = true
            return
        }

        const prev = prevFilterRef.current
        if (
            prev.analysisStatus !== analysisStatus ||
            prev.mediaType !== mediaType
        ) {
            prevFilterRef.current = { analysisStatus, mediaType }
            void fetchPage(1, { replace: true })
        }
    }, [analysisStatus, mediaType, fetchPage])

    // IntersectionObserver for infinite scroll
    useEffect(() => {
        const node = loadMoreRef.current
        if (!node) return

        const observer = new IntersectionObserver(
            (entries) => {
                const [entry] = entries
                if (entry?.isIntersecting) {
                    handleLoadMore()
                }
            },
            { rootMargin: '200px' }
        )

        observer.observe(node)
        return () => observer.disconnect()
    }, [handleLoadMore])

    // Selection handlers
    const togglePost = (postId: string) => {
        const newSelected = new Set(selectedPostIds)
        if (newSelected.has(postId)) {
            newSelected.delete(postId)
        } else {
            newSelected.add(postId)
        }
        setSelectedPostIds(newSelected)
    }

    const selectAllVisible = () => {
        setSelectedPostIds(new Set(posts.map((p) => p.id)))
    }

    const clearSelection = () => {
        setSelectedPostIds(new Set())
    }

    // Start analysis
    const handleStartAnalysis = () => {
        if (selectedPostIds.size === 0) {
            toast.error('Please select at least one post to analyze')
            return
        }

        setStep('analyzing')
        setAnalysisProgress(0)

        startTransition(async () => {
            let progressInterval: ReturnType<typeof setInterval> | undefined

            try {
                // Simulate progress
                progressInterval = setInterval(() => {
                    setAnalysisProgress((prev) => Math.min(prev + 5, 90))
                }, 500)

                const result = await analyzeInstagramPosts(
                    Array.from(selectedPostIds)
                )

                setAnalysisProgress(100)

                if (result.success && result.analysisId) {
                    toast.success(
                        `Analyzed ${result.stats.analyzedMedia} images from ${result.stats.totalPosts} posts`
                    )
                    // Redirect to analysis result page
                    router.push(`/analysis/${result.analysisId}`)
                } else {
                    toast.error(result.error || 'Analysis failed')
                    setStep('select')
                }
            } catch (error) {
                console.error('Analysis error:', error)
                toast.error('An unexpected error occurred')
                setStep('select')
            } finally {
                if (progressInterval) {
                    clearInterval(progressInterval)
                }
            }
        })
    }

    // Render analyzing step
    if (step === 'analyzing') {
        return (
            <AnalyzingProgress
                selectedCount={selectedPostIds.size}
                progress={analysisProgress}
            />
        )
    }

    // Selection step (default)
    return (
        <div className='space-y-6'>
            {/* Filters */}
            <AnalysisFilters
                analysisStatus={analysisStatus}
                mediaType={mediaType}
                statusCounts={statusCounts}
                onAnalysisStatusChange={setAnalysisStatus}
                onMediaTypeChange={setMediaType}
            />

            {/* Selection Actions */}
            <div className='flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                    <Button
                        variant='outline'
                        size='sm'
                        onClick={selectAllVisible}
                        disabled={posts.length === 0}
                    >
                        Select All Visible ({posts.length})
                    </Button>
                    {selectedPostIds.size > 0 && (
                        <Button
                            variant='ghost'
                            size='sm'
                            onClick={clearSelection}
                        >
                            Clear Selection
                        </Button>
                    )}
                    <Badge variant='outline' className='ml-2'>
                        {selectedPostIds.size} selected
                    </Badge>
                </div>
                <Button
                    onClick={handleStartAnalysis}
                    disabled={isPending || selectedPostIds.size === 0}
                >
                    <Sparkles className='mr-2 h-4 w-4' />
                    Analyze {selectedPostIds.size} Posts
                </Button>
            </div>

            {/* Error Message */}
            {error && (
                <Card className='border-destructive/40 bg-destructive/5'>
                    <CardContent className='pt-6'>
                        <div className='flex items-center justify-between gap-3'>
                            <span className='text-destructive text-sm'>
                                {error}
                            </span>
                            <Button
                                size='sm'
                                variant='outline'
                                onClick={() =>
                                    fetchPage(page, { replace: false })
                                }
                            >
                                Try again
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Posts Grid */}
            {posts.length === 0 && isLoading ? (
                <div className='grid gap-4 md:grid-cols-4 lg:grid-cols-6'>
                    {Array.from({ length: 24 }).map((_, index) => (
                        <div
                            key={`skeleton-${index}`}
                            className='aspect-square w-full animate-pulse rounded-lg bg-stone-200'
                        />
                    ))}
                </div>
            ) : posts.length === 0 ? (
                <Card>
                    <CardContent className='py-12 text-center'>
                        <p className='text-muted-foreground'>
                            No posts available for analysis. Sync more posts
                            from Instagram first.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <>
                    <div className='grid gap-4 md:grid-cols-4 lg:grid-cols-6'>
                        {posts.map((post) => (
                            <PostSelectCard
                                key={post.id}
                                post={post}
                                isSelected={selectedPostIds.has(post.id)}
                                onToggle={() => togglePost(post.id)}
                            />
                        ))}
                    </div>

                    {/* Infinite scroll trigger */}
                    <div ref={loadMoreRef} />

                    {/* Load More Button */}
                    {hasMore && (
                        <div className='flex justify-center'>
                            <Button
                                variant='outline'
                                onClick={handleLoadMore}
                                disabled={isLoading || isLoadingMore}
                                className='gap-2'
                            >
                                {isLoadingMore ? (
                                    <>
                                        <Loader2 className='h-4 w-4 animate-spin' />
                                        Loading more
                                    </>
                                ) : (
                                    'Load more'
                                )}
                            </Button>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
