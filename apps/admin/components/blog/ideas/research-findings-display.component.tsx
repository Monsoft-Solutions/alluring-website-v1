'use client'

import { ExternalLink, Loader2, Search } from 'lucide-react'

import { Badge } from '@workspace/ui/components/badge'
import { ScrollArea } from '@workspace/ui/components/scroll-area'

import type {
    SSEResearchFindingData,
    SSEResearchQueryData,
} from '@/lib/types/blog/pipeline.type'

type ResearchFindingsDisplayProps = {
    findings: SSEResearchFindingData[]
    currentQuery: SSEResearchQueryData | null
    isSearching: boolean
}

/**
 * Display research findings as they stream in during the research phase.
 * Shows queries being executed and sources found with titles and snippets.
 */
export function ResearchFindingsDisplay({
    findings,
    currentQuery,
    isSearching,
}: ResearchFindingsDisplayProps) {
    if (findings.length === 0 && !currentQuery) {
        return null
    }

    return (
        <div className='mt-4 space-y-3'>
            <div className='flex items-center gap-2 text-sm font-medium'>
                <Search className='h-4 w-4 text-amber-500' />
                <span>Research Findings</span>
                {isSearching && (
                    <Badge variant='secondary' className='text-xs'>
                        Searching...
                    </Badge>
                )}
            </div>

            <ScrollArea className='h-48 rounded-lg border bg-stone-50/50 p-3'>
                <div className='space-y-4'>
                    {/* Show completed findings */}
                    {findings.map((finding, index) => (
                        <div key={`finding-${index}`} className='space-y-2'>
                            {/* Query header */}
                            <div className='flex items-center gap-2 text-xs'>
                                <Search className='h-3 w-3 text-stone-400' />
                                <span className='font-medium text-stone-600'>
                                    &quot;{finding.query}&quot;
                                </span>
                                <Badge
                                    variant='outline'
                                    className='ml-auto text-xs'
                                >
                                    {finding.findings.length} sources
                                </Badge>
                            </div>

                            {/* Sources found */}
                            <div className='ml-5 space-y-2'>
                                {finding.findings.map((source, sourceIndex) => (
                                    <div
                                        key={`source-${index}-${sourceIndex}`}
                                        className='animate-fade-in-up rounded-md border bg-white p-2 shadow-sm'
                                        style={{
                                            animationDelay: `${sourceIndex * 100}ms`,
                                        }}
                                    >
                                        <a
                                            href={source.url}
                                            target='_blank'
                                            rel='noopener noreferrer'
                                            className='group flex items-start gap-2'
                                        >
                                            <ExternalLink className='mt-0.5 h-3 w-3 flex-shrink-0 text-stone-400 transition-colors group-hover:text-amber-500' />
                                            <div className='min-w-0 flex-1'>
                                                <p className='truncate text-sm font-medium text-stone-700 transition-colors group-hover:text-amber-600'>
                                                    {source.title}
                                                </p>
                                                <p className='mt-0.5 line-clamp-2 text-xs text-stone-500'>
                                                    {source.snippet}
                                                </p>
                                            </div>
                                        </a>
                                    </div>
                                ))}
                            </div>

                            {/* Show summary if available */}
                            {finding.summary && (
                                <div className='ml-5 rounded-md bg-amber-50 p-2'>
                                    <p className='text-xs text-amber-800'>
                                        <span className='font-medium'>
                                            Key insight:{' '}
                                        </span>
                                        {finding.summary}
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Show current query being searched */}
                    {currentQuery && (
                        <div className='space-y-2'>
                            <div className='flex items-center gap-2 text-xs'>
                                <Loader2 className='h-3 w-3 animate-spin text-amber-500' />
                                <span className='font-medium text-stone-600'>
                                    Searching: &quot;{currentQuery.query}&quot;
                                </span>
                                <span className='text-stone-400'>
                                    ({currentQuery.queryIndex + 1}/
                                    {currentQuery.totalQueries})
                                </span>
                            </div>
                            <div className='ml-5'>
                                <div className='animate-pulse rounded-md border bg-white/50 p-2'>
                                    <div className='h-4 w-3/4 rounded bg-stone-200' />
                                    <div className='mt-1 h-3 w-full rounded bg-stone-100' />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
    )
}
