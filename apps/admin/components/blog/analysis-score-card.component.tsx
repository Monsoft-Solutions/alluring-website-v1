/**
 * Analysis Score Card Component
 *
 * Displays individual category scores with progress bars and findings.
 *
 * @module apps/admin/components/blog/analysis-score-card
 */
import { CheckCircle2, AlertCircle, Info } from 'lucide-react'

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card'
import { Badge } from '@workspace/ui/components/badge'

type CategoryData = {
    score: number
    findings: string[]
    suggestions: string[]
}

type AnalysisScoreCardProps = {
    title: string
    category: CategoryData
    weight: number
}

/**
 * Get color class based on score
 */
function getScoreColor(score: number): string {
    if (score >= 90) return 'text-green-600'
    if (score >= 75) return 'text-blue-600'
    if (score >= 60) return 'text-yellow-600'
    if (score >= 40) return 'text-orange-600'
    return 'text-red-600'
}

/**
 * Get progress bar color based on score
 */
function getProgressColor(score: number): string {
    if (score >= 90) return 'bg-green-600'
    if (score >= 75) return 'bg-blue-600'
    if (score >= 60) return 'bg-yellow-600'
    if (score >= 40) return 'bg-orange-600'
    return 'bg-red-600'
}

export function AnalysisScoreCard({
    title,
    category,
    weight,
}: AnalysisScoreCardProps) {
    const { score, findings, suggestions } = category
    const scoreColor = getScoreColor(score)
    const progressColor = getProgressColor(score)

    return (
        <Card>
            <CardHeader className='pb-3'>
                <div className='flex items-center justify-between'>
                    <CardTitle className='text-base font-medium'>
                        {title}
                    </CardTitle>
                    <div className='flex items-center gap-2'>
                        <Badge variant='outline' className='text-xs'>
                            {weight}% weight
                        </Badge>
                        <span className={`text-lg font-bold ${scoreColor}`}>
                            {score}
                        </span>
                    </div>
                </div>
                <div className='bg-secondary relative h-2 w-full overflow-hidden rounded-full'>
                    <div
                        className={`h-full ${progressColor} transition-all`}
                        style={{ width: `${score}%` }}
                    />
                </div>
            </CardHeader>
            <CardContent className='space-y-3'>
                {findings.length > 0 && (
                    <div className='space-y-1'>
                        <div className='flex items-center gap-1.5 text-sm font-medium'>
                            <Info className='text-muted-foreground h-4 w-4' />
                            Findings
                        </div>
                        <ul className='text-muted-foreground ml-5 space-y-1 text-sm'>
                            {findings.map((finding, index) => (
                                <li key={index} className='list-disc'>
                                    {finding}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                {suggestions.length > 0 && (
                    <div className='space-y-1'>
                        <div className='flex items-center gap-1.5 text-sm font-medium'>
                            {score >= 75 ? (
                                <CheckCircle2 className='h-4 w-4 text-green-600' />
                            ) : (
                                <AlertCircle className='h-4 w-4 text-yellow-600' />
                            )}
                            Suggestions
                        </div>
                        <ul className='text-muted-foreground ml-5 space-y-1 text-sm'>
                            {suggestions.map((suggestion, index) => (
                                <li key={index} className='list-disc'>
                                    {suggestion}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
