'use client'

/**
 * Analyze Page Client Component
 *
 * Client-side interactive component for bulk Instagram analysis.
 * Handles post selection, analysis execution, and result review with infinite scroll.
 *
 * @module app/(dashboard)/social-media/instagram/analyze/analyze-page-client
 */
import { useState, useTransition, useCallback, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@workspace/ui/components/button'
import { Checkbox } from '@workspace/ui/components/checkbox'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card'
import { Badge } from '@workspace/ui/components/badge'
import { Progress } from '@workspace/ui/components/progress'
import { Tabs, TabsList, TabsTrigger } from '@workspace/ui/components/tabs'
import { MultiSelect } from '@workspace/ui/components/multi-select'
import {
    Sparkles,
    Check,
    AlertCircle,
    Layers,
    ArrowRight,
    Loader2,
    ImageIcon,
    Grid,
} from 'lucide-react'
import { toast } from 'sonner'

import type {
    InstagramAnalysisStatusFilter,
    InstagramMediaTypeFilter,
    InstagramPostListItem,
} from '@/lib/queries/social-media.query'
import type { GalleryGroupForAI } from '@/lib/queries/gallery.query'
import {
    analyzeInstagramPosts,
    applyAnalysisResults,
    type BulkAnalysisResult,
    type DetectedPair,
} from '@/lib/actions/instagram-analysis.action'
import Link from 'next/link'

type AnalyzePageClientProps = {
    initialPosts: InstagramPostListItem[]
    initialTotal: number
    statusCounts: {
        pending: number
        analyzed: number
        reviewed: number
        applied: number
    }
    galleryGroups: GalleryGroupForAI[]
}

type AnalysisStep = 'select' | 'analyzing' | 'review' | 'applying' | 'complete'

const PAGE_SIZE = 24

export function AnalyzePageClient({
    initialPosts,
    initialTotal,
    statusCounts,
    galleryGroups,
}: AnalyzePageClientProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [step, setStep] = useState<AnalysisStep>('select')
    const [selectedPostIds, setSelectedPostIds] = useState<Set<string>>(
        new Set()
    )
    const [analysisResult, setAnalysisResult] =
        useState<BulkAnalysisResult | null>(null)
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

    // Group assignment state for all media types
    const [pairGroupAssignments, setPairGroupAssignments] = useState<
        Map<string, string[]>
    >(new Map())
    const [unpairedGroupAssignments, setUnpairedGroupAssignments] = useState<
        Map<string, string[]>
    >(new Map())
    const [nonBAGroupAssignments, setNonBAGroupAssignments] = useState<
        Map<string, string[]>
    >(new Map())

    // Track which non-BA items are selected for applying
    const [selectedNonBAMediaIds, setSelectedNonBAMediaIds] = useState<
        Set<string>
    >(new Set())

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

                const data = await response.json()
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
            try {
                // Simulate progress
                const progressInterval = setInterval(() => {
                    setAnalysisProgress((prev) => Math.min(prev + 5, 90))
                }, 500)

                const result = await analyzeInstagramPosts(
                    Array.from(selectedPostIds)
                )

                clearInterval(progressInterval)
                setAnalysisProgress(100)

                if (result.success) {
                    setAnalysisResult(result)

                    // Initialize group assignments from AI suggestions
                    const pairAssignments = new Map<string, string[]>()
                    result.detectedPairs.forEach((pair) => {
                        const groupIds = pair.aiSuggestedGroups.map(
                            (g) => g.groupId
                        )
                        pairAssignments.set(pair.id, groupIds)
                    })
                    setPairGroupAssignments(pairAssignments)

                    const unpairedAssignments = new Map<string, string[]>()
                    result.unpairedMedia.forEach((media) => {
                        const groupIds = media.aiSuggestedGroups.map(
                            (g) => g.groupId
                        )
                        unpairedAssignments.set(media.mediaId, groupIds)
                    })
                    setUnpairedGroupAssignments(unpairedAssignments)

                    const nonBAAssignments = new Map<string, string[]>()
                    result.nonBAMedia.forEach((media) => {
                        const groupIds = media.aiSuggestedGroups.map(
                            (g) => g.groupId
                        )
                        nonBAAssignments.set(media.mediaId, groupIds)
                    })
                    setNonBAGroupAssignments(nonBAAssignments)

                    // Select all non-BA media by default
                    const nonBAMediaIds = result.nonBAMedia.map(
                        (m) => m.mediaId
                    )
                    setSelectedNonBAMediaIds(new Set(nonBAMediaIds))

                    setStep('review')
                    toast.success(
                        `Analyzed ${result.stats.analyzedMedia} images from ${result.stats.totalPosts} posts`
                    )
                } else {
                    toast.error(result.error || 'Analysis failed')
                    setStep('select')
                }
            } catch (error) {
                console.error('Analysis error:', error)
                toast.error('An unexpected error occurred')
                setStep('select')
            }
        })
    }

    // Apply results
    const handleApplyResults = () => {
        if (!analysisResult) return

        setStep('applying')

        startTransition(async () => {
            try {
                // Build pairs to create with group assignments
                const pairs = analysisResult.detectedPairs.map((pair) => ({
                    beforeMediaId: pair.beforeMediaId,
                    afterMediaId: pair.afterMediaId,
                    procedureSlug: pair.procedureSlug,
                    isSideBySide: pair.type === 'side_by_side',
                }))

                // Build group assignments for ALL media types
                const groupAssignments: Array<{
                    mediaId: string
                    groupId: string
                }> = []

                // Add pair group assignments
                pairGroupAssignments.forEach((groupIds, pairId) => {
                    const pair = analysisResult.detectedPairs.find(
                        (p) => p.id === pairId
                    )
                    if (pair && groupIds.length > 0) {
                        groupIds.forEach((groupId) => {
                            // Assign to both before and after media
                            groupAssignments.push({
                                mediaId: pair.beforeMediaId,
                                groupId,
                            })
                            if (pair.type !== 'side_by_side') {
                                groupAssignments.push({
                                    mediaId: pair.afterMediaId,
                                    groupId,
                                })
                            }
                        })
                    }
                })

                // Add unpaired group assignments
                unpairedGroupAssignments.forEach((groupIds, mediaId) => {
                    if (groupIds.length > 0) {
                        groupIds.forEach((groupId) => {
                            groupAssignments.push({ mediaId, groupId })
                        })
                    }
                })

                // Add non-BA group assignments (only for selected items)
                selectedNonBAMediaIds.forEach((mediaId) => {
                    const groupIds = nonBAGroupAssignments.get(mediaId)
                    if (groupIds && groupIds.length > 0) {
                        groupIds.forEach((groupId) => {
                            groupAssignments.push({ mediaId, groupId })
                        })
                    }
                })

                const result = await applyAnalysisResults({
                    pairs,
                    groupAssignments,
                    postIds: Array.from(selectedPostIds),
                })

                if (result.success) {
                    setStep('complete')
                    const totalMedia =
                        analysisResult.unpairedMedia.length +
                        selectedNonBAMediaIds.size
                    toast.success(
                        `Created ${pairs.length} B&A pairs and assigned ${totalMedia} media items to groups`
                    )
                } else {
                    toast.error(result.error || 'Failed to apply results')
                    setStep('review')
                }
            } catch (error) {
                console.error('Apply error:', error)
                toast.error('An unexpected error occurred')
                setStep('review')
            }
        })
    }

    // Render different steps
    if (step === 'analyzing') {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className='flex items-center gap-2'>
                        <Loader2 className='h-5 w-5 animate-spin' />
                        Analyzing Posts...
                    </CardTitle>
                    <CardDescription>
                        AI is analyzing {selectedPostIds.size} posts. This may
                        take a few minutes.
                    </CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                    <Progress value={analysisProgress} />
                    <p className='text-muted-foreground text-center text-sm'>
                        {analysisProgress}% complete
                    </p>
                </CardContent>
            </Card>
        )
    }

    if (step === 'review' && analysisResult) {
        return (
            <div className='space-y-6'>
                {/* Stats Summary */}
                <Card>
                    <CardHeader>
                        <CardTitle>Analysis Complete</CardTitle>
                        <CardDescription>
                            Review the detected B&A pairs and content
                            classifications before applying
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className='grid gap-4 md:grid-cols-5'>
                            <div className='text-center'>
                                <p className='text-2xl font-bold'>
                                    {analysisResult.stats.analyzedMedia}
                                </p>
                                <p className='text-muted-foreground text-sm'>
                                    Images Analyzed
                                </p>
                            </div>
                            <div className='text-center'>
                                <p className='text-2xl font-bold text-green-600'>
                                    {analysisResult.stats.sideBySideCount}
                                </p>
                                <p className='text-muted-foreground text-sm'>
                                    Side-by-Side
                                </p>
                            </div>
                            <div className='text-center'>
                                <p className='text-2xl font-bold text-blue-600'>
                                    {analysisResult.stats.pairedCount}
                                </p>
                                <p className='text-muted-foreground text-sm'>
                                    Matched Pairs
                                </p>
                            </div>
                            <div className='text-center'>
                                <p className='text-2xl font-bold text-yellow-600'>
                                    {analysisResult.stats.unpairedCount}
                                </p>
                                <p className='text-muted-foreground text-sm'>
                                    Unpaired
                                </p>
                            </div>
                            <div className='text-center'>
                                <p className='text-2xl font-bold text-gray-600'>
                                    {analysisResult.nonBAMedia.length}
                                </p>
                                <p className='text-muted-foreground text-sm'>
                                    Non-B&A
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Detected Pairs */}
                {analysisResult.detectedPairs.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className='flex items-center gap-2'>
                                <Check className='h-5 w-5 text-green-600' />
                                Detected B&A Pairs (
                                {analysisResult.detectedPairs.length})
                            </CardTitle>
                            <CardDescription>
                                These pairs will be created as Before/After
                                entries
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
                                {analysisResult.detectedPairs.map((pair) => (
                                    <PairCard
                                        key={pair.id}
                                        pair={pair}
                                        galleryGroups={galleryGroups}
                                        selectedGroupIds={
                                            pairGroupAssignments.get(pair.id) ||
                                            []
                                        }
                                        onGroupIdsChange={(
                                            pairId,
                                            groupIds
                                        ) => {
                                            const newAssignments = new Map(
                                                pairGroupAssignments
                                            )
                                            newAssignments.set(pairId, groupIds)
                                            setPairGroupAssignments(
                                                newAssignments
                                            )
                                        }}
                                    />
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Unpaired Media */}
                {analysisResult.unpairedMedia.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className='flex items-center gap-2'>
                                <AlertCircle className='h-5 w-5 text-yellow-600' />
                                Unpaired Media (
                                {analysisResult.unpairedMedia.length})
                            </CardTitle>
                            <CardDescription>
                                These images were detected as before/after but
                                couldn&apos;t be matched. Assign to a gallery
                                group.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className='grid gap-4 md:grid-cols-4 lg:grid-cols-6'>
                                {analysisResult.unpairedMedia.map((media) => (
                                    <UnpairedMediaCard
                                        key={media.mediaId}
                                        media={media}
                                        galleryGroups={galleryGroups}
                                        selectedGroupIds={
                                            unpairedGroupAssignments.get(
                                                media.mediaId
                                            ) || []
                                        }
                                        onGroupIdsChange={(
                                            mediaId,
                                            groupIds
                                        ) => {
                                            const newAssignments = new Map(
                                                unpairedGroupAssignments
                                            )
                                            newAssignments.set(
                                                mediaId,
                                                groupIds
                                            )
                                            setUnpairedGroupAssignments(
                                                newAssignments
                                            )
                                        }}
                                    />
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Non-BA Media */}
                {analysisResult.nonBAMedia.length > 0 && (
                    <Card>
                        <CardHeader>
                            <div className='flex items-center justify-between'>
                                <div>
                                    <CardTitle>
                                        Non-Before/After Content (
                                        {analysisResult.nonBAMedia.length})
                                    </CardTitle>
                                    <CardDescription>
                                        Assign to gallery groups based on
                                        detected procedure
                                    </CardDescription>
                                </div>
                                <div className='flex items-center gap-2'>
                                    <Button
                                        variant='outline'
                                        size='sm'
                                        onClick={() => {
                                            const allIds =
                                                analysisResult.nonBAMedia.map(
                                                    (m) => m.mediaId
                                                )
                                            setSelectedNonBAMediaIds(
                                                new Set(allIds)
                                            )
                                        }}
                                    >
                                        Select All
                                    </Button>
                                    <Button
                                        variant='ghost'
                                        size='sm'
                                        onClick={() =>
                                            setSelectedNonBAMediaIds(new Set())
                                        }
                                    >
                                        Deselect All
                                    </Button>
                                    <Badge variant='outline'>
                                        {selectedNonBAMediaIds.size} selected
                                    </Badge>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className='grid gap-4 md:grid-cols-4 lg:grid-cols-6'>
                                {analysisResult.nonBAMedia.map((media) => (
                                    <NonBAMediaCard
                                        key={media.mediaId}
                                        media={media}
                                        galleryGroups={galleryGroups}
                                        selectedGroupIds={
                                            nonBAGroupAssignments.get(
                                                media.mediaId
                                            ) || []
                                        }
                                        onGroupIdsChange={(
                                            mediaId,
                                            groupIds
                                        ) => {
                                            const newAssignments = new Map(
                                                nonBAGroupAssignments
                                            )
                                            newAssignments.set(
                                                mediaId,
                                                groupIds
                                            )
                                            setNonBAGroupAssignments(
                                                newAssignments
                                            )
                                        }}
                                        isSelected={selectedNonBAMediaIds.has(
                                            media.mediaId
                                        )}
                                        onSelectedChange={(
                                            mediaId,
                                            selected
                                        ) => {
                                            const newSelected = new Set(
                                                selectedNonBAMediaIds
                                            )
                                            if (selected) {
                                                newSelected.add(mediaId)
                                            } else {
                                                newSelected.delete(mediaId)
                                            }
                                            setSelectedNonBAMediaIds(
                                                newSelected
                                            )
                                        }}
                                    />
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Actions */}
                <div className='flex justify-end gap-3'>
                    <Button
                        variant='outline'
                        onClick={() => {
                            setStep('select')
                            setAnalysisResult(null)
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleApplyResults}
                        disabled={
                            isPending ||
                            (analysisResult.detectedPairs.length === 0 &&
                                analysisResult.unpairedMedia.length === 0 &&
                                selectedNonBAMediaIds.size === 0)
                        }
                    >
                        {isPending ? (
                            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                        ) : (
                            <Check className='mr-2 h-4 w-4' />
                        )}
                        Apply {analysisResult.detectedPairs.length} Pairs,{' '}
                        {analysisResult.unpairedMedia.length +
                            selectedNonBAMediaIds.size}{' '}
                        Media
                    </Button>
                </div>
            </div>
        )
    }

    if (step === 'applying') {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className='flex items-center gap-2'>
                        <Loader2 className='h-5 w-5 animate-spin' />
                        Applying Results...
                    </CardTitle>
                    <CardDescription>
                        Creating B&A pairs and assigning groups
                    </CardDescription>
                </CardHeader>
            </Card>
        )
    }

    if (step === 'complete') {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className='flex items-center gap-2'>
                        <Check className='h-5 w-5 text-green-600' />
                        Analysis Complete!
                    </CardTitle>
                    <CardDescription>
                        All B&A pairs have been created and media has been
                        assigned to groups
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className='flex gap-3'>
                        <Button asChild variant='outline'>
                            <Link href='/gallery/before-after'>
                                View B&A Pairs
                            </Link>
                        </Button>
                        <Button
                            onClick={() => {
                                setStep('select')
                                setAnalysisResult(null)
                                setSelectedPostIds(new Set())
                                router.refresh()
                            }}
                        >
                            Analyze More Posts
                        </Button>
                    </div>
                </CardContent>
            </Card>
        )
    }

    // Selection step (default)
    return (
        <div className='space-y-6'>
            {/* Status Filter Tabs */}
            <Card>
                <CardContent className='pt-6'>
                    <Tabs
                        value={analysisStatus}
                        onValueChange={(value) =>
                            setAnalysisStatus(
                                value as InstagramAnalysisStatusFilter
                            )
                        }
                    >
                        <TabsList className='grid w-full grid-cols-4'>
                            <TabsTrigger value='pending'>
                                Pending
                                <Badge variant='secondary' className='ml-2'>
                                    {statusCounts.pending}
                                </Badge>
                            </TabsTrigger>
                            <TabsTrigger value='analyzed'>
                                Analyzed
                                <Badge variant='secondary' className='ml-2'>
                                    {statusCounts.analyzed}
                                </Badge>
                            </TabsTrigger>
                            <TabsTrigger value='reviewed'>
                                Reviewed
                                <Badge variant='secondary' className='ml-2'>
                                    {statusCounts.reviewed}
                                </Badge>
                            </TabsTrigger>
                            <TabsTrigger value='all'>
                                All (excl. Applied)
                                <Badge variant='secondary' className='ml-2'>
                                    {statusCounts.pending +
                                        statusCounts.analyzed +
                                        statusCounts.reviewed}
                                </Badge>
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </CardContent>
            </Card>

            {/* Media Type Filter Tabs */}
            <Card>
                <CardContent className='pt-6'>
                    <div className='flex justify-center border-t'>
                        <div className='flex gap-12'>
                            <button
                                onClick={() => setMediaType('all')}
                                className={`flex h-12 items-center gap-2 border-t text-xs font-semibold tracking-widest uppercase transition-colors ${
                                    mediaType === 'all'
                                        ? 'border-foreground text-foreground'
                                        : 'text-muted-foreground hover:text-foreground border-transparent'
                                }`}
                            >
                                <Grid className='h-3 w-3' />
                                All
                            </button>
                            <button
                                onClick={() => setMediaType('image')}
                                className={`flex h-12 items-center gap-2 border-t text-xs font-semibold tracking-widest uppercase transition-colors ${
                                    mediaType === 'image'
                                        ? 'border-foreground text-foreground'
                                        : 'text-muted-foreground hover:text-foreground border-transparent'
                                }`}
                            >
                                <ImageIcon className='h-3 w-3' />
                                Images
                            </button>
                            <button
                                onClick={() => setMediaType('carousel')}
                                className={`flex h-12 items-center gap-2 border-t text-xs font-semibold tracking-widest uppercase transition-colors ${
                                    mediaType === 'carousel'
                                        ? 'border-foreground text-foreground'
                                        : 'text-muted-foreground hover:text-foreground border-transparent'
                                }`}
                            >
                                <Layers className='h-3 w-3' />
                                Carousel
                            </button>
                        </div>
                    </div>
                </CardContent>
            </Card>

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

// Sub-components
function UnpairedMediaCard({
    media,
    galleryGroups,
    selectedGroupIds,
    onGroupIdsChange,
}: {
    media: BulkAnalysisResult['unpairedMedia'][number]
    galleryGroups: GalleryGroupForAI[]
    selectedGroupIds: string[]
    onGroupIdsChange: (mediaId: string, groupIds: string[]) => void
}) {
    // Get AI primary suggestion (highest confidence)
    const aiPrimarySuggestion =
        media.aiSuggestedGroups.length > 0 ? media.aiSuggestedGroups[0] : null

    // Convert groups to MultiSelect options
    const groupOptions = galleryGroups.map((group) => ({
        value: group.id,
        label: group.name,
    }))

    return (
        <div className='space-y-2'>
            <div className='relative aspect-square overflow-hidden rounded-lg border'>
                <Image
                    src={media.mediaUrl}
                    alt='Unpaired media'
                    fill
                    className='object-cover'
                    sizes='150px'
                />
                <Badge
                    className='absolute top-1 left-1'
                    variant={
                        media.beforeAfterType === 'before'
                            ? 'secondary'
                            : 'default'
                    }
                >
                    {media.beforeAfterType}
                </Badge>
            </div>

            {/* AI Suggestion */}
            {aiPrimarySuggestion && (
                <p className='text-muted-foreground text-xs'>
                    AI: {aiPrimarySuggestion.name} (
                    {Math.round(aiPrimarySuggestion.confidence * 100)}%)
                </p>
            )}

            {/* Group Assignment */}
            <MultiSelect
                options={groupOptions}
                defaultValue={selectedGroupIds}
                onValueChange={(groupIds: string[]) =>
                    onGroupIdsChange(media.mediaId, groupIds)
                }
                placeholder='Select groups'
                className='h-7 text-xs'
                maxCount={2}
                searchable={true}
            />
        </div>
    )
}

function NonBAMediaCard({
    media,
    galleryGroups,
    selectedGroupIds,
    onGroupIdsChange,
    isSelected,
    onSelectedChange,
}: {
    media: BulkAnalysisResult['nonBAMedia'][number]
    galleryGroups: GalleryGroupForAI[]
    selectedGroupIds: string[]
    onGroupIdsChange: (mediaId: string, groupIds: string[]) => void
    isSelected: boolean
    onSelectedChange: (mediaId: string, selected: boolean) => void
}) {
    // Get AI primary suggestion (highest confidence)
    const aiPrimarySuggestion =
        media.aiSuggestedGroups.length > 0 ? media.aiSuggestedGroups[0] : null

    // Convert groups to MultiSelect options
    const groupOptions = galleryGroups.map((group) => ({
        value: group.id,
        label: group.name,
    }))

    return (
        <div className='space-y-2'>
            <div className='relative aspect-square overflow-hidden rounded-lg border'>
                <Image
                    src={media.mediaUrl}
                    alt='Non-BA media'
                    fill
                    className='object-cover'
                    sizes='150px'
                />
                {/* Selection checkbox */}
                <div className='absolute top-1 left-1'>
                    <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) =>
                            onSelectedChange(media.mediaId, checked === true)
                        }
                        className='bg-white'
                    />
                </div>
                <Badge className='absolute top-1 right-1' variant='outline'>
                    {media.contentType}
                </Badge>
                {media.isSideBySide && (
                    <Badge
                        className='absolute right-1 bottom-1'
                        variant='default'
                    >
                        Side-by-Side
                    </Badge>
                )}
            </div>

            {/* AI Suggestion */}
            {aiPrimarySuggestion && (
                <p className='text-muted-foreground text-xs'>
                    AI: {aiPrimarySuggestion.name} (
                    {Math.round(aiPrimarySuggestion.confidence * 100)}%)
                </p>
            )}

            {/* Group Assignment */}
            <MultiSelect
                options={groupOptions}
                defaultValue={selectedGroupIds}
                onValueChange={(groupIds: string[]) =>
                    onGroupIdsChange(media.mediaId, groupIds)
                }
                placeholder='Select groups'
                className='h-7 text-xs'
                maxCount={2}
                searchable={true}
            />
        </div>
    )
}

function PostSelectCard({
    post,
    isSelected,
    onToggle,
}: {
    post: InstagramPostListItem
    isSelected: boolean
    onToggle: () => void
}) {
    const isCarousel = post.mediaType === 'carousel'

    return (
        <div
            onClick={onToggle}
            className={`group relative aspect-square w-full cursor-pointer overflow-hidden rounded-lg border-2 transition-colors ${
                isSelected
                    ? 'border-primary ring-primary ring-2 ring-offset-2'
                    : 'hover:border-muted-foreground/30 border-transparent'
            }`}
        >
            <Image
                src={post.media.thumbnailUrl ?? post.media.url}
                alt={post.caption?.substring(0, 100) ?? 'Instagram post'}
                fill
                className='object-cover'
                sizes='(max-width: 768px) 25vw, 16vw'
            />

            {/* Checkbox */}
            <div className='absolute top-2 left-2'>
                <Checkbox checked={isSelected} className='bg-white' />
            </div>

            {/* Status badge */}
            <Badge
                className='absolute top-2 right-2'
                variant={
                    post.analysisStatus === 'pending'
                        ? 'secondary'
                        : post.analysisStatus === 'analyzed'
                          ? 'default'
                          : 'outline'
                }
            >
                {post.analysisStatus}
            </Badge>

            {/* Carousel indicator */}
            {isCarousel && (
                <div className='absolute right-2 bottom-2 text-white drop-shadow-lg'>
                    <Layers className='h-5 w-5' />
                </div>
            )}
        </div>
    )
}

function PairCard({
    pair,
    galleryGroups,
    selectedGroupIds,
    onGroupIdsChange,
}: {
    pair: DetectedPair
    galleryGroups: GalleryGroupForAI[]
    selectedGroupIds: string[]
    onGroupIdsChange: (pairId: string, groupIds: string[]) => void
}) {
    const isSideBySide = pair.type === 'side_by_side'

    // Get AI primary suggestion (highest confidence)
    const aiPrimarySuggestion =
        pair.aiSuggestedGroups.length > 0 ? pair.aiSuggestedGroups[0] : null

    // Check if user has AI-suggested procedure selected
    const isUsingAISuggestion =
        aiPrimarySuggestion &&
        selectedGroupIds.includes(aiPrimarySuggestion.groupId)

    // Convert groups to MultiSelect options
    const groupOptions = galleryGroups.map((group) => ({
        value: group.id,
        label: group.name,
    }))

    return (
        <div className='space-y-3 rounded-lg border p-3'>
            <div className='flex items-center justify-between'>
                <Badge variant={isSideBySide ? 'default' : 'secondary'}>
                    {isSideBySide ? 'Side-by-Side' : 'Matched Pair'}
                </Badge>
                <span className='text-muted-foreground text-xs'>
                    {Math.round(pair.confidence * 100)}% match
                </span>
            </div>

            <div className='flex items-center gap-2'>
                <div className='relative aspect-square w-1/2 overflow-hidden rounded-md'>
                    <Image
                        src={pair.beforeMediaUrl}
                        alt='Before'
                        fill
                        className='object-cover'
                        sizes='100px'
                    />
                    <Badge
                        className='absolute bottom-1 left-1'
                        variant='secondary'
                    >
                        Before
                    </Badge>
                </div>

                {!isSideBySide && (
                    <ArrowRight className='text-muted-foreground h-4 w-4 shrink-0' />
                )}

                {!isSideBySide && (
                    <div className='relative aspect-square w-1/2 overflow-hidden rounded-md'>
                        <Image
                            src={pair.afterMediaUrl}
                            alt='After'
                            fill
                            className='object-cover'
                            sizes='100px'
                        />
                        <Badge className='absolute bottom-1 left-1'>
                            After
                        </Badge>
                    </div>
                )}
            </div>

            {/* AI Suggestions */}
            {pair.aiSuggestedGroups.length > 0 && (
                <div className='space-y-1'>
                    <p className='text-muted-foreground text-xs font-medium'>
                        AI suggests:
                    </p>
                    <div className='flex flex-wrap gap-1'>
                        {pair.aiSuggestedGroups
                            .slice(0, 2)
                            .map((suggestion) => (
                                <Badge
                                    key={suggestion.groupId}
                                    variant='outline'
                                    className='text-xs'
                                >
                                    {suggestion.name} (
                                    {Math.round(suggestion.confidence * 100)}%)
                                </Badge>
                            ))}
                    </div>
                </div>
            )}

            {/* Group Assignment */}
            <div className='space-y-1'>
                <div className='flex items-center gap-2'>
                    <p className='text-xs font-medium'>Groups:</p>
                    {isUsingAISuggestion && (
                        <Badge variant='secondary' className='text-xs'>
                            ✨ AI suggested
                        </Badge>
                    )}
                </div>
                <MultiSelect
                    options={groupOptions}
                    defaultValue={selectedGroupIds}
                    onValueChange={(groupIds: string[]) =>
                        onGroupIdsChange(pair.id, groupIds)
                    }
                    placeholder='Select groups'
                    className='h-8 text-xs'
                    maxCount={2}
                    searchable={true}
                />
            </div>
        </div>
    )
}
