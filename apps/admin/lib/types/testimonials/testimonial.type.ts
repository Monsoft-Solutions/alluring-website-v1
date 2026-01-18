import type {
    PatientTestimonial,
    TestimonialMetadata,
} from '@workspace/db/schema'

/**
 * Testimonial list item for display in admin table
 */
export interface TestimonialListItem {
    id: string
    sourceType: PatientTestimonial['sourceType']
    patientName: string
    procedure: string
    procedureSlug: string | null
    quote: string
    rating: number
    isFeatured: boolean
    displayOrder: number
    status: PatientTestimonial['status']
    slug: string
    createdAt: Date
    publishedAt: Date | null
    // Related media info
    mediaUrl: string | null
    mediaThumbnailUrl: string | null
    mediaType: 'image' | 'video' | null
    // Instagram info
    instagramPermalink: string | null
}

/**
 * Full testimonial detail for editing
 */
export interface TestimonialDetail extends PatientTestimonial {
    // Related Instagram post info
    instagramPost?: {
        id: string
        permalink: string
        mediaType: 'image' | 'video' | 'carousel'
        caption: string | null
        likeCount: number | null
        commentCount: number | null
    } | null
    // Related media info
    media?: {
        id: string
        url: string
        thumbnailUrl: string | null
        type: 'image' | 'video'
    } | null
    // Related thumbnail info
    thumbnail?: {
        id: string
        url: string
    } | null
}

/**
 * Options for querying testimonials
 */
export interface GetTestimonialsOptions {
    page?: number
    pageSize?: number
    sortBy?: 'createdAt' | 'displayOrder' | 'patientName' | 'rating'
    sortOrder?: 'asc' | 'desc'
    status?: 'all' | 'draft' | 'published' | 'archived'
    sourceType?: 'all' | 'instagram' | 'direct' | 'manual'
    isFeatured?: boolean | null
    procedureSlug?: string | null
    search?: string
}

/**
 * Form data for creating/updating testimonials
 */
export interface TestimonialFormData {
    sourceType: 'instagram' | 'direct' | 'manual'
    instagramPostId?: string | null
    mediaId?: string | null
    thumbnailMediaId?: string | null
    patientName: string
    procedure: string
    procedureSlug?: string | null
    timeframe?: string | null
    quote: string
    /**
     * Long-form marketing description (AI-generated or manual)
     */
    longDescription?: string | null
    rating: number
    isFeatured?: boolean
    displayOrder?: number
    status: 'draft' | 'published' | 'archived'
    slug: string
    metadata?: TestimonialMetadata | null
    // For direct uploads - URL to create gallery_media from
    directMediaUrl?: string | null
    directMediaType?: 'image' | 'video' | null
}

/**
 * Testimonial statistics
 */
export interface TestimonialStats {
    totalTestimonials: number
    publishedTestimonials: number
    draftTestimonials: number
    featuredTestimonials: number
    instagramSourced: number
    directUpload: number
    manualEntries: number
    averageRating: number
}

/**
 * Instagram post selection item
 */
export interface InstagramPostSelectItem {
    id: string
    instagramId: string
    code: string
    mediaType: 'image' | 'video' | 'carousel'
    caption: string | null
    permalink: string
    likeCount: number | null
    commentCount: number | null
    thumbnailUrl: string | null
    // Whether already linked to a testimonial
    hasTestimonial: boolean
}
