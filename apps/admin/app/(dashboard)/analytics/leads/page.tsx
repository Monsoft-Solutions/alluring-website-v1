import { LeadTrendsPage } from '@/components/analytics/leads/lead-trends-page.component'

export const metadata = {
    title: 'Lead Source Trends | Admin',
    description:
        'Lead analytics: source and medium trends over time for consultation requests.',
}

export default function LeadAnalyticsRoute() {
    return <LeadTrendsPage />
}
