'use client'

import { Loader2, Trash2 } from 'lucide-react'
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

type PipelineCardDeleteDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    onConfirm: () => void
    isPending: boolean
    postTitle: string
}

export function PipelineCardDeleteDialog({
    open,
    onOpenChange,
    onConfirm,
    isPending,
    postTitle,
}: PipelineCardDeleteDialogProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete Post</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to delete &quot;{postTitle}&quot;?
                        This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onConfirm}
                        className='bg-red-600 hover:bg-red-700'
                    >
                        {isPending ? (
                            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                        ) : (
                            <Trash2 className='mr-2 h-4 w-4' />
                        )}
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
