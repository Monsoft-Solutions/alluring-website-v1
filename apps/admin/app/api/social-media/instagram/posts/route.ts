import { NextResponse } from 'next/server'

import {
    getInstagramPosts,
    type InstagramAnalysisStatusFilter,
    type InstagramMediaTypeFilter,
    type InstagramPostSortBy,
    type InstagramPostSortDirection,
} from '@/lib/queries/social-media.query'

const DEFAULT_PAGE = 1
const DEFAULT_PAGE_SIZE = 20
const MAX_PAGE_SIZE = 100

function parseNumberParam(
    value: string | null,
    {
        defaultValue,
        min = 1,
        max = MAX_PAGE_SIZE,
    }: { defaultValue: number; min?: number; max?: number }
): number {
    const parsed = Number.parseInt(value ?? '', 10)
    if (Number.isNaN(parsed)) return defaultValue
    return Math.min(Math.max(parsed, min), max)
}

function parseSortBy(value: string | null): InstagramPostSortBy {
    if (value === 'likes') return 'likes'
    if (value === 'views') return 'views'
    return 'date'
}

function parseSortDirection(value: string | null): InstagramPostSortDirection {
    return value === 'asc' ? 'asc' : 'desc'
}

function parseMediaType(value: string | null): InstagramMediaTypeFilter {
    if (value === 'image' || value === 'video' || value === 'carousel') {
        return value
    }
    return 'all'
}

function parseAnalysisStatus(
    value: string | null
): InstagramAnalysisStatusFilter {
    if (
        value === 'pending' ||
        value === 'analyzed' ||
        value === 'reviewed' ||
        value === 'applied'
    ) {
        return value
    }
    return 'all'
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)

    const page = parseNumberParam(searchParams.get('page'), {
        defaultValue: DEFAULT_PAGE,
        min: 1,
    })
    const pageSize = parseNumberParam(searchParams.get('pageSize'), {
        defaultValue: DEFAULT_PAGE_SIZE,
        min: 1,
        max: MAX_PAGE_SIZE,
    })
    const sortBy = parseSortBy(searchParams.get('sortBy'))
    const sortDirection = parseSortDirection(searchParams.get('sortDirection'))
    const mediaType = parseMediaType(searchParams.get('mediaType'))
    const analysisStatus = parseAnalysisStatus(
        searchParams.get('analysisStatus')
    )

    try {
        const data = await getInstagramPosts({
            page,
            pageSize,
            sortBy,
            sortDirection,
            mediaType,
            analysisStatus,
        })

        return NextResponse.json({
            ...data,
            page,
            pageSize,
            sortBy,
            sortDirection,
            mediaType,
            analysisStatus,
        })
    } catch (error) {
        console.error('Error fetching Instagram posts:', error)
        return NextResponse.json(
            { error: 'Failed to fetch Instagram posts' },
            { status: 500 }
        )
    }
}
