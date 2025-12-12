/**
 * Analysis Result Component
 *
 * Reusable component for displaying and editing analysis results.
 * Shows detected pairs, unpaired media, and non-B&A content with group assignments.
 *
 * @module components/analysis/analysis-result
 */
'use client'

import { useState } from 'react'
import { Button } from '@workspace/ui/components/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card'
import { Badge } from '@workspace/ui/components/badge'
import { Check, AlertCircle } from 'lucide-react'

import type { BulkAnalysisResult } from '@workspace/shared/schemas/analysis'
import type { GalleryGroupForAI } from '@/lib/queries/gallery.query'
import { AnalysisStats } from './analysis-stats.component'
import { PairCard } from './cards/pair-card.component'
import { UnpairedMediaCard } from './cards/unpaired-media-card.component'
import { NonBAMediaCard } from './cards/non-ba-media-card.component'

type AnalysisResultProps = {
    analysisResult: BulkAnalysisResult
    galleryGroups: GalleryGroupForAI[]
    onApply: (data: {
        pairGroupAssignments: Map<string, string[]>
        unpairedGroupAssignments: Map<string, string[]>
        nonBAGroupAssignments: Map<string, string[]>
        selectedNonBAMediaIds: Set<string>
    }) => void
    isApplying?: boolean
    canEdit?: boolean
}

