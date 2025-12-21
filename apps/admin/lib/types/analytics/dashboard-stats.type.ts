export type DashboardStats = {
    visitors: {
        today: number
        allTime: number
    }
    contacts: {
        total: number
        recent: number
    }
    chat: {
        totalSessions: number
        totalMessages: number
        activeSessions: number
    }
    leads: {
        highQualityCount: number
        highQualityPercentage: number
    }
}
