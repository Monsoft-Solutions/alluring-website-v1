export type RecentBugReport = {
    id: string
    description: string
    pageUrl: string
    severity: string | null
    status: string | null
    createdAt: Date
}
