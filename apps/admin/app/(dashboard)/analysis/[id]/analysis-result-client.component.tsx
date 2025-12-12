/**
 * Analysis Result Client Component
 *
 * Client-side wrapper for the analysis result page.
 * Handles applying/updating results and status management.
 *
 * @module app/(dashboard)/analysis/[id]/analysis-result-client
 */
'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

import { Button } from '@workspace/ui/components/button'
import { Card, CardContent } from '@workspace/ui/components/card'

import type { AnalysisDetail } from '@/lib/queries/media-analysis.query'
import type { GalleryGroupForAI } from '@/lib/queries/gallery.query'
import { AnalysisResult } from '@/components/analysis/analysis-result.component'
import { applyAnalysisResults } from '@/lib/actions/instagram-analysis.action'
import { updateAnalysisStatus } from '@/lib/actions/media-analysis.action'

type AnalysisResultClientProps = {
    analysis: AnalysisDetail
    galleryGroups: GalleryGroupForAI[]
}

export function AnalysisResultClient({
    analysis,
    galleryGroups,
}: AnalysisResultClientProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    const handleApply = async (data: {
        pairGroupAssignments: Map<string, string[]>
        unpairedGroupAssignments: Map<string, string[]>
        nonBAGroupAssignments: Map<string, string[]>
        selectedNonBAMediaIds: Set<string>
    }) => {
        startTransition(async () => {
            try {
                // Build pairs to create with group assignments
                const pairs = analysis.resultData.detectedPairs.map((pair) => ({
                    beforeMediaId: pair.beforeMediaId,
                    afterMediaId: pair.afterMediaId,
                    procedureSlug: pair.procedureSlug,
                    isSideBySide: pair.type === 'side_by_side',
                }))

                // Build group assignments for ALL media types
                const groupAssignments: Array<{
                    mediaId: string
                    groupId: string
                }> = []

                // Add pair group assignments
                data.pairGroupAssignments.forEach((groupIds, pairId) => {
                    const pair = analysis.resultData.detectedPairs.find(
                        (p) => p.id === pairId
                    )
                    if (pair && groupIds.length > 0) {
                        groupIds.forEach((groupId) => {
                            // Assign to both before and after media
                            groupAssignments.push({
                                mediaId: pair.beforeMediaId,
                                groupId,
                            })
                            if (pair.type !== 'side_by_side') {
                                groupAssignments.push({
                                    mediaId: pair.afterMediaId,
                                    groupId,
                                })
                            }
                        })
                    }
                })

                // Add unpaired group assignments
                data.unpairedGroupAssignments.forEach((groupIds, mediaId) => {
                    if (groupIds.length > 0) {
                        groupIds.forEach((groupId) => {
                            groupAssignments.push({ mediaId, groupId })
                        })
                    }
                })

                // Add non-BA group assignments (only for selected items)
                data.selectedNonBAMediaIds.forEach((mediaId) => {
                    const groupIds = data.nonBAGroupAssignments.get(mediaId)
                    if (groupIds && groupIds.length > 0) {
                        groupIds.forEach((groupId) => {
                            groupAssignments.push({ mediaId, groupId })
                        })
                    }
                })

                // Extract post IDs from the analysis result
                const postIds = Array.from(
                    new Set([
                        ...analysis.resultData.unpairedMedia.map(
                            (m) => m.postId
                        ),
                        ...analysis.resultData.nonBAMedia.map((m) => m.postId),
                    ])
                )

                const result = await applyAnalysisResults({
                    pairs,
                    groupAssignments,
                    postIds,
                })

                if (result.success) {
                    // Update analysis status to applied
                    await updateAnalysisStatus(analysis.id, 'applied')

                    const totalMedia =
                        analysis.resultData.unpairedMedia.length +
                        data.selectedNonBAMediaIds.size
                    toast.success(
                        `Created ${pairs.length} B&A pairs and assigned ${totalMedia} media items to groups`
                    )

                    router.refresh()
                } else {
                    toast.error(result.error || 'Failed to apply results')
                }
            } catch (error) {
                console.error('Apply error:', error)
                toast.error('An unexpected error occurred')
            }
        })
    }

    if (analysis.status === 'failed') {
        return (
            <Card className='border-destructive/40 bg-destructive/5'>
                <CardContent className='py-12 text-center'>
                    <p className='text-destructive mb-4 text-lg font-semibold'>
                        Analysis Failed
                    </p>
                    <p className='text-muted-foreground text-sm'>
                        {analysis.errorMessage ||
                            'An error occurred during analysis'}
                    </p>
                </CardContent>
            </Card>
        )
    }

    if (analysis.status === 'analyzing' || !analysis.resultData) {
        return (
            <Card>
                <CardContent className='py-12 text-center'>
                    <Loader2 className='mx-auto mb-4 h-12 w-12 animate-spin' />
                    <p className='text-lg font-semibold'>Analyzing...</p>
                    <p className='text-muted-foreground text-sm'>
                        AI is analyzing the media. This may take a few minutes.
                    </p>
                </CardContent>
            </Card>
        )
    }

    // Only allow editing when status is completed or applied
    const canEdit =
        analysis.status === 'completed' || analysis.status === 'applied'

    return (
        <>
            <AnalysisResult
                analysisResult={analysis.resultData}
                galleryGroups={galleryGroups}
                onApply={handleApply}
                isApplying={isPending}
                canEdit={canEdit}
            />

            {/* Additional Actions */}
            {analysis.status === 'applied' && (
                <Card>
                    <CardContent className='py-6'>
                        <div className='flex items-center justify-center gap-4'>
                            <p className='text-muted-foreground text-sm'>
                                Results have been applied
                            </p>
                            <Button asChild variant='outline'>
                                <Link href='/gallery/before-after'>
                                    View B&A Pairs
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </>
    )
}
