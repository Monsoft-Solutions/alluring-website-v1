/**
 * Gallery Group Types
 *
 * Type definitions for gallery groups (collections of media)
 * used across the gallery pages.
 */

/**
 * Cover image for a gallery group
 */
export type GalleryGroupCoverImage = {
    readonly url: string
    readonly alt: string
    readonly blurDataUrl: string | null
}

/**
 * Gallery media card for grid displays
 */
export type GalleryMediaCard = {
    readonly id: string
    readonly type: 'image' | 'video'
    readonly url: string
    readonly thumbnailUrl: string | null
    readonly title: string
    readonly slug: string
    readonly alt: string
    readonly blurDataUrl: string | null
    readonly width: number | null
    readonly height: number | null
    readonly isFeatured: boolean
}

/**
 * Gallery group card for listing pages
 */
export type GalleryGroupCard = {
    readonly id: string
    readonly name: string
    readonly slug: string
    readonly description: string | null
    readonly coverImage: GalleryGroupCoverImage | null
    readonly mediaCount: number
}

/**
 * Gallery group detail with all media
 */
export type GalleryGroupDetail = {
    readonly id: string
    readonly name: string
    readonly slug: string
    readonly description: string | null
    readonly coverImage: GalleryGroupCoverImage | null
    readonly media: GalleryMediaCard[]
}
