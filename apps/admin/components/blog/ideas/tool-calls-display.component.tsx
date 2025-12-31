'use client'

import { Check, ExternalLink, Loader2, Search, Sparkles } from 'lucide-react'

import { Badge } from '@workspace/ui/components/badge'
import { ScrollArea } from '@workspace/ui/components/scroll-area'

import type {
    SSEToolCallData,
    AgenticSource,
} from '@/lib/types/blog/pipeline.type'

type ToolCall = SSEToolCallData

type ToolCallsDisplayProps = {
    toolCalls: ToolCall[]
    sources: AgenticSource[]
    isWriting: boolean
}

/**
 * Display real-time tool calls during agentic content generation.
 * Shows Perplexity/Google searches as they happen and sources collected.
 */
export function ToolCallsDisplay({
    toolCalls,
    sources,
    isWriting,
}: ToolCallsDisplayProps) {
    if (toolCalls.length === 0 && sources.length === 0 && !isWriting) {
        return null
    }

    return (
        <div className='space-y-3'>
            {/* Header */}
            <div className='flex items-center gap-2 text-sm font-medium'>
                <Sparkles className='h-4 w-4 text-amber-500' />
                <span>AI Writing with Research</span>
                {isWriting && (
                    <Badge variant='secondary' className='text-xs'>
                        <Loader2 className='mr-1 h-3 w-3 animate-spin' />
                        Writing...
                    </Badge>
                )}
            </div>

            <ScrollArea className='h-[240px] rounded-lg border bg-stone-50/50 p-3'>
                <div className='space-y-4'>
                    {/* Show AI writing indicator when starting */}
                    {toolCalls.length === 0 && isWriting && (
                        <div className='flex items-center gap-3 rounded-lg bg-white p-3 shadow-sm'>
                            <div className='flex h-8 w-8 items-center justify-center rounded-full bg-amber-100'>
                                <Sparkles className='h-4 w-4 text-amber-600' />
                            </div>
                            <div>
                                <p className='text-sm font-medium text-stone-700'>
                                    AI is writing your content
                                </p>
                                <p className='text-xs text-stone-500'>
                                    Will search for facts and statistics as
                                    needed...
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Show tool calls as they happen */}
                    {toolCalls.map((call, index) => (
                        <div
                            key={`tool-${index}`}
                            className='animate-fade-in-up flex items-start gap-3 rounded-lg bg-white p-3 shadow-sm'
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            <div className='flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100'>
                                <Search className='h-3 w-3 text-blue-600' />
                            </div>
                            <div className='min-w-0 flex-1'>
                                <div className='flex items-center gap-2'>
                                    <Badge
                                        variant='outline'
                                        className='text-xs capitalize'
                                    >
                                        {call.toolName === 'perplexity_search'
                                            ? 'Perplexity'
                                            : 'Google'}
                                    </Badge>
                                    <span className='text-xs text-stone-400'>
                                        #{call.toolCallIndex}
                                    </span>
                                </div>
                                <p className='mt-1 text-sm text-stone-700'>
                                    &quot;{call.query}&quot;
                                </p>
                            </div>
                            <Check className='h-4 w-4 shrink-0 text-green-500' />
                        </div>
                    ))}

                    {/* Show sources collected section */}
                    {sources.length > 0 && (
                        <div className='mt-4 space-y-2'>
                            <div className='flex items-center gap-2 text-xs font-medium text-stone-600'>
                                <ExternalLink className='h-3 w-3' />
                                <span>
                                    Sources Collected ({sources.length})
                                </span>
                            </div>
                            <div className='space-y-1'>
                                {sources.slice(0, 8).map((source, index) => (
                                    <a
                                        key={`source-${index}`}
                                        href={source.url}
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        className='group flex items-center gap-2 rounded px-2 py-1 text-xs transition-colors hover:bg-stone-100'
                                    >
                                        <Badge
                                            variant='outline'
                                            className='shrink-0 text-[10px] capitalize'
                                        >
                                            {source.type}
                                        </Badge>
                                        <span className='truncate text-stone-600 group-hover:text-amber-600'>
                                            {source.title}
                                        </span>
                                        <ExternalLink className='h-3 w-3 shrink-0 opacity-0 transition-opacity group-hover:opacity-100' />
                                    </a>
                                ))}
                                {sources.length > 8 && (
                                    <p className='px-2 text-xs text-stone-400'>
                                        +{sources.length - 8} more sources
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
    )
}

/**
 * Summary of sources used in agentic generation (for completion state)
 */
type SourcesSummaryProps = {
    sources: AgenticSource[]
    toolCallCount: number
    totalTimeMs: number
}

export function SourcesSummary({
    sources,
    toolCallCount,
    totalTimeMs,
}: SourcesSummaryProps) {
    const perplexitySources = sources.filter((s) => s.type === 'perplexity')
    const googleSources = sources.filter((s) => s.type === 'google')

    return (
        <div className='space-y-3 rounded-lg border bg-stone-50 p-3'>
            <div className='flex items-center justify-between'>
                <h4 className='text-sm font-medium text-stone-700'>
                    Research Summary
                </h4>
                <div className='flex items-center gap-2 text-xs text-stone-500'>
                    <Badge variant='secondary'>{toolCallCount} searches</Badge>
                    <span>{(totalTimeMs / 1000).toFixed(1)}s</span>
                </div>
            </div>

            <div className='grid grid-cols-2 gap-3 text-sm'>
                <div className='rounded-md border bg-white p-2'>
                    <div className='flex items-center gap-1.5 text-xs text-stone-500'>
                        <Badge variant='outline' className='text-[10px]'>
                            Perplexity
                        </Badge>
                        <span>{perplexitySources.length} sources</span>
                    </div>
                </div>
                <div className='rounded-md border bg-white p-2'>
                    <div className='flex items-center gap-1.5 text-xs text-stone-500'>
                        <Badge variant='outline' className='text-[10px]'>
                            Google
                        </Badge>
                        <span>{googleSources.length} sources</span>
                    </div>
                </div>
            </div>

            {sources.length > 0 && (
                <div className='space-y-1'>
                    <p className='text-xs font-medium text-stone-600'>
                        Top Sources:
                    </p>
                    <div className='space-y-1'>
                        {sources.slice(0, 4).map((source, index) => (
                            <a
                                key={`summary-source-${index}`}
                                href={source.url}
                                target='_blank'
                                rel='noopener noreferrer'
                                className='group flex items-center gap-2 rounded px-1 py-0.5 text-xs transition-colors hover:bg-white'
                            >
                                <ExternalLink className='h-3 w-3 shrink-0 text-stone-400 group-hover:text-amber-500' />
                                <span className='truncate text-stone-600 group-hover:text-amber-600'>
                                    {source.title}
                                </span>
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
