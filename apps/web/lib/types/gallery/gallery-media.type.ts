/**
 * Gallery Media Types
 *
 * Type definitions for individual gallery media items
 * used on detail pages.
 */

import type { GalleryMediaCard } from './gallery-group.type'

/**
 * Group reference for media detail
 */
export type MediaGroupReference = {
    readonly id: string
    readonly name: string
    readonly slug: string
}

/**
 * Gallery media detail with full information
 */
export type GalleryMediaDetail = {
    readonly id: string
    readonly type: 'image' | 'video'
    readonly url: string
    readonly thumbnailUrl: string | null
    readonly title: string
    readonly description: string | null
    readonly slug: string
    readonly alt: string
    readonly seoTitle: string | null
    readonly seoDescription: string | null
    readonly blurDataUrl: string | null
    readonly width: number | null
    readonly height: number | null
    readonly duration: number | null
    readonly isFeatured: boolean
    readonly publishedAt: string | null
    readonly groups: MediaGroupReference[]
    readonly relatedMedia: GalleryMediaCard[]
}
