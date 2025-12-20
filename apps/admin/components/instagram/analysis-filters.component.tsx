/**
 * Analysis Filters Component
 *
 * Filter controls for Instagram post analysis status and media type.
 *
 * @module components/instagram/analysis-filters
 */
'use client'

import { Card, CardContent } from '@workspace/ui/components/card'
import { Badge } from '@workspace/ui/components/badge'
import { Tabs, TabsList, TabsTrigger } from '@workspace/ui/components/tabs'
import { Grid, ImageIcon, Layers } from 'lucide-react'

import type {
    InstagramAnalysisStatusFilter,
    InstagramMediaTypeFilter,
} from '@/lib/types/social-media.type'

type AnalysisFiltersProps = {
    analysisStatus: InstagramAnalysisStatusFilter
    mediaType: InstagramMediaTypeFilter
    statusCounts: {
        pending: number
        analyzed: number
        reviewed: number
        applied: number
    }
    onAnalysisStatusChange: (status: InstagramAnalysisStatusFilter) => void
    onMediaTypeChange: (type: InstagramMediaTypeFilter) => void
}

export function AnalysisFilters({
    analysisStatus,
    mediaType,
    statusCounts,
    onAnalysisStatusChange,
    onMediaTypeChange,
}: AnalysisFiltersProps) {
    return (
        <>
            {/* Status Filter Tabs */}
            <Card>
                <CardContent className='pt-6'>
                    <Tabs
                        value={analysisStatus}
                        onValueChange={(value) =>
                            onAnalysisStatusChange(
                                value as InstagramAnalysisStatusFilter
                            )
                        }
                    >
                        <TabsList className='grid w-full grid-cols-4'>
                            <TabsTrigger value='pending'>
                                Pending
                                <Badge variant='secondary' className='ml-2'>
                                    {statusCounts.pending}
                                </Badge>
                            </TabsTrigger>
                            <TabsTrigger value='analyzed'>
                                Analyzed
                                <Badge variant='secondary' className='ml-2'>
                                    {statusCounts.analyzed}
                                </Badge>
                            </TabsTrigger>
                            <TabsTrigger value='reviewed'>
                                Reviewed
                                <Badge variant='secondary' className='ml-2'>
                                    {statusCounts.reviewed}
                                </Badge>
                            </TabsTrigger>
                            <TabsTrigger value='all'>
                                All (excl. Applied)
                                <Badge variant='secondary' className='ml-2'>
                                    {statusCounts.pending +
                                        statusCounts.analyzed +
                                        statusCounts.reviewed}
                                </Badge>
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </CardContent>
            </Card>

            {/* Media Type Filter Tabs */}
            <Card>
                <CardContent className='pt-6'>
                    <div className='flex justify-center border-t'>
                        <div className='flex gap-12'>
                            <button
                                onClick={() => onMediaTypeChange('all')}
                                className={`flex h-12 items-center gap-2 border-t text-xs font-semibold tracking-widest uppercase transition-colors ${
                                    mediaType === 'all'
                                        ? 'border-foreground text-foreground'
                                        : 'text-muted-foreground hover:text-foreground border-transparent'
                                }`}
                            >
                                <Grid className='h-3 w-3' />
                                All
                            </button>
                            <button
                                onClick={() => onMediaTypeChange('image')}
                                className={`flex h-12 items-center gap-2 border-t text-xs font-semibold tracking-widest uppercase transition-colors ${
                                    mediaType === 'image'
                                        ? 'border-foreground text-foreground'
                                        : 'text-muted-foreground hover:text-foreground border-transparent'
                                }`}
                            >
                                <ImageIcon className='h-3 w-3' />
                                Images
                            </button>
                            <button
                                onClick={() => onMediaTypeChange('carousel')}
                                className={`flex h-12 items-center gap-2 border-t text-xs font-semibold tracking-widest uppercase transition-colors ${
                                    mediaType === 'carousel'
                                        ? 'border-foreground text-foreground'
                                        : 'text-muted-foreground hover:text-foreground border-transparent'
                                }`}
                            >
                                <Layers className='h-3 w-3' />
                                Carousel
                            </button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </>
    )
}
