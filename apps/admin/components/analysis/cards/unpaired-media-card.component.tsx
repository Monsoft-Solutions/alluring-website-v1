/**
 * Unpaired Media Card Component
 *
 * Displays an unpaired before/after image with AI suggestions and group assignment.
 *
 * @module components/analysis/cards/unpaired-media-card
 */
'use client'

import Image from 'next/image'
import { Badge } from '@workspace/ui/components/badge'
import { MultiSelect } from '@workspace/ui/components/multi-select'

import type { BulkAnalysisResult } from '@workspace/shared/schemas/analysis'
import type { GalleryGroupForAI } from '@/lib/queries/gallery.query'

type UnpairedMediaCardProps = {
    media: BulkAnalysisResult['unpairedMedia'][number]
    galleryGroups: GalleryGroupForAI[]
    selectedGroupIds: string[]
    onGroupIdsChange: (mediaId: string, groupIds: string[]) => void
    canEdit: boolean
}

export function UnpairedMediaCard({
    media,
    galleryGroups,
    selectedGroupIds,
    onGroupIdsChange,
    canEdit,
}: UnpairedMediaCardProps) {
    // Get AI primary suggestion (highest confidence)
    const aiPrimarySuggestion =
        media.aiSuggestedGroups.length > 0 ? media.aiSuggestedGroups[0] : null

    // Convert groups to MultiSelect options
    const groupOptions = galleryGroups.map((group) => ({
        value: group.id,
        label: group.name,
    }))

    return (
        <div className='space-y-2'>
            <div className='relative aspect-square overflow-hidden rounded-lg border'>
                <Image
                    src={media.mediaUrl}
                    alt='Unpaired media'
                    fill
                    className='object-cover'
                    sizes='150px'
                />
                <Badge
                    className='absolute top-1 left-1'
                    variant={
                        media.beforeAfterType === 'before'
                            ? 'secondary'
                            : 'default'
                    }
                >
                    {media.beforeAfterType}
                </Badge>
            </div>

            {/* AI Suggestion */}
            {aiPrimarySuggestion && (
                <p className='text-muted-foreground text-xs'>
                    AI: {aiPrimarySuggestion.name} (
                    {Math.round(aiPrimarySuggestion.confidence * 100)}%)
                </p>
            )}

            {/* Group Assignment */}
            <MultiSelect
                options={groupOptions}
                defaultValue={selectedGroupIds}
                onValueChange={(groupIds: string[]) =>
                    onGroupIdsChange(media.mediaId, groupIds)
                }
                placeholder='Select groups'
                className='h-7 text-xs'
                maxCount={2}
                searchable={true}
                disabled={!canEdit}
            />
        </div>
    )
}
