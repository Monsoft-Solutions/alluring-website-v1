'use client'

/**
 * Blog Bulk Action Toolbar
 *
 * Fixed bottom toolbar for bulk actions on selected blog posts.
 * Follows the gallery bulk action toolbar pattern.
 *
 * @module @admin/components/blog/bulk-action-toolbar
 */

import { useState, useTransition, useRef, useCallback, useEffect } from 'react'
import { Check, FileText, ImageIcon, Sparkles, X } from 'lucide-react'
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
    bulkGenerateInlineImages,
} from '@/lib/actions/blog-bulk.action'
import type { WorkflowStatusResponse } from '@/app/api/workflow/[runId]/route'

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

// Polling interval for workflow status (3 seconds)
const WORKFLOW_POLL_INTERVAL = 3000

export function BlogBulkActionToolbar({
    selectedIds,
    onClearSelection,
    onActionComplete,
}: BulkActionToolbarProps) {
    const [isPending, startTransition] = useTransition()
    const [statusDropdownOpen, setStatusDropdownOpen] = useState(false)
    const [isPolling, setIsPolling] = useState(false)
    const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)
    const toastIdRef = useRef<string | number | null>(null)

    /**
     * Poll workflow status until completion
     */
    const pollWorkflowStatus = useCallback(
        async (runId: string) => {
            const checkStatus = async (): Promise<boolean> => {
                try {
                    const response = await fetch(`/api/workflow/${runId}`)
                    if (!response.ok) {
                        throw new Error('Failed to get workflow status')
                    }

                    const data: WorkflowStatusResponse = await response.json()

                    if (data.status === 'completed' && data.output) {
                        // Workflow completed successfully
                        if (toastIdRef.current) {
                            toast.dismiss(toastIdRef.current)
                        }

                        const output = data.output
                        if (output.failedCount === 0) {
                            toast.success(
                                `Generated ${output.totalImagesGenerated} image${output.totalImagesGenerated !== 1 ? 's' : ''} across ${output.processedCount} post${output.processedCount !== 1 ? 's' : ''}`
                            )
                        } else {
                            toast.warning(
                                `Generated images for ${output.processedCount} post${output.processedCount !== 1 ? 's' : ''}, ${output.failedCount} failed`
                            )
                        }

                        onActionComplete()
                        onClearSelection()
                        return true
                    } else if (data.status === 'failed') {
                        // Workflow failed
                        if (toastIdRef.current) {
                            toast.dismiss(toastIdRef.current)
                        }
                        toast.error(data.error || 'Image generation failed')
                        return true
                    }

                    // Still running - update toast message
                    if (toastIdRef.current) {
                        toast.loading('Processing images...', {
                            id: toastIdRef.current,
                        })
                    }

                    return false
                } catch (error) {
                    console.error('Error polling workflow status:', error)
                    // Don't stop polling on transient errors
                    return false
                }
            }

            // Initial check
            const isDone = await checkStatus()
            if (isDone) {
                setIsPolling(false)
                return
            }

            // Set up polling interval
            setIsPolling(true)
            pollingIntervalRef.current = setInterval(async () => {
                const isDone = await checkStatus()
                if (isDone) {
                    if (pollingIntervalRef.current) {
                        clearInterval(pollingIntervalRef.current)
                        pollingIntervalRef.current = null
                    }
                    setIsPolling(false)
                }
            }, WORKFLOW_POLL_INTERVAL)
        },
        [onActionComplete, onClearSelection]
    )

    // Cleanup polling interval on unmount
    useEffect(() => {
        return () => {
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current)
            }
        }
    }, [])

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

    const handleGenerateInlineImages = () => {
        // Prevent multiple clicks while polling
        if (isPolling) return

        startTransition(async () => {
            const toastId = toast.loading(
                `Starting image generation for ${selectedIds.length} post${selectedIds.length > 1 ? 's' : ''}...`
            )
            toastIdRef.current = toastId

            const result = await bulkGenerateInlineImages(selectedIds)

            if (result.success && result.runId) {
                // Workflow started - update toast and begin polling
                toast.loading('Processing images in background...', {
                    id: toastId,
                })

                // Start polling for workflow status
                pollWorkflowStatus(result.runId)
            } else {
                // Failed to start workflow
                toast.dismiss(toastId)
                toastIdRef.current = null
                toast.error(result.error || 'Failed to start image generation')
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

                        {/* Separator */}
                        <div className='h-6 w-px bg-gray-300' />

                        {/* Generate Inline Images */}
                        <Button
                            variant='outline'
                            size='sm'
                            onClick={handleGenerateInlineImages}
                            disabled={isPending || isPolling}
                            title='Generate inline images using AI (requires content, 500+ words recommended)'
                        >
                            <ImageIcon className='mr-1.5 h-4 w-4' />
                            {isPolling ? 'Processing...' : 'Generate Images'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
