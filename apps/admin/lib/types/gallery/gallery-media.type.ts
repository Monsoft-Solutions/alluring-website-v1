import type { GalleryMediaAIAnalysis } from '@workspace/shared/schemas/gallery'

export type GalleryMediaListItem = {
    id: string
    type: 'image' | 'video'
    url: string
    thumbnailUrl: string | null
    title: string
    slug: string
    status: 'draft' | 'published' | 'archived'
    isFeatured: boolean
    isBeforeAfter: boolean
    displayOrder: number
    createdAt: Date
    publishedAt: Date | null
}

export type GalleryMediaSortBy = 'createdAt' | 'title' | 'displayOrder'
export type GalleryMediaSortOrder = 'asc' | 'desc'
export type GalleryMediaStatusFilter =
    | 'all'
    | 'draft'
    | 'published'
    | 'archived'
export type GalleryMediaTypeFilter = 'all' | 'image' | 'video'

export type GetGalleryMediaOptions = {
    page?: number
    pageSize?: number
    sortBy?: GalleryMediaSortBy | 'qualityScore'
    sortOrder?: GalleryMediaSortOrder
    status?: GalleryMediaStatusFilter
    type?: GalleryMediaTypeFilter
    groupId?: string
    hasGroup?: boolean | null
    excludeMediaIds?: string[]
    search?: string
}

export type GalleryMediaDetail = {
    id: string
    type: 'image' | 'video'
    url: string
    thumbnailUrl: string | null
    title: string
    description: string | null
    alt: string | null
    seoTitle: string | null
    seoDescription: string | null
    slug: string
    width: number | null
    height: number | null
    duration: number | null
    fileSize: number | null
    mimeType: string | null
    originalFilename: string | null
    blurDataUrl: string | null
    isFeatured: boolean
    isBeforeAfter: boolean
    beforeAfterId: string | null
    displayOrder: number
    status: 'draft' | 'published' | 'archived'
    createdAt: Date
    updatedAt: Date
    publishedAt: Date | null
    aiAnalysis: GalleryMediaAIAnalysis | null
    groupIds: string[]
}

export type GalleryMediaOption = {
    id: string
    title: string
    url: string
    type: 'image' | 'video'
}

export type RecentMediaItem = {
    id: string
    type: 'image' | 'video'
    url: string
    title: string
    createdAt: Date
}
