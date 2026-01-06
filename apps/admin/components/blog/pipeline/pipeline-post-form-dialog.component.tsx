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
import { Badge } from '@workspace/ui/components/badge'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select'
import { Loader2, X } from 'lucide-react'

import { useCreatePipelinePost } from '@/hooks/use-pipeline.hook'
import type { CreatePipelinePostData } from '@/lib/actions/blog.action'
import { CONTENT_TYPES, PRIORITIES } from '@/lib/constants/blog-ideas.constant'
import { GscKeywordPicker } from '@/components/blog/ideas/gsc-keyword-picker.component'

type PipelinePostFormDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
}

type FormData = {
    title: string
    topic: string
    primaryKeyword: string
    contentType: string
    priority: 'low' | 'medium' | 'high' | 'urgent'
    targetAudience: string
    uniqueAngle: string
}

const initialFormData: FormData = {
    title: '',
    topic: '',
    primaryKeyword: '',
    contentType: '',
    priority: 'medium',
    targetAudience: '',
    uniqueAngle: '',
}

/**
 * Dialog for creating a new post in the content pipeline
 */
export function PipelinePostFormDialog({
    open,
    onOpenChange,
}: PipelinePostFormDialogProps) {
    const createPipelinePost = useCreatePipelinePost()

    const [formData, setFormData] = useState<FormData>(initialFormData)
    const [secondaryKeywords, setSecondaryKeywords] = useState<string[]>([])

    const handleChange = (field: keyof FormData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
    }

    const handleRemoveSecondaryKeyword = (keyword: string) => {
        setSecondaryKeywords((prev) => prev.filter((k) => k !== keyword))
    }

    const resetForm = () => {
        setFormData(initialFormData)
        setSecondaryKeywords([])
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.title?.trim()) {
            toast.error('Title is required')
            return
        }

        // Build the CreatePipelinePostData with planningData JSONB
        const postData: CreatePipelinePostData = {
            title: formData.title.trim(),
            primaryKeyword: formData.primaryKeyword || null,
            secondaryKeywords:
                secondaryKeywords.length > 0 ? secondaryKeywords : null,
            priority: formData.priority,
            planningData: {
                topic: formData.topic || undefined,
                uniqueAngle: formData.uniqueAngle || undefined,
                contentType: formData.contentType || undefined,
                targetAudience: formData.targetAudience || undefined,
            },
        }

        const result = await createPipelinePost.mutateAsync(postData)

        if (result.success) {
            toast.success('Post added to pipeline!')
            onOpenChange(false)
            resetForm()
        } else {
            toast.error(result.error || 'Failed to create post')
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-2xl'>
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>New Pipeline Post</DialogTitle>
                        <DialogDescription>
                            Add a new post to the content pipeline. It will
                            start in the Ideation stage.
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
                                value={formData.topic}
                                onChange={(e) =>
                                    handleChange('topic', e.target.value)
                                }
                            />
                        </div>

                        {/* Primary Keyword */}
                        <div className='space-y-2'>
                            <Label htmlFor='primaryKeyword'>
                                Primary Keyword
                            </Label>
                            <Input
                                id='primaryKeyword'
                                placeholder='e.g., bbl recovery'
                                value={formData.primaryKeyword}
                                onChange={(e) =>
                                    handleChange(
                                        'primaryKeyword',
                                        e.target.value
                                    )
                                }
                            />
                        </div>

                        {/* GSC Keyword Picker */}
                        <GscKeywordPicker
                            primaryKeyword={formData.primaryKeyword}
                            secondaryKeywords={secondaryKeywords}
                            onPrimaryChange={(keyword) =>
                                handleChange('primaryKeyword', keyword)
                            }
                            onSecondaryChange={setSecondaryKeywords}
                        />

                        {/* Secondary Keywords */}
                        {secondaryKeywords.length > 0 && (
                            <div className='space-y-2'>
                                <Label>Secondary Keywords</Label>
                                <div className='flex flex-wrap gap-2'>
                                    {secondaryKeywords.map((keyword) => (
                                        <Badge
                                            key={keyword}
                                            variant='secondary'
                                            className='gap-1 pr-1'
                                        >
                                            {keyword}
                                            <button
                                                type='button'
                                                onClick={() =>
                                                    handleRemoveSecondaryKeyword(
                                                        keyword
                                                    )
                                                }
                                                className='hover:bg-muted rounded p-0.5'
                                                aria-label={`Remove ${keyword}`}
                                            >
                                                <X className='h-3 w-3' />
                                            </button>
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Content Type & Priority */}
                        <div className='grid grid-cols-2 gap-4'>
                            <div className='space-y-2'>
                                <Label>Content Type</Label>
                                <Select
                                    value={formData.contentType}
                                    onValueChange={(value) =>
                                        handleChange('contentType', value)
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
                                        handleChange(
                                            'priority',
                                            value as FormData['priority']
                                        )
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
                                value={formData.targetAudience}
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
                                value={formData.uniqueAngle}
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
                            disabled={createPipelinePost.isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            type='submit'
                            disabled={createPipelinePost.isPending}
                        >
                            {createPipelinePost.isPending && (
                                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                            )}
                            Add to Pipeline
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
