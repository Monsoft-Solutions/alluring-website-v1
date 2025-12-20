export type GalleryGroupListItem = {
    id: string
    name: string
    slug: string
    description: string | null
    procedureSlug: string | null
    coverImageId: string | null
    coverImageUrl: string | null
    displayOrder: number
    isVisible: boolean
    mediaCount: number
    createdAt: Date
}

export type GalleryGroupDetail = {
    id: string
    name: string
    slug: string
    description: string | null
    procedureSlug: string | null
    coverImageId: string | null
    displayOrder: number
    isVisible: boolean
    createdAt: Date
    updatedAt: Date
}

export type GalleryGroupOption = {
    id: string
    name: string
}

export type GalleryGroupWithSlug = {
    id: string
    name: string
    slug: string
}

export type GalleryGroupForAI = {
    id: string
    name: string
    slug: string
    description: string | null
}
