/**
 * Pair Card Component
 *
 * Displays a detected before/after pair with AI suggestions and group assignment.
 *
 * @module components/analysis/cards/pair-card
 */
'use client'

import Image from 'next/image'
import { Badge } from '@workspace/ui/components/badge'
import { MultiSelect } from '@workspace/ui/components/multi-select'
import { ArrowRight } from 'lucide-react'

import type { BulkAnalysisResult } from '@workspace/shared/schemas/analysis'
import type { GalleryGroupForAI } from '@/lib/queries/gallery.query'

type PairCardProps = {
    pair: BulkAnalysisResult['detectedPairs'][number]
    galleryGroups: GalleryGroupForAI[]
    selectedGroupIds: string[]
    onGroupIdsChange: (pairId: string, groupIds: string[]) => void
    canEdit: boolean
}

export function PairCard({
    pair,
    galleryGroups,
    selectedGroupIds,
    onGroupIdsChange,
    canEdit,
}: PairCardProps) {
    const isSideBySide = pair.type === 'side_by_side'

    // Get AI primary suggestion (highest confidence)
    const aiPrimarySuggestion =
        pair.aiSuggestedGroups.length > 0 ? pair.aiSuggestedGroups[0] : null

    // Check if user has AI-suggested procedure selected
    const isUsingAISuggestion =
        aiPrimarySuggestion &&
        selectedGroupIds.includes(aiPrimarySuggestion.groupId)

    // Convert groups to MultiSelect options
    const groupOptions = galleryGroups.map((group) => ({
        value: group.id,
        label: group.name,
    }))

    return (
        <div className='space-y-3 rounded-lg border p-3'>
            <div className='flex items-center justify-between'>
                <Badge variant={isSideBySide ? 'default' : 'secondary'}>
                    {isSideBySide ? 'Side-by-Side' : 'Matched Pair'}
                </Badge>
                <span className='text-muted-foreground text-xs'>
                    {Math.round(pair.confidence * 100)}% match
                </span>
            </div>

            <div className='flex items-center gap-2'>
                <div className='relative aspect-square w-1/2 overflow-hidden rounded-md'>
                    <Image
                        src={pair.beforeMediaUrl}
                        alt='Before'
                        fill
                        className='object-cover'
                        sizes='100px'
                    />
                    <Badge
                        className='absolute bottom-1 left-1'
                        variant='secondary'
                    >
                        Before
                    </Badge>
                </div>

                {!isSideBySide && (
                    <>
                        <ArrowRight className='text-muted-foreground h-4 w-4 shrink-0' />
                        <div className='relative aspect-square w-1/2 overflow-hidden rounded-md'>
                            <Image
                                src={pair.afterMediaUrl}
                                alt='After'
                                fill
                                className='object-cover'
                                sizes='100px'
                            />
                            <Badge className='absolute bottom-1 left-1'>
                                After
                            </Badge>
                        </div>
                    </>
                )}
            </div>

            {/* AI Suggestions */}
            {pair.aiSuggestedGroups.length > 0 && (
                <div className='space-y-1'>
                    <p className='text-muted-foreground text-xs font-medium'>
                        AI suggests:
                    </p>
                    <div className='flex flex-wrap gap-1'>
                        {pair.aiSuggestedGroups
                            .slice(0, 2)
                            .map((suggestion) => (
                                <Badge
                                    key={suggestion.groupId}
                                    variant='outline'
                                    className='text-xs'
                                >
                                    {suggestion.name} (
                                    {Math.round(suggestion.confidence * 100)}%)
                                </Badge>
                            ))}
                    </div>
                </div>
            )}

            {/* Group Assignment */}
            <div className='space-y-1'>
                <div className='flex items-center gap-2'>
                    <p className='text-xs font-medium'>Groups:</p>
                    {isUsingAISuggestion && (
                        <Badge variant='secondary' className='text-xs'>
                            ✨ AI suggested
                        </Badge>
                    )}
                </div>
                <MultiSelect
                    options={groupOptions}
                    value={selectedGroupIds}
                    onValueChange={(groupIds: string[]) =>
                        onGroupIdsChange(pair.id, groupIds)
                    }
                    placeholder='Select groups'
                    className='h-8 text-xs'
                    maxCount={2}
                    searchable={true}
                    disabled={!canEdit}
                />
            </div>
        </div>
    )
}
