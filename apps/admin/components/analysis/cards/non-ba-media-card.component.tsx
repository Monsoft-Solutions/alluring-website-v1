/**
 * Non-BA Media Card Component
 *
 * Displays non-before/after media with selection, AI suggestions, and group assignment.
 *
 * @module components/analysis/cards/non-ba-media-card
 */
'use client'

import Image from 'next/image'
import { Badge } from '@workspace/ui/components/badge'
import { Checkbox } from '@workspace/ui/components/checkbox'
import { MultiSelect } from '@workspace/ui/components/multi-select'

import type { BulkAnalysisResult } from '@workspace/shared/schemas/analysis'
import type { GalleryGroupForAI } from '@/lib/types/gallery/gallery-group.type'

type NonBAMediaCardProps = {
    media: BulkAnalysisResult['nonBAMedia'][number]
    galleryGroups: GalleryGroupForAI[]
    selectedGroupIds: string[]
    onGroupIdsChange: (mediaId: string, groupIds: string[]) => void
    isSelected: boolean
    onSelectedChange: (mediaId: string, selected: boolean) => void
    canEdit: boolean
}

export function NonBAMediaCard({
    media,
    galleryGroups,
    selectedGroupIds,
    onGroupIdsChange,
    isSelected,
    onSelectedChange,
    canEdit,
}: NonBAMediaCardProps) {
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
                    alt='Non-BA media'
                    fill
                    className='object-cover'
                    sizes='150px'
                />
                {/* Selection checkbox */}
                {canEdit && (
                    <div className='absolute top-1 left-1'>
                        <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) =>
                                onSelectedChange(
                                    media.mediaId,
                                    checked === true
                                )
                            }
                            className='bg-white'
                        />
                    </div>
                )}
                <Badge className='absolute top-1 right-1' variant='outline'>
                    {media.contentType}
                </Badge>
                {media.isSideBySide && (
                    <Badge
                        className='absolute right-1 bottom-1'
                        variant='default'
                    >
                        Side-by-Side
                    </Badge>
                )}
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
                value={selectedGroupIds}
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
