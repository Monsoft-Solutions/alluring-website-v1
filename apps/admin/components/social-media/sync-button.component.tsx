'use client'

/**
 * Sync Button Component
 *
 * Button to trigger Instagram post sync with loading state and results.
 *
 * @module components/social-media/sync-button
 */
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@workspace/ui/components/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@workspace/ui/components/dialog'
import { Loader2, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react'

import {
    syncInstagramPosts,
    type SyncResult,
} from '@/lib/actions/social-media.action'

type SyncButtonProps = {
    disabled?: boolean
}

export function SyncButton({ disabled }: SyncButtonProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [showResults, setShowResults] = useState(false)
    const [syncResult, setSyncResult] = useState<SyncResult | null>(null)

    const handleSync = () => {
        startTransition(async () => {
            const result = await syncInstagramPosts()
            setSyncResult(result)
            setShowResults(true)
            router.refresh()
        })
    }

    return (
        <>
            <Button
                onClick={handleSync}
                disabled={disabled || isPending}
                variant='outline'
            >
                {isPending ? (
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                ) : (
                    <RefreshCw className='mr-2 h-4 w-4' />
                )}
                {isPending ? 'Syncing...' : 'Sync Now'}
            </Button>

            <Dialog open={showResults} onOpenChange={setShowResults}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className='flex items-center gap-2'>
                            {syncResult?.success ? (
                                <CheckCircle className='h-5 w-5 text-green-500' />
                            ) : (
                                <AlertCircle className='h-5 w-5 text-red-500' />
                            )}
                            Sync {syncResult?.success ? 'Complete' : 'Failed'}
                        </DialogTitle>
                        <DialogDescription>
                            {syncResult?.success
                                ? 'Instagram posts have been synchronized.'
                                : 'There was an issue syncing Instagram posts.'}
                        </DialogDescription>
                    </DialogHeader>

                    {syncResult && (
                        <div className='space-y-4'>
                            {/* Stats */}
                            <div className='grid grid-cols-3 gap-4'>
                                <div className='rounded-lg border p-3 text-center'>
                                    <p className='text-2xl font-bold text-green-600'>
                                        {syncResult.newPostsCount}
                                    </p>
                                    <p className='text-muted-foreground text-sm'>
                                        New Posts
                                    </p>
                                </div>
                                <div className='rounded-lg border p-3 text-center'>
                                    <p className='text-2xl font-bold text-gray-600'>
                                        {syncResult.skippedCount}
                                    </p>
                                    <p className='text-muted-foreground text-sm'>
                                        Skipped
                                    </p>
                                </div>
                                <div className='rounded-lg border p-3 text-center'>
                                    <p className='text-2xl font-bold text-red-600'>
                                        {syncResult.errorCount}
                                    </p>
                                    <p className='text-muted-foreground text-sm'>
                                        Errors
                                    </p>
                                </div>
                            </div>

                            {/* More available */}
                            {syncResult.hasMore && (
                                <p className='text-muted-foreground text-sm'>
                                    More posts are available. Click Sync again
                                    to fetch more.
                                </p>
                            )}

                            {/* Errors */}
                            {syncResult.errors.length > 0 && (
                                <div className='rounded-lg border border-red-200 bg-red-50 p-3'>
                                    <p className='mb-2 text-sm font-medium text-red-700'>
                                        Errors:
                                    </p>
                                    <ul className='list-inside list-disc space-y-1 text-sm text-red-600'>
                                        {syncResult.errors
                                            .slice(0, 5)
                                            .map((error, i) => (
                                                <li key={i}>{error}</li>
                                            ))}
                                        {syncResult.errors.length > 5 && (
                                            <li>
                                                ...and{' '}
                                                {syncResult.errors.length - 5}{' '}
                                                more
                                            </li>
                                        )}
                                    </ul>
                                </div>
                            )}

                            <div className='flex justify-end'>
                                <Button onClick={() => setShowResults(false)}>
                                    Close
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    )
}
