'use client'

/**
 * Analysis Edit Form Component
 *
 * Reusable form for editing AI-generated analysis results.
 * Used in both the post dialog and review page.
 *
 * @module components/social-media/analysis-edit-form
 */
import { useState, useTransition } from 'react'
import { Button } from '@workspace/ui/components/button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select'
import { MultiSelect } from '@workspace/ui/components/multi-select'
import { Label } from '@workspace/ui/components/label'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import type { GalleryMediaAIAnalysis } from '@workspace/shared/schemas/gallery'
import type { GalleryGroupWithSlug } from '@/lib/types/gallery-group.type'
import {
    updateMediaAnalysis,
    type UpdateAnalysisInput,
} from '@/lib/actions/instagram-analysis.action'

type AnalysisEditFormProps = {
    mediaId: string
    currentAnalysis: GalleryMediaAIAnalysis | null
    currentGroupIds?: string[]
    galleryGroups: GalleryGroupWithSlug[]
    onSave?: () => void
    compact?: boolean
}

const BODY_AREAS = [
    { value: 'face', label: 'Face' },
    { value: 'breast', label: 'Breast' },
    { value: 'body', label: 'Body' },
    { value: 'combined', label: 'Combined' },
    { value: 'other', label: 'Other' },
] as const

const BEFORE_AFTER_TYPES = [
    { value: 'before', label: 'Before' },
    { value: 'after', label: 'After' },
    { value: 'side_by_side', label: 'Side-by-Side' },
    { value: 'none', label: 'None (Not B&A)' },
] as const

export function AnalysisEditForm({
    mediaId,
    currentAnalysis,
    currentGroupIds = [],
    galleryGroups,
    onSave,
    compact = false,
}: AnalysisEditFormProps) {
    const [isPending, startTransition] = useTransition()
    const [groupIds, setGroupIds] = useState<string[]>(currentGroupIds)
    const [procedureSlug, setProcedureSlug] = useState<string>(
        currentAnalysis?.detectedProcedure || 'none'
    )
    const [beforeAfterType, setBeforeAfterType] = useState<string>(
        currentAnalysis?.beforeAfterType || 'none'
    )
    const [bodyArea, setBodyArea] = useState<string>(
        currentAnalysis?.bodyArea || 'other'
    )

    const handleSave = () => {
        startTransition(async () => {
            const input: UpdateAnalysisInput = {
                mediaId,
                groupIds: groupIds.length > 0 ? groupIds : null,
                procedureSlug: procedureSlug === 'none' ? null : procedureSlug,
                beforeAfterType:
                    beforeAfterType === 'none'
                        ? null
                        : (beforeAfterType as
                              | 'before'
                              | 'after'
                              | 'side_by_side'),
                bodyArea: bodyArea as
                    | 'face'
                    | 'breast'
                    | 'body'
                    | 'combined'
                    | 'other',
                isBeforeAfter: beforeAfterType !== 'none',
            }

            const result = await updateMediaAnalysis(input)

            if (result.success) {
                toast.success('Analysis updated successfully')
                onSave?.()
            } else {
                toast.error(result.error || 'Failed to update analysis')
            }
        })
    }

    // Get unique procedures from groups
    const procedures = galleryGroups.map((group) => ({
        value: group.slug,
        label: group.name,
    }))

    // Get group options for multi-select
    const groupOptions = galleryGroups.map((group) => ({
        value: group.id,
        label: group.name,
    }))

    return (
        <div className={`space-y-4 ${compact ? 'space-y-2' : ''}`}>
            {/* Gallery Groups (Multi-select) */}
            <div className='space-y-2'>
                <Label className={compact ? 'text-xs' : ''}>
                    Gallery Groups
                </Label>
                <MultiSelect
                    options={groupOptions}
                    defaultValue={groupIds}
                    onValueChange={setGroupIds}
                    placeholder='Select groups'
                    className={compact ? 'h-8 text-xs' : ''}
                    maxCount={2}
                    searchable={true}
                />
            </div>

            {/* Procedure */}
            <div className='space-y-2'>
                <Label
                    htmlFor='procedure-select'
                    className={compact ? 'text-xs' : ''}
                >
                    Procedure
                </Label>
                <Select value={procedureSlug} onValueChange={setProcedureSlug}>
                    <SelectTrigger
                        id='procedure-select'
                        className={compact ? 'h-8 text-xs' : ''}
                    >
                        <SelectValue placeholder='Select procedure' />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value='none'>None</SelectItem>
                        {procedures.map((proc) => (
                            <SelectItem key={proc.value} value={proc.value}>
                                {proc.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Before/After Type */}
            <div className='space-y-2'>
                <Label
                    htmlFor='ba-type-select'
                    className={compact ? 'text-xs' : ''}
                >
                    Before/After Type
                </Label>
                <Select
                    value={beforeAfterType}
                    onValueChange={setBeforeAfterType}
                >
                    <SelectTrigger
                        id='ba-type-select'
                        className={compact ? 'h-8 text-xs' : ''}
                    >
                        <SelectValue placeholder='Select type' />
                    </SelectTrigger>
                    <SelectContent>
                        {BEFORE_AFTER_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                                {type.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Body Area */}
            <div className='space-y-2'>
                <Label
                    htmlFor='body-area-select'
                    className={compact ? 'text-xs' : ''}
                >
                    Body Area
                </Label>
                <Select value={bodyArea} onValueChange={setBodyArea}>
                    <SelectTrigger
                        id='body-area-select'
                        className={compact ? 'h-8 text-xs' : ''}
                    >
                        <SelectValue placeholder='Select area' />
                    </SelectTrigger>
                    <SelectContent>
                        {BODY_AREAS.map((area) => (
                            <SelectItem key={area.value} value={area.value}>
                                {area.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Save Button */}
            <Button
                onClick={handleSave}
                disabled={isPending}
                className='w-full'
                size={compact ? 'sm' : 'default'}
            >
                {isPending ? (
                    <>
                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                        Saving...
                    </>
                ) : (
                    'Save Changes'
                )}
            </Button>
        </div>
    )
}
