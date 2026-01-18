'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { Loader2, Trash2 } from 'lucide-react'
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
    AlertDialogTrigger,
} from '@workspace/ui/components/alert-dialog'

import { deleteTestimonial } from '@/lib/actions/testimonial.action'

interface DeleteTestimonialButtonProps {
    testimonialId: string
    patientName: string
}

export function DeleteTestimonialButton({
    testimonialId,
    patientName,
}: DeleteTestimonialButtonProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [open, setOpen] = useState(false)

    const handleDelete = () => {
        startTransition(async () => {
            const result = await deleteTestimonial(testimonialId)

            if (result.success) {
                toast.success('Testimonial deleted successfully')
                router.push('/testimonials')
            } else {
                toast.error(result.error ?? 'Failed to delete testimonial')
                setOpen(false)
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
                    <AlertDialogTitle>Delete Testimonial</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to delete the testimonial from{' '}
                        <strong>{patientName}</strong>? This action cannot be
                        undone.
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
