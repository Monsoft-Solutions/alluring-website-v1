'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'
import { Loader2, Trash2 } from 'lucide-react'

import { Button } from '@workspace/ui/components/button'

import { deleteCategory } from '@/lib/actions/category.action'
import type { Category } from '@/lib/types/category.type'

type DeleteCategoryButtonProps = {
    category: Category
    onSuccess: () => void
}

export function DeleteCategoryButton({
    category,
    onSuccess,
}: DeleteCategoryButtonProps) {
    const [isPending, startTransition] = useTransition()

    const handleDelete = () => {
        if (category.postCount > 0) {
            toast.error(
                `Cannot delete "${category.name}" - used by ${category.postCount} posts`
            )
            return
        }

        if (!confirm(`Are you sure you want to delete "${category.name}"?`)) {
            return
        }

        startTransition(async () => {
            const result = await deleteCategory(category.id)
            if (result.success) {
                toast.success('Category deleted')
                onSuccess()
            } else {
                toast.error(result.error ?? 'Failed to delete category')
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
