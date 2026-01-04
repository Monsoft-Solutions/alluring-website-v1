'use client'

import { DateRangeProvider } from '@/components/analytics/date-range-context.component'
import { DateRangeSelector } from '@/components/analytics/date-range-selector.component'
import { StatsGrid } from '@/components/dashboard/stats-grid.component'
import { ContactsChartCard } from '@/components/dashboard/contacts-chart-card.component'
import { TrafficChartCard } from '@/components/dashboard/traffic-chart-card.component'
import { ProcedureDemandCard } from '@/components/dashboard/procedure-demand-card.component'
import { ChatStatsCard } from '@/components/dashboard/chat-stats-card.component'
import { TrafficSourcesCard } from '@/components/dashboard/traffic-sources-card.component'
import { LeadGradesCard } from '@/components/dashboard/lead-grades-card.component'
import { RecentContactsCard } from '@/components/dashboard/recent-contacts-card.component'
import { HighValueLeadsCard } from '@/components/dashboard/high-value-leads-card.component'

/**
 * Client-side dashboard page wrapper.
 *
 * Provides the DateRangeContext to all dashboard cards and renders
 * the page header with the date range selector.
 */
export function DashboardPageClient() {
    return (
        <DateRangeProvider>
            <div className='space-y-8'>
                {/* Header with Date Range Selector */}
                <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                    <div>
                        <h1 className='text-2xl font-bold tracking-tight'>
                            Dashboard
                        </h1>
                        <p className='text-muted-foreground'>
                            Business overview and lead insights
                        </p>
                    </div>
                    <DateRangeSelector />
                </div>

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
        </DateRangeProvider>
    )
}
