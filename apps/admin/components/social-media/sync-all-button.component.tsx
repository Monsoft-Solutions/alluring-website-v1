'use client'

/**
 * Sync All Button Component
 *
 * Button to trigger full Instagram profile sync with progress tracking.
 * Iteratively calls the sync action until all posts are fetched.
 *
 * @module components/social-media/sync-all-button
 */
import { useCallback, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@workspace/ui/components/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@workspace/ui/components/dialog'
import {
    AlertCircle,
    CheckCircle,
    CloudDownload,
    Loader2,
    XCircle,
} from 'lucide-react'

import {
    syncInstagramPosts,
    resetInstagramSyncCursor,
    type SyncResult,
} from '@/lib/actions/social-media.action'

// ============================================================================
// Constants
// ============================================================================

/**
 * Delay between API batch calls to prevent rate limiting (1.5 seconds)
 */
const BATCH_DELAY_MS = 1500

/**
 * Helper function to sleep for a given duration
 */
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// ============================================================================
// Types
// ============================================================================

type SyncState = 'idle' | 'syncing' | 'complete' | 'error' | 'cancelled'

type CumulativeStats = {
    totalNewPosts: number
    totalSkipped: number
    totalErrors: number
    batchesCompleted: number
    allErrors: string[]
    totalPostsOnInstagram: number | null // Total posts from profile API
}

type SyncAllButtonProps = {
    /**
     * Whether sync is disabled (e.g., settings not configured)
     */
    disabled?: boolean
    /**
     * Whether to show as a full button or compact variant
     */
    variant?: 'default' | 'compact'
}

// ============================================================================
// Component
// ============================================================================

export function SyncAllButton({
    disabled = false,
    variant = 'default',
}: SyncAllButtonProps) {
    const router = useRouter()
    const [showDialog, setShowDialog] = useState(false)
    const [syncState, setSyncState] = useState<SyncState>('idle')
    const [stats, setStats] = useState<CumulativeStats>({
        totalNewPosts: 0,
        totalSkipped: 0,
        totalErrors: 0,
        batchesCompleted: 0,
        allErrors: [],
        totalPostsOnInstagram: null,
    })
    const [currentBatchResult, setCurrentBatchResult] =
        useState<SyncResult | null>(null)

    // Ref to track if user has cancelled
    const cancelledRef = useRef(false)

    /**
     * Reset all state to initial values
     */
    const resetState = useCallback(() => {
        setSyncState('idle')
        setStats({
            totalNewPosts: 0,
            totalSkipped: 0,
            totalErrors: 0,
            batchesCompleted: 0,
            allErrors: [],
            totalPostsOnInstagram: null,
        })
        setCurrentBatchResult(null)
        cancelledRef.current = false
    }, [])

    /**
     * Update stats from a batch result
     */
    const updateStatsFromResult = useCallback(
        (result: SyncResult, isFirstBatch: boolean) => {
            setCurrentBatchResult(result)
            setStats((prev) => ({
                totalNewPosts: prev.totalNewPosts + result.newPostsCount,
                totalSkipped: prev.totalSkipped + result.skippedCount,
                totalErrors: prev.totalErrors + result.errorCount,
                batchesCompleted: prev.batchesCompleted + 1,
                allErrors: [...prev.allErrors, ...result.errors],
                // Capture total posts count from first batch
                totalPostsOnInstagram:
                    isFirstBatch && result.totalPostsCount
                        ? result.totalPostsCount
                        : prev.totalPostsOnInstagram,
            }))
        },
        []
    )

    /**
     * Start the sync all process with pipeline pattern
     *
     * Uses a producer-consumer pattern to overlap batch fetching with UI updates.
     * Fetches the next batch while processing/updating stats from current batch.
     */
    const startSyncAll = useCallback(async () => {
        resetState()
        setSyncState('syncing')
        setShowDialog(true)

        // First, reset the cursor to start from the beginning
        const resetResult = await resetInstagramSyncCursor()
        if (!resetResult.success) {
            setSyncState('error')
            setStats((prev) => ({
                ...prev,
                allErrors: [resetResult.error ?? 'Failed to reset sync cursor'],
            }))
            return
        }

        // Pipeline pattern: overlap fetch with processing
        let hasMore = true
        let isFirstBatch = true
        let pendingResult: SyncResult | null = null
        let nextFetchPromise: Promise<SyncResult> | null = null

        // Start first batch
        try {
            pendingResult = await syncInstagramPosts({ resetCursor: true })
        } catch (error) {
            console.error('First batch error:', error)
            setSyncState('error')
            setStats((prev) => ({
                ...prev,
                allErrors: [
                    error instanceof Error
                        ? error.message
                        : 'Unknown error occurred',
                ],
            }))
            return
        }

        while (pendingResult && !cancelledRef.current) {
            const currentResult = pendingResult

            // Start fetching next batch in parallel if there's more
            if (currentResult.hasMore && !cancelledRef.current) {
                nextFetchPromise = syncInstagramPosts().catch((error) => {
                    console.error('Next batch fetch error:', error)
                    return {
                        success: false,
                        newPostsCount: 0,
                        skippedCount: 0,
                        errorCount: 1,
                        errors: [
                            error instanceof Error
                                ? error.message
                                : 'Unknown error',
                        ],
                        nextCursor: null,
                        hasMore: false,
                    } as SyncResult
                })
            } else {
                nextFetchPromise = null
            }

            // Process current batch result (UI updates happen synchronously)
            if (!currentResult.success && currentResult.errors.length > 0) {
                // Batch failed entirely
                setSyncState('error')
                setStats((prev) => ({
                    ...prev,
                    batchesCompleted: prev.batchesCompleted + 1,
                    allErrors: [...prev.allErrors, ...currentResult.errors],
                }))
                return
            }

            // Update cumulative stats
            updateStatsFromResult(currentResult, isFirstBatch)
            isFirstBatch = false

            // Wait for next batch if we started one
            if (nextFetchPromise) {
                // Rate limiting: add delay between batches to prevent API throttling
                await sleep(BATCH_DELAY_MS)

                try {
                    pendingResult = await nextFetchPromise
                } catch {
                    // Error already handled in the catch above
                    pendingResult = null
                }
            } else {
                pendingResult = null
            }
        }

        // Check if cancelled
        if (cancelledRef.current) {
            setSyncState('cancelled')
        } else {
            setSyncState('complete')
        }

        router.refresh()
    }, [resetState, router, updateStatsFromResult])

    /**
     * Cancel the sync process
     */
    const handleCancel = useCallback(() => {
        cancelledRef.current = true
    }, [])

    /**
     * Close dialog and reset
     */
    const handleClose = useCallback(() => {
        if (syncState === 'syncing') {
            // If syncing, just cancel
            handleCancel()
        } else {
            setShowDialog(false)
            resetState()
        }
    }, [syncState, handleCancel, resetState])

    /**
     * Retry after error
     */
    const handleRetry = useCallback(() => {
        void startSyncAll()
    }, [startSyncAll])

    // ========================================================================
    // Render Helpers
    // ========================================================================

    const renderSyncingContent = () => {
        // Calculate progress percentage
        const processedPosts = stats.totalNewPosts + stats.totalSkipped
        const totalPosts = stats.totalPostsOnInstagram
        const progressPercentage =
            totalPosts && totalPosts > 0
                ? Math.min(Math.round((processedPosts / totalPosts) * 100), 100)
                : 0

        return (
            <div className='space-y-6'>
                {/* Progress indicator with percentage */}
                <div className='space-y-2'>
                    <div className='flex items-center justify-between text-sm'>
                        <span className='text-muted-foreground'>
                            {totalPosts ? (
                                <>
                                    {processedPosts} of {totalPosts} posts
                                </>
                            ) : (
                                <>Batch {stats.batchesCompleted + 1}</>
                            )}
                        </span>
                        <div className='flex items-center gap-2'>
                            {totalPosts && (
                                <span className='text-primary font-medium'>
                                    {progressPercentage}%
                                </span>
                            )}
                            <Loader2 className='h-4 w-4 animate-spin' />
                        </div>
                    </div>
                    {/* Progress bar */}
                    <div className='h-2 w-full overflow-hidden rounded-full bg-gray-200'>
                        {totalPosts ? (
                            <div
                                className='bg-primary h-full rounded-full transition-all duration-300 ease-out'
                                style={{ width: `${progressPercentage}%` }}
                            />
                        ) : (
                            <div className='bg-primary h-full w-1/3 animate-pulse rounded-full' />
                        )}
                    </div>
                </div>

                {/* Stats grid */}
                <div className='grid grid-cols-3 gap-4'>
                    <div className='rounded-lg border p-3 text-center'>
                        <p className='text-2xl font-bold text-green-600'>
                            {stats.totalNewPosts}
                        </p>
                        <p className='text-muted-foreground text-sm'>
                            New Posts
                        </p>
                    </div>
                    <div className='rounded-lg border p-3 text-center'>
                        <p className='text-2xl font-bold text-gray-600'>
                            {stats.totalSkipped}
                        </p>
                        <p className='text-muted-foreground text-sm'>Skipped</p>
                    </div>
                    <div className='rounded-lg border p-3 text-center'>
                        <p className='text-2xl font-bold text-red-600'>
                            {stats.totalErrors}
                        </p>
                        <p className='text-muted-foreground text-sm'>Errors</p>
                    </div>
                </div>

                {/* Detailed breakdown */}
                {totalPosts && (
                    <div className='text-muted-foreground bg-muted/50 rounded-lg border p-3 text-center text-sm'>
                        {stats.totalNewPosts} new | {stats.totalSkipped} skipped
                        | {totalPosts} total on Instagram
                    </div>
                )}

                {/* Current batch info */}
                {currentBatchResult && !totalPosts && (
                    <p className='text-muted-foreground text-center text-sm'>
                        Last batch: {currentBatchResult.newPostsCount} new,{' '}
                        {currentBatchResult.skippedCount} skipped
                    </p>
                )}

                {/* Cancel button */}
                <div className='flex justify-center'>
                    <Button variant='outline' onClick={handleCancel}>
                        <XCircle className='mr-2 h-4 w-4' />
                        Cancel
                    </Button>
                </div>
            </div>
        )
    }

    const renderCompleteContent = () => (
        <div className='space-y-6'>
            {/* Success icon */}
            <div className='flex justify-center'>
                <div className='flex h-16 w-16 items-center justify-center rounded-full bg-green-100'>
                    <CheckCircle className='h-8 w-8 text-green-600' />
                </div>
            </div>

            {/* Stats grid */}
            <div className='grid grid-cols-3 gap-4'>
                <div className='rounded-lg border p-3 text-center'>
                    <p className='text-2xl font-bold text-green-600'>
                        {stats.totalNewPosts}
                    </p>
                    <p className='text-muted-foreground text-sm'>New Posts</p>
                </div>
                <div className='rounded-lg border p-3 text-center'>
                    <p className='text-2xl font-bold text-gray-600'>
                        {stats.totalSkipped}
                    </p>
                    <p className='text-muted-foreground text-sm'>Skipped</p>
                </div>
                <div className='rounded-lg border p-3 text-center'>
                    <p className='text-2xl font-bold text-red-600'>
                        {stats.totalErrors}
                    </p>
                    <p className='text-muted-foreground text-sm'>Errors</p>
                </div>
            </div>

            {/* Summary with total posts */}
            {stats.totalPostsOnInstagram ? (
                <div className='text-muted-foreground bg-muted/50 rounded-lg border p-3 text-center text-sm'>
                    Synced {stats.totalNewPosts + stats.totalSkipped} of{' '}
                    {stats.totalPostsOnInstagram} posts from Instagram
                </div>
            ) : (
                <p className='text-muted-foreground text-center text-sm'>
                    Completed {stats.batchesCompleted} batches
                </p>
            )}

            {/* Errors list if any */}
            {stats.allErrors.length > 0 && (
                <div className='rounded-lg border border-amber-200 bg-amber-50 p-3'>
                    <p className='mb-2 text-sm font-medium text-amber-700'>
                        Some posts had errors:
                    </p>
                    <ul className='list-inside list-disc space-y-1 text-sm text-amber-600'>
                        {stats.allErrors.slice(0, 5).map((error, i) => (
                            <li key={i}>{error}</li>
                        ))}
                        {stats.allErrors.length > 5 && (
                            <li>
                                ...and {stats.allErrors.length - 5} more errors
                            </li>
                        )}
                    </ul>
                </div>
            )}

            {/* Close button */}
            <div className='flex justify-end'>
                <Button onClick={handleClose}>Done</Button>
            </div>
        </div>
    )

    const renderErrorContent = () => (
        <div className='space-y-6'>
            {/* Error icon */}
            <div className='flex justify-center'>
                <div className='flex h-16 w-16 items-center justify-center rounded-full bg-red-100'>
                    <AlertCircle className='h-8 w-8 text-red-600' />
                </div>
            </div>

            {/* Partial stats */}
            {stats.batchesCompleted > 0 && (
                <div className='grid grid-cols-3 gap-4'>
                    <div className='rounded-lg border p-3 text-center'>
                        <p className='text-2xl font-bold text-green-600'>
                            {stats.totalNewPosts}
                        </p>
                        <p className='text-muted-foreground text-sm'>
                            New Posts
                        </p>
                    </div>
                    <div className='rounded-lg border p-3 text-center'>
                        <p className='text-2xl font-bold text-gray-600'>
                            {stats.totalSkipped}
                        </p>
                        <p className='text-muted-foreground text-sm'>Skipped</p>
                    </div>
                    <div className='rounded-lg border p-3 text-center'>
                        <p className='text-2xl font-bold text-red-600'>
                            {stats.totalErrors}
                        </p>
                        <p className='text-muted-foreground text-sm'>Errors</p>
                    </div>
                </div>
            )}

            {/* Progress summary if available */}
            {stats.totalPostsOnInstagram && stats.batchesCompleted > 0 && (
                <div className='text-muted-foreground bg-muted/50 rounded-lg border p-3 text-center text-sm'>
                    Synced {stats.totalNewPosts + stats.totalSkipped} of{' '}
                    {stats.totalPostsOnInstagram} posts before error
                </div>
            )}

            {/* Error message */}
            <div className='rounded-lg border border-red-200 bg-red-50 p-3'>
                <p className='text-sm font-medium text-red-700'>
                    Sync failed after {stats.batchesCompleted} batches:
                </p>
                <ul className='mt-2 list-inside list-disc space-y-1 text-sm text-red-600'>
                    {stats.allErrors.slice(0, 3).map((error, i) => (
                        <li key={i}>{error}</li>
                    ))}
                </ul>
            </div>

            {/* Action buttons */}
            <div className='flex justify-end gap-2'>
                <Button variant='outline' onClick={handleClose}>
                    Close
                </Button>
                <Button onClick={handleRetry}>Retry</Button>
            </div>
        </div>
    )

    const renderCancelledContent = () => (
        <div className='space-y-6'>
            {/* Cancelled icon */}
            <div className='flex justify-center'>
                <div className='flex h-16 w-16 items-center justify-center rounded-full bg-gray-100'>
                    <XCircle className='h-8 w-8 text-gray-600' />
                </div>
            </div>

            {/* Partial stats */}
            <div className='grid grid-cols-3 gap-4'>
                <div className='rounded-lg border p-3 text-center'>
                    <p className='text-2xl font-bold text-green-600'>
                        {stats.totalNewPosts}
                    </p>
                    <p className='text-muted-foreground text-sm'>New Posts</p>
                </div>
                <div className='rounded-lg border p-3 text-center'>
                    <p className='text-2xl font-bold text-gray-600'>
                        {stats.totalSkipped}
                    </p>
                    <p className='text-muted-foreground text-sm'>Skipped</p>
                </div>
                <div className='rounded-lg border p-3 text-center'>
                    <p className='text-2xl font-bold text-red-600'>
                        {stats.totalErrors}
                    </p>
                    <p className='text-muted-foreground text-sm'>Errors</p>
                </div>
            </div>

            {/* Message with progress info */}
            {stats.totalPostsOnInstagram ? (
                <div className='space-y-2'>
                    <div className='text-muted-foreground bg-muted/50 rounded-lg border p-3 text-center text-sm'>
                        Synced {stats.totalNewPosts + stats.totalSkipped} of{' '}
                        {stats.totalPostsOnInstagram} posts before cancellation
                    </div>
                    <p className='text-muted-foreground text-center text-sm'>
                        You can resume later - progress is saved.
                    </p>
                </div>
            ) : (
                <p className='text-muted-foreground text-center text-sm'>
                    Sync was cancelled after {stats.batchesCompleted} batches.
                    You can resume later - progress is saved.
                </p>
            )}

            {/* Close button */}
            <div className='flex justify-end'>
                <Button onClick={handleClose}>Close</Button>
            </div>
        </div>
    )

    const getDialogTitle = () => {
        switch (syncState) {
            case 'syncing':
                return 'Syncing All Instagram Posts'
            case 'complete':
                return 'Sync Complete'
            case 'error':
                return 'Sync Failed'
            case 'cancelled':
                return 'Sync Cancelled'
            default:
                return 'Sync All Posts'
        }
    }

    const getDialogDescription = () => {
        switch (syncState) {
            case 'syncing':
                return 'Fetching and uploading posts from Instagram. This may take a while...'
            case 'complete':
                return 'All available Instagram posts have been synchronized.'
            case 'error':
                return 'An error occurred during the sync process.'
            case 'cancelled':
                return 'The sync process was cancelled.'
            default:
                return ''
        }
    }

    return (
        <>
            <Button
                onClick={startSyncAll}
                disabled={disabled}
                variant={variant === 'compact' ? 'outline' : 'default'}
                size={variant === 'compact' ? 'sm' : 'default'}
            >
                <CloudDownload className='mr-2 h-4 w-4' />
                {variant === 'compact' ? 'Sync All' : 'Sync All Posts'}
            </Button>

            <Dialog open={showDialog} onOpenChange={handleClose}>
                <DialogContent className='sm:max-w-md'>
                    <DialogHeader>
                        <DialogTitle className='flex items-center gap-2'>
                            {syncState === 'syncing' && (
                                <Loader2 className='h-5 w-5 animate-spin' />
                            )}
                            {getDialogTitle()}
                        </DialogTitle>
                        <DialogDescription>
                            {getDialogDescription()}
                        </DialogDescription>
                    </DialogHeader>

                    {syncState === 'syncing' && renderSyncingContent()}
                    {syncState === 'complete' && renderCompleteContent()}
                    {syncState === 'error' && renderErrorContent()}
                    {syncState === 'cancelled' && renderCancelledContent()}
                </DialogContent>
            </Dialog>
        </>
    )
}
