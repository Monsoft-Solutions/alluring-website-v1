/**
 * Quick Reply Actions Component
 *
 * Action buttons for editing, toggling, and deleting quick replies.
 *
 * @module app/(dashboard)/chat/quick-replies/quick-reply-actions
 */
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Pencil, Trash2, MoreHorizontal, Loader2 } from 'lucide-react'

import { Button } from '@workspace/ui/components/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@workspace/ui/components/dialog'
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

import { QuickReplyForm } from '@/components/chat/quick-reply-form.component'
import {
    deleteQuickReplyAction,
    toggleQuickReplyAction,
} from '@/lib/actions/quick-replies.action'
import type { ChatQuickReply } from '@workspace/db/schema/chat'

type QuickReplyActionsProps = {
    reply: ChatQuickReply
}

export function QuickReplyActions({ reply }: QuickReplyActionsProps) {
    const router = useRouter()
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const handleToggle = async () => {
        setIsLoading(true)
        try {
            await toggleQuickReplyAction(reply.id, !reply.isActive)
            toast.success(
                reply.isActive
                    ? 'Quick reply deactivated'
                    : 'Quick reply activated'
            )
            router.refresh()
        } catch {
            toast.error('Failed to update quick reply')
        } finally {
            setIsLoading(false)
        }
    }

    const handleDelete = async () => {
        setIsLoading(true)
        try {
            await deleteQuickReplyAction(reply.id)
            toast.success('Quick reply deleted')
            setIsDeleteOpen(false)
            router.refresh()
        } catch {
            toast.error('Failed to delete quick reply')
        } finally {
            setIsLoading(false)
        }
    }

    const handleEditSuccess = () => {
        toast.success('Quick reply updated')
        setIsEditOpen(false)
        router.refresh()
    }

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant='ghost' size='sm' disabled={isLoading}>
                        {isLoading ? (
                            <Loader2 className='h-4 w-4 animate-spin' />
                        ) : (
                            <MoreHorizontal className='h-4 w-4' />
                        )}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end'>
                    <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
                        <Pencil className='mr-2 h-4 w-4' />
                        Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleToggle}>
                        {reply.isActive ? 'Deactivate' : 'Activate'}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        onClick={() => setIsDeleteOpen(true)}
                        className='text-red-600 focus:text-red-600'
                    >
                        <Trash2 className='mr-2 h-4 w-4' />
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Edit Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Quick Reply</DialogTitle>
                        <DialogDescription>
                            Update the quick reply settings
                        </DialogDescription>
                    </DialogHeader>
                    <QuickReplyForm
                        initialData={{
                            id: reply.id,
                            label: reply.label,
                            message: reply.message,
                            category: reply.category as
                                | 'initial'
                                | 'procedures'
                                | 'pricing'
                                | 'scheduling'
                                | 'general'
                                | 'closing',
                            sortOrder: reply.sortOrder,
                            isActive: reply.isActive,
                        }}
                        onSuccess={handleEditSuccess}
                        onCancel={() => setIsEditOpen(false)}
                    />
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Quick Reply</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete &quot;{reply.label}
                            &quot;? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className='bg-red-600 hover:bg-red-700'
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
