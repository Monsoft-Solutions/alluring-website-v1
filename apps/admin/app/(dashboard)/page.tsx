import { StatsGrid } from '@/components/dashboard/stats-grid.component'
import { ContactsChartCard } from '@/components/dashboard/contacts-chart-card.component'
import { TrafficChartCard } from '@/components/dashboard/traffic-chart-card.component'
import { ProcedureDemandCard } from '@/components/dashboard/procedure-demand-card.component'
import { ChatStatsCard } from '@/components/dashboard/chat-stats-card.component'
import { TrafficSourcesCard } from '@/components/dashboard/traffic-sources-card.component'
import { LeadGradesCard } from '@/components/dashboard/lead-grades-card.component'
import { RecentContactsCard } from '@/components/dashboard/recent-contacts-card.component'
import { HighValueLeadsCard } from '@/components/dashboard/high-value-leads-card.component'

export const metadata = {
    title: 'Dashboard | Admin',
    description:
        'Admin dashboard overview with business-focused metrics and lead insights',
}

/**
 * Enhanced Dashboard page with business intelligence components.
 * Replaces operational metrics (bugs, emails) with high-impact insights.
 */
export default function DashboardPage() {
    return (
        <div className='space-y-8'>
            {/* Row 1: High-Level Stats */}
            <StatsGrid />

            {/* Row 2: Traffic and Lead Trends */}
            <div className='grid gap-6 lg:grid-cols-2'>
                <ContactsChartCard />
                <TrafficChartCard />
            </div>

            {/* Row 3: Business Intelligence */}
            <div className='grid gap-6 lg:grid-cols-2'>
                <ProcedureDemandCard />
                <ChatStatsCard />
            </div>

            {/* Row 4: Source & Quality Analysis */}
            <div className='grid gap-6 lg:grid-cols-2'>
                <TrafficSourcesCard />
                <LeadGradesCard />
            </div>

            {/* Row 5: Recent Activity & High-Value Leads */}
            <div className='grid gap-6 lg:grid-cols-2'>
                <RecentContactsCard />
                <HighValueLeadsCard />
            </div>
        </div>
    )
}
