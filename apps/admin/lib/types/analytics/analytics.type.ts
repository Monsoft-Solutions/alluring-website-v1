export type AnalyticsSummary = {
    totalViews: number
    uniqueSessions: number
    todayViews: number
    topPage: string | null
    topSource: string | null
}

export type TopPage = {
    pagePath: string
    pageTitle: string | null
    views: number
    uniqueSessions: number
}

export type TrafficSource = {
    source: string
    views: number
    sessions: number
}

export type DeviceStats = {
    deviceType: string
    views: number
    percentage: number
}

export type BrowserStats = {
    browser: string
    views: number
    percentage: number
}

export type OSStats = {
    os: string
    views: number
    percentage: number
}

export type GeoStats = {
    countryCode: string
    views: number
    sessions: number
}

export type DailyViewCount = {
    date: string
    views: number
    sessions: number
}
