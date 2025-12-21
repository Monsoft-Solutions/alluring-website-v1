'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Trash2, Loader2 } from 'lucide-react'

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
    AlertDialogTrigger,
} from '@workspace/ui/components/alert-dialog'

import { deleteGalleryMedia } from '@/lib/actions/gallery.action'

type DeleteMediaButtonProps = {
    id: string
    title: string
}

export function DeleteMediaButton({ id, title }: DeleteMediaButtonProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [open, setOpen] = useState(false)

    const handleDelete = () => {
        startTransition(async () => {
            try {
                const result = await deleteGalleryMedia(id)
                if (result.success) {
                    toast.success('Media deleted')
                    router.push('/gallery/media')
                    router.refresh()
                } else {
                    toast.error(result.error ?? 'Failed to delete media')
                }
            } catch {
                toast.error('Failed to delete media')
            }
        })
    }

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button variant='destructive' size='sm'>
                    <Trash2 className='mr-2 h-4 w-4' />
                    Delete
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete Media</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to delete &quot;{title}&quot;?
                        This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isPending}>
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        disabled={isPending}
                        className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
                    >
                        {isPending && (
                            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                        )}
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
