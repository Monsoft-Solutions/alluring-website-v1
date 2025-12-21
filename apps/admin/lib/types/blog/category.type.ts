export type Category = {
    id: string
    name: string
    slug: string
    description: string | null
    color: string | null
    sortOrder: number | null
    isActive: boolean
    postCount: number
    createdAt: Date | null
}
