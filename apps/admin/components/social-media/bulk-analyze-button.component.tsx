'use client'

/**
 * Bulk Analyze Button Component
 *
 * Button to navigate to the bulk analysis page for Instagram posts.
 *
 * @module components/social-media/bulk-analyze-button
 */
import Link from 'next/link'
import { Button } from '@workspace/ui/components/button'
import { Sparkles } from 'lucide-react'

type BulkAnalyzeButtonProps = {
    disabled?: boolean
    pendingCount?: number
}

export function BulkAnalyzeButton({
    disabled = false,
    pendingCount,
}: BulkAnalyzeButtonProps) {
    return (
        <Button asChild variant='outline' disabled={disabled}>
            <Link href='/social-media/instagram/analyze'>
                <Sparkles className='mr-2 h-4 w-4' />
                Bulk Analyze
                {pendingCount !== undefined && pendingCount > 0 && (
                    <span className='bg-primary text-primary-foreground ml-2 rounded-full px-2 py-0.5 text-xs'>
                        {pendingCount}
                    </span>
                )}
            </Link>
        </Button>
    )
}
