/**
 * Quick Reply Form Component
 *
 * Form for creating and editing quick replies in the admin panel.
 *
 * @module components/chat/quick-reply-form
 */
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'

import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { Label } from '@workspace/ui/components/label'
import { Textarea } from '@workspace/ui/components/textarea'
import { Switch } from '@workspace/ui/components/switch'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select'
import {
    createQuickReplyAction,
    updateQuickReplyAction,
    type QuickReplyFormData,
} from '@/lib/actions/quick-replies.action'
import { QUICK_REPLY_CATEGORIES } from '@workspace/db/schema/chat'

const formSchema = z.object({
    label: z.string().min(1, 'Label is required').max(100),
    message: z.string().min(1, 'Message is required').max(500),
    category: z.enum(QUICK_REPLY_CATEGORIES),
    sortOrder: z.number().int().min(0),
    isActive: z.boolean(),
})

type FormValues = z.infer<typeof formSchema>

type QuickReplyFormProps = {
    /** Initial data for editing */
    initialData?: QuickReplyFormData & { id: string }
    /** Callback when form is submitted successfully */
    onSuccess?: () => void
    /** Callback to close the form */
    onCancel?: () => void
}

const CATEGORY_LABELS: Record<string, string> = {
    initial: 'Initial (Start of conversation)',
    procedures: 'Procedures',
    pricing: 'Pricing & Financing',
    scheduling: 'Scheduling',
    general: 'General',
    closing: 'Closing',
}

export function QuickReplyForm({
    initialData,
    onSuccess,
    onCancel,
}: QuickReplyFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const isEditing = !!initialData?.id

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            label: initialData?.label ?? '',
            message: initialData?.message ?? '',
            category: initialData?.category ?? 'general',
            sortOrder: initialData?.sortOrder ?? 0,
            isActive: initialData?.isActive ?? true,
        },
    })

    const handleSubmit = async (data: FormValues) => {
        setIsSubmitting(true)
        setError(null)

        try {
            const result = isEditing
                ? await updateQuickReplyAction(initialData.id, data)
                : await createQuickReplyAction(data)

            if (result.success) {
                onSuccess?.()
            } else {
                setError(result.error ?? 'An error occurred')
            }
        } catch {
            setError('An unexpected error occurred')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-4'>
            {error && (
                <div className='rounded-lg bg-red-50 p-3 text-sm text-red-600'>
                    {error}
                </div>
            )}

            <div className='space-y-2'>
                <Label htmlFor='label'>Button Label</Label>
                <Input
                    id='label'
                    placeholder='e.g., Learn About Procedures'
                    {...form.register('label')}
                />
                {form.formState.errors.label && (
                    <p className='text-sm text-red-500'>
                        {form.formState.errors.label.message}
                    </p>
                )}
            </div>

            <div className='space-y-2'>
                <Label htmlFor='message'>Message to Send</Label>
                <Textarea
                    id='message'
                    placeholder="e.g., I'd like to learn about your procedures"
                    rows={3}
                    {...form.register('message')}
                />
                {form.formState.errors.message && (
                    <p className='text-sm text-red-500'>
                        {form.formState.errors.message.message}
                    </p>
                )}
            </div>

            <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                    <Label htmlFor='category'>Category</Label>
                    <Select
                        value={form.watch('category')}
                        onValueChange={(value) =>
                            form.setValue(
                                'category',
                                value as (typeof QUICK_REPLY_CATEGORIES)[number]
                            )
                        }
                    >
                        <SelectTrigger>
                            <SelectValue placeholder='Select category' />
                        </SelectTrigger>
                        <SelectContent>
                            {QUICK_REPLY_CATEGORIES.map((category) => (
                                <SelectItem key={category} value={category}>
                                    {CATEGORY_LABELS[category] ?? category}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className='space-y-2'>
                    <Label htmlFor='sortOrder'>Sort Order</Label>
                    <Input
                        id='sortOrder'
                        type='number'
                        min={0}
                        {...form.register('sortOrder', { valueAsNumber: true })}
                    />
                </div>
            </div>

            <div className='flex items-center gap-2'>
                <Switch
                    id='isActive'
                    checked={form.watch('isActive')}
                    onCheckedChange={(checked) =>
                        form.setValue('isActive', checked)
                    }
                />
                <Label htmlFor='isActive'>Active</Label>
            </div>

            <div className='flex justify-end gap-2 pt-4'>
                {onCancel && (
                    <Button
                        type='button'
                        variant='outline'
                        onClick={onCancel}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                )}
                <Button type='submit' disabled={isSubmitting}>
                    {isSubmitting && (
                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    )}
                    {isEditing ? 'Update' : 'Create'} Quick Reply
                </Button>
            </div>
        </form>
    )
}
