import type { GalleryMediaAIAnalysis } from '@workspace/shared/schemas/gallery'

export type InstagramAnalysisStatus =
    | 'pending'
    | 'analyzed'
    | 'reviewed'
    | 'applied'

export type InstagramPostListItem = {
    id: string
    instagramId: string
    code: string
    mediaType: 'image' | 'video' | 'carousel'
    caption: string | null
    permalink: string
    takenAt: Date
    likeCount: number
    commentCount: number
    playCount: number | null
    isPublished: boolean
    isFeatured: boolean
    analysisStatus: InstagramAnalysisStatus
    createdAt: Date
    media: {
        id: string
        url: string
        thumbnailUrl: string | null
        type: 'image' | 'video'
        aiAnalysis?: GalleryMediaAIAnalysis | null
    }
    carouselCount?: number
    carouselMedia?: Array<{
        id: string
        url: string
        type: 'image' | 'video'
        displayOrder: number
        aiAnalysis?: GalleryMediaAIAnalysis | null
    }>
}

export type InstagramPostSortBy = 'date' | 'likes' | 'views'

export type InstagramPostSortDirection = 'asc' | 'desc'

export type InstagramMediaTypeFilter = 'all' | 'image' | 'video' | 'carousel'

export type InstagramAnalysisStatusFilter =
    | 'all'
    | 'pending'
    | 'analyzed'
    | 'reviewed'
    | 'applied'

export type InstagramPostWithMedia = InstagramPostListItem & {
    carouselMedia: Array<{
        id: string
        url: string
        type: 'image' | 'video'
        displayOrder: number
        aiAnalysis?: GalleryMediaAIAnalysis | null
    }>
}

export type SocialMediaStats = {
    totalPosts: number
    publishedPosts: number
    featuredPosts: number
    lastSyncAt: Date | null
}
