/**
 * Analysis Stats Component
 *
 * Displays statistics summary for an analysis session.
 *
 * @module components/analysis/analysis-stats
 */
'use client'

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card'

import type { BulkAnalysisResult } from '@workspace/shared/schemas/analysis'

type AnalysisStatsProps = {
    analysisResult: BulkAnalysisResult
}

export function AnalysisStats({ analysisResult }: AnalysisStatsProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Analysis Complete</CardTitle>
                <CardDescription>
                    Review the detected B&A pairs and content classifications
                    before applying
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className='grid gap-4 md:grid-cols-5'>
                    <StatItem
                        label='Images Analyzed'
                        value={analysisResult.stats.analyzedMedia}
                    />
                    <StatItem
                        label='Side-by-Side'
                        value={analysisResult.stats.sideBySideCount}
                        color='text-green-600'
                    />
                    <StatItem
                        label='Matched Pairs'
                        value={analysisResult.stats.pairedCount}
                        color='text-blue-600'
                    />
                    <StatItem
                        label='Unpaired'
                        value={analysisResult.stats.unpairedCount}
                        color='text-yellow-600'
                    />
                    <StatItem
                        label='Non-B&A'
                        value={analysisResult.nonBAMedia.length}
                        color='text-gray-600'
                    />
                </div>
            </CardContent>
        </Card>
    )
}

type StatItemProps = {
    label: string
    value: number
    color?: string
}

function StatItem({ label, value, color }: StatItemProps) {
    return (
        <div className='text-center'>
            <div className={`text-2xl font-bold ${color || ''}`}>{value}</div>
            <div className='text-muted-foreground text-sm'>{label}</div>
        </div>
    )
}
