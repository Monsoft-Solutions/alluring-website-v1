import { DashboardPageClient } from '@/components/dashboard/dashboard-page-client.component'

export const metadata = {
    title: 'Dashboard | Admin',
    description:
        'Admin dashboard overview with business-focused metrics and lead insights',
}

/**
 * Enhanced Dashboard page with business intelligence components.
 * Uses DashboardPageClient for date range filtering across all cards.
 */
export default function DashboardPage() {
    return <DashboardPageClient />
}
