'use client'

import {
    Bot,
    Link,
    ExternalLink,
    PenLine,
    Sparkles,
    Loader2,
} from 'lucide-react'
import { Badge } from '@workspace/ui/components/badge'
import { cn } from '@workspace/ui/lib/utils'
import type { SSEReviewResultData } from '@/lib/types/blog/pipeline.type'

type ReviewAgentsDisplayProps = {
    results: SSEReviewResultData[]
    isReviewing: boolean
}

type AgentConfig = {
    id: string
    name: string
    displayName: string
    icon: React.ComponentType<{ className?: string }>
}

const AGENTS: AgentConfig[] = [
    {
        id: 'internal-links-reviewer',
        name: 'Internal Links Reviewer',
        displayName: 'Internal Links',
        icon: Link,
    },
    {
        id: 'external-links-reviewer',
        name: 'External Links Reviewer',
        displayName: 'External Links',
        icon: ExternalLink,
    },
    {
        id: 'writing-quality-reviewer',
        name: 'Writing Quality Reviewer',
        displayName: 'Writing Quality',
        icon: PenLine,
    },
    {
        id: 'ai-slop-detector',
        name: 'AI Slop Detector',
        displayName: 'AI Detection',
        icon: Sparkles,
    },
]

function getScoreColor(score: number): string {
    if (score >= 90) return 'text-green-600'
    if (score >= 75) return 'text-emerald-600'
    if (score >= 60) return 'text-amber-600'
    if (score >= 40) return 'text-orange-600'
    return 'text-red-600'
}

function getScoreBg(score: number): string {
    if (score >= 90) return 'bg-green-50 border-green-200'
    if (score >= 75) return 'bg-emerald-50 border-emerald-200'
    if (score >= 60) return 'bg-amber-50 border-amber-200'
    if (score >= 40) return 'bg-orange-50 border-orange-200'
    return 'bg-red-50 border-red-200'
}

function getScoreBadgeVariant(
    score: number
): 'default' | 'secondary' | 'destructive' | 'outline' {
    if (score >= 75) return 'default'
    if (score >= 60) return 'secondary'
    if (score >= 40) return 'outline'
    return 'destructive'
}

function findAgentResult(
    results: SSEReviewResultData[],
    agentConfig: AgentConfig
): SSEReviewResultData | undefined {
    return results.find(
        (r) => r.agentName.toLowerCase() === agentConfig.id.toLowerCase()
    )
}

/**
 * Display review agent results in a 2x2 grid as they stream in.
 * Shows loading skeleton for pending agents, animated entrance for completed ones.
 */
export function ReviewAgentsDisplay({
    results,
    isReviewing,
}: ReviewAgentsDisplayProps) {
    return (
        <div className='space-y-3'>
            <div className='flex items-center gap-2 text-sm font-medium'>
                <Bot className='h-4 w-4 text-amber-500' />
                <span>Review Agents</span>
                {isReviewing && (
                    <Badge variant='secondary' className='text-xs'>
                        {results.length}/4 complete
                    </Badge>
                )}
            </div>

            <div className='grid grid-cols-2 gap-3'>
                {AGENTS.map((agent) => {
                    const result = findAgentResult(results, agent)
                    const Icon = agent.icon

                    return (
                        <div
                            key={agent.id}
                            className={cn(
                                'rounded-lg border p-3 transition-all duration-300',
                                result
                                    ? getScoreBg(result.score)
                                    : 'border-stone-200 bg-stone-50'
                            )}
                        >
                            {result ? (
                                // Completed agent card
                                <div className='animate-fade-in-up space-y-2'>
                                    <div className='flex items-center justify-between'>
                                        <div className='flex items-center gap-2'>
                                            <Icon className='h-4 w-4 text-stone-600' />
                                            <span className='text-sm font-medium text-stone-700'>
                                                {agent.displayName}
                                            </span>
                                        </div>
                                        <Badge
                                            variant={getScoreBadgeVariant(
                                                result.score
                                            )}
                                            className='text-xs'
                                        >
                                            {result.score}/100
                                        </Badge>
                                    </div>
                                    <p className='line-clamp-2 text-xs text-stone-600'>
                                        {result.summary}
                                    </p>
                                    {result.issueCount > 0 && (
                                        <p className='text-xs text-amber-700'>
                                            {result.issueCount} issue
                                            {result.issueCount > 1
                                                ? 's'
                                                : ''}{' '}
                                            found
                                        </p>
                                    )}
                                </div>
                            ) : (
                                // Loading skeleton
                                <div className='space-y-2'>
                                    <div className='flex items-center justify-between'>
                                        <div className='flex items-center gap-2'>
                                            <Icon className='h-4 w-4 text-stone-400' />
                                            <span className='text-sm font-medium text-stone-400'>
                                                {agent.displayName}
                                            </span>
                                        </div>
                                        {isReviewing && (
                                            <Loader2 className='h-4 w-4 animate-spin text-stone-400' />
                                        )}
                                    </div>
                                    <div className='animate-pulse space-y-1'>
                                        <div className='h-3 w-full rounded bg-stone-200' />
                                        <div className='h-3 w-2/3 rounded bg-stone-200' />
                                    </div>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

/**
 * Compact version for display in completion state
 */
export function ReviewAgentsSummary({
    results,
}: {
    results: SSEReviewResultData[]
}) {
    const avgScore =
        results.length > 0
            ? Math.round(
                  results.reduce((sum, r) => sum + r.score, 0) / results.length
              )
            : 0

    return (
        <div className='space-y-3'>
            <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2 text-sm font-medium'>
                    <Bot className='h-4 w-4 text-stone-500' />
                    <span>Review Agent Results</span>
                </div>
                <Badge variant={getScoreBadgeVariant(avgScore)}>
                    Avg: {avgScore}/100
                </Badge>
            </div>

            <div className='grid grid-cols-2 gap-2'>
                {results.map((result) => {
                    const agent = AGENTS.find(
                        (a) =>
                            result.agentName.toLowerCase() ===
                            a.id.toLowerCase()
                    )
                    const Icon = agent?.icon ?? Bot

                    return (
                        <div
                            key={result.agentName}
                            className={cn(
                                'flex items-center justify-between rounded-md border p-2',
                                getScoreBg(result.score)
                            )}
                        >
                            <div className='flex items-center gap-2'>
                                <Icon className='h-3.5 w-3.5 text-stone-600' />
                                <span className='text-xs font-medium text-stone-700'>
                                    {agent?.displayName ?? result.agentName}
                                </span>
                            </div>
                            <span
                                className={cn(
                                    'text-xs font-bold',
                                    getScoreColor(result.score)
                                )}
                            >
                                {result.score}
                            </span>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
