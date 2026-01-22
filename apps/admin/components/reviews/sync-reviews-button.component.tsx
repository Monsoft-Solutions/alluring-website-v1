'use client'

/**
 * Sync Reviews Button Component
 *
 * Button to trigger syncing reviews from Google Business Profile.
 *
 * @module components/reviews/sync-reviews-button
 */
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@workspace/ui/components/button'
import { RefreshCw, Loader2 } from 'lucide-react'

import { syncGoogleReviews } from '@/lib/actions/google-reviews.action'

type SyncReviewsButtonProps = {
    disabled?: boolean
}

export function SyncReviewsButton({ disabled }: SyncReviewsButtonProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [message, setMessage] = useState<{
        type: 'success' | 'error'
        text: string
    } | null>(null)

    const handleSync = () => {
        setMessage(null)

        startTransition(async () => {
            const result = await syncGoogleReviews()

            if (result.success) {
                setMessage({
                    type: 'success',
                    text: `Synced ${result.newCount} new and ${result.updatedCount} updated reviews`,
                })
                router.refresh()
            } else {
                setMessage({
                    type: 'error',
                    text: result.error ?? 'Failed to sync reviews',
                })
            }

            // Clear message after 5 seconds
            setTimeout(() => setMessage(null), 5000)
        })
    }

    return (
        <div className='flex items-center gap-2'>
            <Button
                variant='outline'
                onClick={handleSync}
                disabled={disabled || isPending}
            >
                {isPending ? (
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                ) : (
                    <RefreshCw className='mr-2 h-4 w-4' />
                )}
                Sync Reviews
            </Button>
            {message && (
                <span
                    className={`text-sm ${
                        message.type === 'success'
                            ? 'text-green-600'
                            : 'text-red-600'
                    }`}
                >
                    {message.text}
                </span>
            )}
        </div>
    )
}
