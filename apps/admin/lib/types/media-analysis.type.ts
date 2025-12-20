import type { MediaAnalysis } from '@workspace/db/schema'
import type { BulkAnalysisResult } from '@workspace/shared/schemas/analysis'

export type AnalysisListFilters = {
    status?: 'pending' | 'analyzing' | 'completed' | 'applied' | 'failed'
    source?: 'instagram' | 'gallery'
    type?: 'bulk' | 'single'
}

export type PaginationOptions = {
    page?: number
    pageSize?: number
}

export type AnalysisListItem = {
    id: string
    name: string
    type: 'bulk' | 'single'
    source: 'instagram' | 'gallery'
    status: 'pending' | 'analyzing' | 'completed' | 'applied' | 'failed'
    totalMedia: number
    analyzedMedia: number
    detectedPairs: number
    unpairedMedia: number
    nonBAMedia: number
    startedAt: Date
    completedAt: Date | null
    appliedAt: Date | null
}

export type AnalysisDetail = MediaAnalysis & {
    resultData: BulkAnalysisResult | null
    status: 'pending' | 'analyzing' | 'completed' | 'applied' | 'failed'
}

export type AnalysisListResult = {
    analyses: AnalysisListItem[]
    total: number
    page: number
    pageSize: number
    totalPages: number
}
