'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@workspace/ui/components/dialog'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { Label } from '@workspace/ui/components/label'
import { Textarea } from '@workspace/ui/components/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select'
import { Loader2 } from 'lucide-react'

import { useCreateIdea } from '@/hooks/use-ideas.hook'
import type { BlogIdeaFormData } from '@/lib/actions/idea.action'
import { CONTENT_TYPES, PRIORITIES } from '@/lib/constants/blog-ideas.constant'

type IdeaFormDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
}

/**
 * Dialog for creating a new blog idea
 */
export function IdeaFormDialog({ open, onOpenChange }: IdeaFormDialogProps) {
    const createIdea = useCreateIdea()

    const [formData, setFormData] = useState<Partial<BlogIdeaFormData>>({
        title: '',
        topic: '',
        primaryKeyword: '',
        contentType: undefined,
        priority: 'medium',
        targetAudience: '',
        uniqueAngle: '',
    })

    const handleChange = (
        field: keyof BlogIdeaFormData,
        value: string | null
    ) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.title?.trim()) {
            toast.error('Title is required')
            return
        }

        const result = await createIdea.mutateAsync({
            title: formData.title,
            topic: formData.topic || null,
            primaryKeyword: formData.primaryKeyword || null,
            contentType:
                formData.contentType as BlogIdeaFormData['contentType'],
            priority:
                (formData.priority as BlogIdeaFormData['priority']) || 'medium',
            targetAudience: formData.targetAudience || null,
            uniqueAngle: formData.uniqueAngle || null,
        })

        if (result.success) {
            toast.success('Idea created successfully')
            onOpenChange(false)
            // Reset form
            setFormData({
                title: '',
                topic: '',
                primaryKeyword: '',
                contentType: undefined,
                priority: 'medium',
                targetAudience: '',
                uniqueAngle: '',
            })
        } else {
            toast.error(result.error || 'Failed to create idea')
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='sm:max-w-lg'>
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>New Blog Idea</DialogTitle>
                        <DialogDescription>
                            Create a new idea for your content pipeline. You can
                            expand on it later.
                        </DialogDescription>
                    </DialogHeader>

                    <div className='mt-6 space-y-4'>
                        {/* Title */}
                        <div className='space-y-2'>
                            <Label htmlFor='title'>
                                Title <span className='text-red-500'>*</span>
                            </Label>
                            <Input
                                id='title'
                                placeholder='e.g., BBL Recovery Guide: Week by Week'
                                value={formData.title}
                                onChange={(e) =>
                                    handleChange('title', e.target.value)
                                }
                                autoFocus
                            />
                        </div>

                        {/* Topic */}
                        <div className='space-y-2'>
                            <Label htmlFor='topic'>Topic</Label>
                            <Input
                                id='topic'
                                placeholder='e.g., Brazilian Butt Lift Recovery'
                                value={formData.topic ?? ''}
                                onChange={(e) =>
                                    handleChange('topic', e.target.value)
                                }
                            />
                        </div>

                        {/* Primary Keyword */}
                        <div className='space-y-2'>
                            <Label htmlFor='primaryKeyword'>
                                Target Keyword
                            </Label>
                            <Input
                                id='primaryKeyword'
                                placeholder='e.g., bbl recovery'
                                value={formData.primaryKeyword ?? ''}
                                onChange={(e) =>
                                    handleChange(
                                        'primaryKeyword',
                                        e.target.value
                                    )
                                }
                            />
                        </div>

                        {/* Content Type & Priority */}
                        <div className='grid grid-cols-2 gap-4'>
                            <div className='space-y-2'>
                                <Label>Content Type</Label>
                                <Select
                                    value={formData.contentType ?? ''}
                                    onValueChange={(value) =>
                                        handleChange(
                                            'contentType',
                                            value || null
                                        )
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder='Select type' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {CONTENT_TYPES.map((type) => (
                                            <SelectItem
                                                key={type.value}
                                                value={type.value}
                                            >
                                                {type.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className='space-y-2'>
                                <Label>Priority</Label>
                                <Select
                                    value={formData.priority}
                                    onValueChange={(value) =>
                                        handleChange('priority', value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder='Select priority' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {PRIORITIES.map((priority) => (
                                            <SelectItem
                                                key={priority.value}
                                                value={priority.value}
                                            >
                                                {priority.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Target Audience */}
                        <div className='space-y-2'>
                            <Label htmlFor='targetAudience'>
                                Target Audience
                            </Label>
                            <Input
                                id='targetAudience'
                                placeholder='e.g., Women 25-45 considering BBL surgery'
                                value={formData.targetAudience ?? ''}
                                onChange={(e) =>
                                    handleChange(
                                        'targetAudience',
                                        e.target.value
                                    )
                                }
                            />
                        </div>

                        {/* Unique Angle */}
                        <div className='space-y-2'>
                            <Label htmlFor='uniqueAngle'>
                                Unique Angle (What makes this different?)
                            </Label>
                            <Textarea
                                id='uniqueAngle'
                                placeholder='e.g., First-person perspective from a nurse who has helped 500+ patients recover'
                                value={formData.uniqueAngle ?? ''}
                                onChange={(e) =>
                                    handleChange('uniqueAngle', e.target.value)
                                }
                                rows={2}
                            />
                        </div>
                    </div>

                    <DialogFooter className='mt-6'>
                        <Button
                            type='button'
                            variant='outline'
                            onClick={() => onOpenChange(false)}
                            disabled={createIdea.isPending}
                        >
                            Cancel
                        </Button>
                        <Button type='submit' disabled={createIdea.isPending}>
                            {createIdea.isPending && (
                                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                            )}
                            Create Idea
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
