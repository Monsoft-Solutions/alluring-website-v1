import { StatsGrid } from '@/components/dashboard/stats-grid.component'
import { ContactsChartCard } from '@/components/dashboard/contacts-chart-card.component'
import { PostsChartCard } from '@/components/dashboard/posts-chart-card.component'
import { BugsChartCard } from '@/components/dashboard/bugs-chart-card.component'
import { EmailsChartCard } from '@/components/dashboard/emails-chart-card.component'
import { RecentContactsCard } from '@/components/dashboard/recent-contacts-card.component'
import { RecentBugsCard } from '@/components/dashboard/recent-bugs-card.component'

export const metadata = {
    title: 'Dashboard | Admin',
    description:
        'Admin dashboard overview with stats, charts, and recent activity',
}

/**
 * Dashboard page with independent data-fetching components.
 *
 * Each card component fetches its own data via TanStack Query,
 * enabling parallel loading and granular refresh capabilities.
 */
export default function DashboardPage() {
    return (
        <div className='space-y-8'>
            {/* Stats Grid - fetches dashboard stats */}
            <StatsGrid />

            {/* Charts Row 1 - Contacts & Posts */}
            <div className='grid gap-6 lg:grid-cols-2'>
                <ContactsChartCard />
                <PostsChartCard />
            </div>

            {/* Charts Row 2 - Bugs & Emails */}
            <div className='grid gap-6 lg:grid-cols-2'>
                <BugsChartCard />
                <EmailsChartCard />
            </div>

            {/* Recent Activity - Contacts & Bug Reports */}
            <div className='grid gap-6 lg:grid-cols-2'>
                <RecentContactsCard />
                <RecentBugsCard />
            </div>
        </div>
    )
}
