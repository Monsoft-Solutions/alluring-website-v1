'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'
import { Loader2, Trash2 } from 'lucide-react'

import { Button } from '@workspace/ui/components/button'

import { deleteTag } from '@/lib/actions/tag.action'
import type { TagItem } from '@/lib/types/tag.type'

type DeleteTagButtonProps = {
    tag: TagItem
    onSuccess: () => void
}

export function DeleteTagButton({ tag, onSuccess }: DeleteTagButtonProps) {
    const [isPending, startTransition] = useTransition()

    const handleDelete = () => {
        if (tag.usageCount > 0) {
            toast.error(
                `Cannot delete "${tag.name}" - used by ${tag.usageCount} posts`
            )
            return
        }

        if (!confirm(`Are you sure you want to delete "${tag.name}"?`)) {
            return
        }

        startTransition(async () => {
            const result = await deleteTag(tag.id)
            if (result.success) {
                toast.success('Tag deleted')
                onSuccess()
            } else {
                toast.error(result.error ?? 'Failed to delete tag')
            }
        })
    }

    return (
        <Button
            variant='ghost'
            size='sm'
            onClick={handleDelete}
            disabled={isPending}
        >
            {isPending ? (
                <Loader2 className='h-4 w-4 animate-spin' />
            ) : (
                <Trash2 className='h-4 w-4 text-red-500' />
            )}
        </Button>
    )
}