export function AnalysisResult({
    analysisResult,
    galleryGroups,
    onApply,
    isApplying = false,
    canEdit = true,
}: AnalysisResultProps) {
    // Group assignment state for all media types
    const [pairGroupAssignments, setPairGroupAssignments] = useState<
        Map<string, string[]>
    >(() => {
        const assignments = new Map<string, string[]>()
        analysisResult.detectedPairs.forEach((pair) => {
            const groupIds = pair.aiSuggestedGroups.map((g) => g.groupId)
            assignments.set(pair.id, groupIds)
        })
        return assignments
    })

    const [unpairedGroupAssignments, setUnpairedGroupAssignments] = useState<
        Map<string, string[]>
    >(() => {
        const assignments = new Map<string, string[]>()
        analysisResult.unpairedMedia.forEach((media) => {
            const groupIds = media.aiSuggestedGroups.map((g) => g.groupId)
            assignments.set(media.mediaId, groupIds)
        })
        return assignments
    })

    const [nonBAGroupAssignments, setNonBAGroupAssignments] = useState<
        Map<string, string[]>
    >(() => {
        const assignments = new Map<string, string[]>()
        analysisResult.nonBAMedia.forEach((media) => {
            const groupIds = media.aiSuggestedGroups.map((g) => g.groupId)
            assignments.set(media.mediaId, groupIds)
        })
        return assignments
    })

    // Track which non-BA items are selected for applying
    const [selectedNonBAMediaIds, setSelectedNonBAMediaIds] = useState<
        Set<string>
    >(() => {
        const nonBAMediaIds = analysisResult.nonBAMedia.map((m) => m.mediaId)
        return new Set(nonBAMediaIds)
    })

    const handleApply = () => {
        onApply({
            pairGroupAssignments,
            unpairedGroupAssignments,
            nonBAGroupAssignments,
            selectedNonBAMediaIds,
        })
    }

    return (
        <div className='space-y-6'>
            {/* Stats Summary */}
            <AnalysisStats analysisResult={analysisResult} />

            {/* Detected Pairs */}
            {analysisResult.detectedPairs.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className='flex items-center gap-2'>
                            <Check className='h-5 w-5 text-green-600' />
                            Detected B&A Pairs (
                            {analysisResult.detectedPairs.length})
                        </CardTitle>
                        <CardDescription>
                            These pairs will be created as Before/After entries
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
                            {analysisResult.detectedPairs.map((pair) => (
                                <PairCard
                                    key={pair.id}
                                    pair={pair}
                                    galleryGroups={galleryGroups}
                                    selectedGroupIds={
                                        pairGroupAssignments.get(pair.id) || []
                                    }
                                    onGroupIdsChange={(pairId, groupIds) => {
                                        const newAssignments = new Map(
                                            pairGroupAssignments
                                        )
                                        newAssignments.set(pairId, groupIds)
                                        setPairGroupAssignments(newAssignments)
                                    }}
                                    canEdit={canEdit}
                                />
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Unpaired Media */}
            {analysisResult.unpairedMedia.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className='flex items-center gap-2'>
                            <AlertCircle className='h-5 w-5 text-yellow-600' />
                            Unpaired Media (
                            {analysisResult.unpairedMedia.length})
                        </CardTitle>
                        <CardDescription>
                            These images were detected as before/after but
                            couldn&apos;t be matched. Assign to a gallery group.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className='grid gap-4 md:grid-cols-4 lg:grid-cols-6'>
                            {analysisResult.unpairedMedia.map((media) => (
                                <UnpairedMediaCard
                                    key={media.mediaId}
                                    media={media}
                                    galleryGroups={galleryGroups}
                                    selectedGroupIds={
                                        unpairedGroupAssignments.get(
                                            media.mediaId
                                        ) || []
                                    }
                                    onGroupIdsChange={(mediaId, groupIds) => {
                                        const newAssignments = new Map(
                                            unpairedGroupAssignments
                                        )
                                        newAssignments.set(mediaId, groupIds)
                                        setUnpairedGroupAssignments(
                                            newAssignments
                                        )
                                    }}
                                    canEdit={canEdit}
                                />
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Non-BA Media */}
            {analysisResult.nonBAMedia.length > 0 && (
                <Card>
                    <CardHeader>
                        <div className='flex items-center justify-between'>
                            <div>
                                <CardTitle>
                                    Non-Before/After Content (
                                    {analysisResult.nonBAMedia.length})
                                </CardTitle>
                                <CardDescription>
                                    Assign to gallery groups based on detected
                                    procedure
                                </CardDescription>
                            </div>
                            {canEdit && (
                                <div className='flex items-center gap-2'>
                                    <Button
                                        variant='outline'
                                        size='sm'
                                        onClick={() => {
                                            const allIds =
                                                analysisResult.nonBAMedia.map(
                                                    (m) => m.mediaId
                                                )
                                            setSelectedNonBAMediaIds(
                                                new Set(allIds)
                                            )
                                        }}
                                    >
                                        Select All
                                    </Button>
                                    <Button
                                        variant='ghost'
                                        size='sm'
                                        onClick={() =>
                                            setSelectedNonBAMediaIds(new Set())
                                        }
                                    >
                                        Deselect All
                                    </Button>
                                    <Badge variant='outline'>
                                        {selectedNonBAMediaIds.size} selected
                                    </Badge>
                                </div>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className='grid gap-4 md:grid-cols-4 lg:grid-cols-6'>
                            {analysisResult.nonBAMedia.map((media) => (
                                <NonBAMediaCard
                                    key={media.mediaId}
                                    media={media}
                                    galleryGroups={galleryGroups}
                                    selectedGroupIds={
                                        nonBAGroupAssignments.get(
                                            media.mediaId
                                        ) || []
                                    }
                                    onGroupIdsChange={(mediaId, groupIds) => {
                                        const newAssignments = new Map(
                                            nonBAGroupAssignments
                                        )
                                        newAssignments.set(mediaId, groupIds)
                                        setNonBAGroupAssignments(newAssignments)
                                    }}
                                    isSelected={selectedNonBAMediaIds.has(
                                        media.mediaId
                                    )}
                                    onSelectedChange={(mediaId, selected) => {
                                        const newSelected = new Set(
                                            selectedNonBAMediaIds
                                        )
                                        if (selected) {
                                            newSelected.add(mediaId)
                                        } else {
                                            newSelected.delete(mediaId)
                                        }
                                        setSelectedNonBAMediaIds(newSelected)
                                    }}
                                    canEdit={canEdit}
                                />
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Apply Button */}
            {canEdit && (
                <div className='flex justify-end'>
                    <Button
                        onClick={handleApply}
                        disabled={
                            isApplying ||
                            (analysisResult.detectedPairs.length === 0 &&
                                analysisResult.unpairedMedia.length === 0 &&
                                selectedNonBAMediaIds.size === 0)
                        }
                    >
                        <Check className='mr-2 h-4 w-4' />
                        Apply {analysisResult.detectedPairs.length} Pairs,{' '}
                        {analysisResult.unpairedMedia.length +
                            selectedNonBAMediaIds.size}{' '}
                        Media
                    </Button>
                </div>
            )}
        </div>
    )
}
