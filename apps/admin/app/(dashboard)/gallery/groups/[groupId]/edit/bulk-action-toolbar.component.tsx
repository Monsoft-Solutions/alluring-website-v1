'use client'

import { useState, useTransition } from 'react'
import {
    Archive,
    Eye,
    EyeOff,
    FileText,
    RefreshCw,
    Search,
    Sparkles,
    Trash2,
    X,
} from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@workspace/ui/components/button'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@workspace/ui/components/alert-dialog'

import {
    bulkUpdateMediaStatus,
    bulkDeleteMedia,
    bulkAnalyzeMedia,
    bulkRefreshContent,
    bulkGenerateSEOContent,
    bulkGenerateVisitorContent,
    removeMediaFromGroup,
} from '@/lib/actions/gallery-bulk.action'

type BulkActionToolbarProps = {
    groupId: string
    selectedIds: string[]
    onClearSelection: () => void
    onActionComplete: () => void
}

type ConfirmAction = 'delete' | 'remove' | null

type BulkActionResult = {
    success: boolean
    error?: string
    processedCount?: number
    failedCount?: number
}

export function BulkActionToolbar({
    groupId,
    selectedIds,
    onClearSelection,
    onActionComplete,
}: BulkActionToolbarProps) {
    const [isPending, startTransition] = useTransition()
    const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null)

    /**
     * Generic handler for bulk actions with loading state and toast notifications
     */
    const handleBulkAction = (
        action: () => Promise<BulkActionResult>,
        loadingMessage: string,
        successMessage: (processed: number) => string,
        failureMessage: string
    ) => {
        startTransition(async () => {
            const toastId = toast.loading(loadingMessage)
            const result = await action()
            toast.dismiss(toastId)

            if (result.success) {
                const processed = result.processedCount || 0
                const failed = result.failedCount || 0

                if (failed === 0) {
                    toast.success(successMessage(processed))
                } else {
                    toast.warning(
                        `${successMessage(processed)}, ${failed} failed`
                    )
                }
                onActionComplete()
                onClearSelection()
            } else {
                toast.error(result.error || failureMessage)
            }
        })
    }

    const handleUpdateStatus = (status: 'draft' | 'published' | 'archived') => {
        startTransition(async () => {
            const result = await bulkUpdateMediaStatus(selectedIds, status)

            if (result.success) {
                toast.success(
                    `${selectedIds.length} item${selectedIds.length > 1 ? 's' : ''} updated to ${status}`
                )
                onActionComplete()
                onClearSelection()
            } else {
                toast.error(result.error || 'Failed to update status')
            }
        })
    }

    const handleRemoveFromGroup = () => {
        startTransition(async () => {
            const result = await removeMediaFromGroup(groupId, selectedIds)

            if (result.success) {
                toast.success(
                    `${selectedIds.length} item${selectedIds.length > 1 ? 's' : ''} removed from group`
                )
                onActionComplete()
                onClearSelection()
            } else {
                toast.error(result.error || 'Failed to remove from group')
            }
        })
    }

    const handleDelete = () => {
        startTransition(async () => {
            const result = await bulkDeleteMedia(selectedIds)

            if (result.success) {
                toast.success(
                    `${selectedIds.length} item${selectedIds.length > 1 ? 's' : ''} deleted permanently`
                )
                onActionComplete()
                onClearSelection()
            } else {
                toast.error(result.error || 'Failed to delete media')
            }
        })
    }

    const handleAnalyze = () => {
        handleBulkAction(
            () => bulkAnalyzeMedia(selectedIds),
            `Analyzing ${selectedIds.length} item${selectedIds.length > 1 ? 's' : ''}...`,
            (processed) => `Successfully analyzed ${processed} items`,
            'Failed to analyze media'
        )
    }

    const handleRefresh = () => {
        handleBulkAction(
            () => bulkRefreshContent(selectedIds),
            `Refreshing content for ${selectedIds.length} item${selectedIds.length > 1 ? 's' : ''}...`,
            (processed) =>
                `Successfully refreshed content for ${processed} items`,
            'Failed to refresh content'
        )
    }

    const handleGenerateSEO = () => {
        handleBulkAction(
            () => bulkGenerateSEOContent(selectedIds),
            `Generating SEO content for ${selectedIds.length} item${selectedIds.length > 1 ? 's' : ''}...`,
            (processed) =>
                `Successfully generated SEO content for ${processed} items`,
            'Failed to generate SEO content'
        )
    }

    const handleGenerateContent = () => {
        handleBulkAction(
            () => bulkGenerateVisitorContent(selectedIds),
            `Generating content for ${selectedIds.length} item${selectedIds.length > 1 ? 's' : ''}...`,
            (processed) =>
                `Successfully generated content for ${processed} items`,
            'Failed to generate content'
        )
    }

    if (selectedIds.length === 0) return null

    return (
        <>
            <div className='fixed right-0 bottom-0 left-0 z-50 border-t bg-white shadow-2xl'>
                <div className='mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8'>
                    <div className='flex flex-wrap items-center justify-between gap-4'>
                        {/* Selection info */}
                        <div className='flex items-center gap-4'>
                            <p className='text-sm font-semibold'>
                                {selectedIds.length} item
                                {selectedIds.length > 1 ? 's' : ''} selected
                            </p>
                            <Button
                                variant='ghost'
                                size='sm'
                                onClick={onClearSelection}
                                disabled={isPending}
                            >
                                Clear
                            </Button>
                        </div>

                        {/* Action buttons */}
                        <div className='flex flex-wrap items-center gap-2'>
                            {/* Status actions */}
                            <Button
                                variant='outline'
                                size='sm'
                                onClick={() => handleUpdateStatus('published')}
                                disabled={isPending}
                                title='Publish selected'
                            >
                                <Eye className='mr-1.5 h-4 w-4' />
                                Publish
                            </Button>
                            <Button
                                variant='outline'
                                size='sm'
                                onClick={() => handleUpdateStatus('draft')}
                                disabled={isPending}
                                title='Set to draft'
                            >
                                <EyeOff className='mr-1.5 h-4 w-4' />
                                Draft
                            </Button>
                            <Button
                                variant='outline'
                                size='sm'
                                onClick={() => handleUpdateStatus('archived')}
                                disabled={isPending}
                                title='Archive selected'
                            >
                                <Archive className='mr-1.5 h-4 w-4' />
                                Archive
                            </Button>

                            {/* Separator */}
                            <div className='h-6 w-px bg-gray-300' />

                            {/* AI actions */}
                            <Button
                                variant='outline'
                                size='sm'
                                onClick={handleAnalyze}
                                disabled={isPending}
                                title='AI analyze selected images'
                            >
                                <Sparkles className='mr-1.5 h-4 w-4' />
                                Analyze
                            </Button>
                            <Button
                                variant='outline'
                                size='sm'
                                onClick={handleGenerateSEO}
                                disabled={isPending}
                                title='Generate SEO metadata (requires AI analysis)'
                            >
                                <Search className='mr-1.5 h-4 w-4' />
                                SEO
                            </Button>
                            <Button
                                variant='outline'
                                size='sm'
                                onClick={handleGenerateContent}
                                disabled={isPending}
                                title='Generate visitor content (requires AI analysis)'
                            >
                                <FileText className='mr-1.5 h-4 w-4' />
                                Content
                            </Button>
                            <Button
                                variant='outline'
                                size='sm'
                                onClick={handleRefresh}
                                disabled={isPending}
                                title='Refresh both SEO & content (requires AI analysis)'
                            >
                                <RefreshCw className='mr-1.5 h-4 w-4' />
                                Refresh All
                            </Button>

                            {/* Separator */}
                            <div className='h-6 w-px bg-gray-300' />

                            {/* Destructive actions */}
                            <Button
                                variant='outline'
                                size='sm'
                                onClick={() => setConfirmAction('remove')}
                                disabled={isPending}
                                title='Remove from this group'
                            >
                                <X className='mr-1.5 h-4 w-4' />
                                Remove
                            </Button>
                            <Button
                                variant='destructive'
                                size='sm'
                                onClick={() => setConfirmAction('delete')}
                                disabled={isPending}
                                title='Delete permanently'
                            >
                                <Trash2 className='mr-1.5 h-4 w-4' />
                                Delete
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Confirmation dialogs */}
            <AlertDialog
                open={confirmAction === 'remove'}
                onOpenChange={(open) => !open && setConfirmAction(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remove from group?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Remove {selectedIds.length} item
                            {selectedIds.length > 1 ? 's' : ''} from this group?
                            The media will not be deleted, only the association
                            with this group will be removed.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                setConfirmAction(null)
                                handleRemoveFromGroup()
                            }}
                        >
                            Remove
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog
                open={confirmAction === 'delete'}
                onOpenChange={(open) => !open && setConfirmAction(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete permanently?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Permanently delete {selectedIds.length} item
                            {selectedIds.length > 1 ? 's' : ''}? This action
                            cannot be undone. The media will be removed from all
                            groups and deleted from storage.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                setConfirmAction(null)
                                handleDelete()
                            }}
                            className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
                        >
                            Delete Permanently
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
