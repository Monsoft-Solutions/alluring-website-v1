'use client'

import { useMemo } from 'react'
import { Tag, X } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { Label } from '@workspace/ui/components/label'
import { Badge } from '@workspace/ui/components/badge'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select'
import { ScrollArea } from '@workspace/ui/components/scroll-area'
import { TabsContent } from '@workspace/ui/components/tabs'

import type { PipelineStatus } from '@/lib/queries/pipeline.query'
import type { BlogPostPriority } from '@/lib/types/blog/blog-action.type'
import type { DetailsTabProps } from './pipeline-edit-dialog.type'
import { PRIORITY_OPTIONS, STATUS_OPTIONS } from './pipeline-edit-dialog.type'

/**
 * Details tab for the pipeline post edit dialog
 * Handles slug, status, priority, and keywords
 */
export function DetailsTab({
    slug,
    setSlug,
    status,
    setStatus,
    priority,
    setPriority,
    primaryKeyword,
    setPrimaryKeyword,
    secondaryKeywords,
    secondaryInput,
    setSecondaryInput,
    handleAddSecondaryKeyword,
    handleRemoveSecondaryKeyword,
    isProcessing,
    hasError,
    processingError,
    markDirty,
}: DetailsTabProps) {
    const priorityConfig = useMemo(
        () => PRIORITY_OPTIONS.find((p) => p.value === priority),
        [priority]
    )
    const statusConfig = useMemo(
        () => STATUS_OPTIONS.find((s) => s.value === status),
        [status]
    )

    return (
        <TabsContent value='details' className='m-0 h-full'>
            <ScrollArea className='h-full'>
                <div className='grid gap-6 p-6 md:grid-cols-2'>
                    {/* Left Column */}
                    <div className='space-y-4'>
                        {/* Slug */}
                        <div>
                            <Label className='text-xs font-medium text-stone-500'>
                                Slug
                            </Label>
                            <Input
                                value={slug}
                                onChange={(e) => {
                                    setSlug(e.target.value)
                                    markDirty()
                                }}
                                placeholder='post-url-slug'
                                className='mt-1'
                            />
                        </div>

                        {/* Status */}
                        <div>
                            <Label className='text-xs font-medium text-stone-500'>
                                Status
                            </Label>
                            <Select
                                value={status}
                                onValueChange={(v) => {
                                    setStatus(v as PipelineStatus)
                                    markDirty()
                                }}
                                disabled={isProcessing}
                            >
                                <SelectTrigger className='mt-1'>
                                    <SelectValue>
                                        {statusConfig && (
                                            <Badge
                                                variant='secondary'
                                                className={
                                                    statusConfig.className
                                                }
                                            >
                                                {statusConfig.label}
                                            </Badge>
                                        )}
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    {STATUS_OPTIONS.map((option) => (
                                        <SelectItem
                                            key={option.value}
                                            value={option.value}
                                        >
                                            <Badge
                                                variant='secondary'
                                                className={option.className}
                                            >
                                                {option.label}
                                            </Badge>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Priority */}
                        <div>
                            <Label className='text-xs font-medium text-stone-500'>
                                Priority
                            </Label>
                            <Select
                                value={priority}
                                onValueChange={(v) => {
                                    setPriority(v as BlogPostPriority)
                                    markDirty()
                                }}
                            >
                                <SelectTrigger className='mt-1'>
                                    <SelectValue>
                                        {priorityConfig && (
                                            <Badge
                                                variant='secondary'
                                                className={
                                                    priorityConfig.className
                                                }
                                            >
                                                {priorityConfig.label}
                                            </Badge>
                                        )}
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    {PRIORITY_OPTIONS.map((option) => (
                                        <SelectItem
                                            key={option.value}
                                            value={option.value}
                                        >
                                            <Badge
                                                variant='secondary'
                                                className={option.className}
                                            >
                                                {option.label}
                                            </Badge>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Right Column - Keywords */}
                    <div className='space-y-4'>
                        {/* Primary Keyword */}
                        <div>
                            <Label className='flex items-center gap-1 text-xs font-medium text-stone-500'>
                                <Tag className='h-3 w-3' />
                                Primary Keyword
                            </Label>
                            <Input
                                value={primaryKeyword}
                                onChange={(e) => {
                                    setPrimaryKeyword(e.target.value)
                                    markDirty()
                                }}
                                placeholder='main target keyword'
                                className='mt-1'
                            />
                        </div>

                        {/* Secondary Keywords */}
                        <div>
                            <Label className='text-xs font-medium text-stone-500'>
                                Secondary Keywords
                            </Label>
                            <div className='mt-1 flex gap-2'>
                                <Input
                                    value={secondaryInput}
                                    onChange={(e) =>
                                        setSecondaryInput(e.target.value)
                                    }
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault()
                                            handleAddSecondaryKeyword()
                                        }
                                    }}
                                    placeholder='supporting keyword'
                                />
                                <Button
                                    type='button'
                                    variant='outline'
                                    onClick={handleAddSecondaryKeyword}
                                    disabled={!secondaryInput.trim()}
                                >
                                    Add
                                </Button>
                            </div>
                            {secondaryKeywords.length > 0 && (
                                <div className='mt-2 flex flex-wrap gap-2'>
                                    {secondaryKeywords.map((kw) => (
                                        <Badge
                                            key={kw}
                                            variant='secondary'
                                            className='gap-1 pr-1'
                                        >
                                            {kw}
                                            <button
                                                type='button'
                                                onClick={() =>
                                                    handleRemoveSecondaryKeyword(
                                                        kw
                                                    )
                                                }
                                                className='hover:bg-muted ml-1 rounded-sm p-0.5'
                                            >
                                                <X className='h-3 w-3' />
                                            </button>
                                        </Badge>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Error message */}
                    {hasError && processingError && (
                        <div className='col-span-2 rounded-lg border border-red-200 bg-red-50 p-3'>
                            <p className='text-xs font-medium text-red-800'>
                                Processing Error
                            </p>
                            <p className='mt-1 text-xs text-red-700'>
                                {processingError}
                            </p>
                        </div>
                    )}
                </div>
            </ScrollArea>
        </TabsContent>
    )
}
