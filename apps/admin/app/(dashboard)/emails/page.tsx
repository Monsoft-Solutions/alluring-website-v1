import { EmailStatsGrid } from '@/components/dashboard/email-stats-grid.component'
import { EmailLogsTable } from '@/components/dashboard/email-logs-table.component'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

export const metadata = {
    title: 'Email Logs | Admin',
    description: 'View email delivery status and history',
}

export default async function EmailsPage() {
    return (
        <div className='space-y-6'>
            <div>
                <h1 className='text-2xl font-semibold'>Email Logs</h1>
                <p className='text-muted-foreground'>
                    Monitor email delivery and track issues
                </p>
            </div>

            {/* Stats Cards - Independent component */}
            <EmailStatsGrid />

            {/* Email Logs Table - Independent component */}
            <EmailLogsTable />
        </div>
    )
}
