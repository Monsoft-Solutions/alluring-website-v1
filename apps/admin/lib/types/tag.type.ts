export type TagItem = {
    id: string
    name: string
    slug: string
    description: string | null
    color: string | null
    usageCount: number
    isActive: boolean
    createdAt: Date
}
