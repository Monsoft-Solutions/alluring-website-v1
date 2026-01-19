'use client'

/**
 * Blog Bulk Action Toolbar
 *
 * Fixed bottom toolbar for bulk actions on selected blog posts.
 * Follows the gallery bulk action toolbar pattern.
 *
 * @module @admin/components/blog/bulk-action-toolbar
 */

import { useState, useTransition } from 'react'
import { Check, FileText, Sparkles, X } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@workspace/ui/components/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu'

import {
    bulkUpdateBlogPostStatus,
    bulkGenerateFaqs,
} from '@/lib/actions/blog-bulk.action'

type BulkActionToolbarProps = {
    selectedIds: string[]
    onClearSelection: () => void
    onActionComplete: () => void
}

type BulkStatusOption = 'draft' | 'ready_to_publish' | 'published'

const STATUS_OPTIONS: Array<{
    value: BulkStatusOption
    label: string
    description: string
}> = [
    {
        value: 'draft',
        label: 'Draft',
        description: 'Return to editing',
    },
    {
        value: 'ready_to_publish',
        label: 'Ready to Publish',
        description: 'Mark as ready for review',
    },
    {
        value: 'published',
        label: 'Published',
        description: 'Publish immediately',
    },
]

export function BlogBulkActionToolbar({
    selectedIds,
    onClearSelection,
    onActionComplete,
}: BulkActionToolbarProps) {
    const [isPending, startTransition] = useTransition()
    const [statusDropdownOpen, setStatusDropdownOpen] = useState(false)

    const handleUpdateStatus = (status: BulkStatusOption) => {
        setStatusDropdownOpen(false)

        startTransition(async () => {
            const toastId = toast.loading(
                `Updating ${selectedIds.length} post${selectedIds.length > 1 ? 's' : ''} to ${status.replace('_', ' ')}...`
            )

            const result = await bulkUpdateBlogPostStatus(selectedIds, status)

            toast.dismiss(toastId)

            if (result.success) {
                toast.success(
                    `${selectedIds.length} post${selectedIds.length > 1 ? 's' : ''} updated to ${status.replace('_', ' ')}`
                )
                onActionComplete()
                onClearSelection()
            } else {
                toast.error(result.error || 'Failed to update status')
            }
        })
    }

    const handleGenerateFaqs = () => {
        startTransition(async () => {
            const toastId = toast.loading(
                `Generating FAQs for ${selectedIds.length} post${selectedIds.length > 1 ? 's' : ''}...`
            )

            const result = await bulkGenerateFaqs(selectedIds)

            toast.dismiss(toastId)

            if (result.success) {
                const processed = result.processedCount || 0
                const failed = result.failedCount || 0

                if (failed === 0) {
                    toast.success(
                        `Successfully generated FAQs for ${processed} post${processed > 1 ? 's' : ''}`
                    )
                } else {
                    toast.warning(
                        `Generated FAQs for ${processed} post${processed > 1 ? 's' : ''}, ${failed} failed`
                    )
                }
                onActionComplete()
                onClearSelection()
            } else {
                toast.error(result.error || 'Failed to generate FAQs')
            }
        })
    }

    if (selectedIds.length === 0) return null

    return (
        <div className='fixed right-0 bottom-0 left-0 z-50 border-t bg-white shadow-2xl'>
            <div className='mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8'>
                <div className='flex flex-wrap items-center justify-between gap-4'>
                    {/* Selection info */}
                    <div className='flex items-center gap-4'>
                        <p className='text-sm font-semibold'>
                            {selectedIds.length} post
                            {selectedIds.length > 1 ? 's' : ''} selected
                        </p>
                        <Button
                            variant='ghost'
                            size='sm'
                            onClick={onClearSelection}
                            disabled={isPending}
                        >
                            <X className='mr-1.5 h-4 w-4' />
                            Clear
                        </Button>
                    </div>

                    {/* Action buttons */}
                    <div className='flex flex-wrap items-center gap-2'>
                        {/* Status dropdown */}
                        <DropdownMenu
                            open={statusDropdownOpen}
                            onOpenChange={setStatusDropdownOpen}
                        >
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant='outline'
                                    size='sm'
                                    disabled={isPending}
                                >
                                    <FileText className='mr-1.5 h-4 w-4' />
                                    Change Status
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align='end'>
                                {STATUS_OPTIONS.map((option) => (
                                    <DropdownMenuItem
                                        key={option.value}
                                        onClick={() =>
                                            handleUpdateStatus(option.value)
                                        }
                                    >
                                        <div className='flex flex-col'>
                                            <span className='font-medium'>
                                                {option.label}
                                            </span>
                                            <span className='text-muted-foreground text-xs'>
                                                {option.description}
                                            </span>
                                        </div>
                                        <Check className='ml-auto h-4 w-4 opacity-0 group-data-[state=checked]:opacity-100' />
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Separator */}
                        <div className='h-6 w-px bg-gray-300' />

                        {/* Generate FAQs */}
                        <Button
                            variant='outline'
                            size='sm'
                            onClick={handleGenerateFaqs}
                            disabled={isPending}
                            title='Generate FAQs using AI (requires content)'
                        >
                            <Sparkles className='mr-1.5 h-4 w-4' />
                            Generate FAQs
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
