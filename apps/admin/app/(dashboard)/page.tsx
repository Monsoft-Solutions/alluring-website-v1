import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card'
import { FileText, Mail, MessageSquare, Bug, Clock } from 'lucide-react'
import Link from 'next/link'

import {
    getDashboardStats,
    getRecentBugReports,
    getRecentContacts,
} from '@/lib/queries/stats.query'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
    const [stats, recentContacts, recentBugReports] = await Promise.all([
        getDashboardStats(),
        getRecentContacts(5),
        getRecentBugReports(5),
    ])

    return (
        <div className='space-y-8'>
            {/* Stats Grid */}
            <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
                <StatsCard
                    title='Total Posts'
                    value={stats.blogPosts.total}
                    description={`${stats.blogPosts.published} published, ${stats.blogPosts.draft} drafts`}
                    icon={FileText}
                    href='/blog/posts'
                />
                <StatsCard
                    title='Contact Submissions'
                    value={stats.contacts.total}
                    description='All time submissions'
                    icon={Mail}
                    href='/contacts'
                />
                <StatsCard
                    title='Bug Reports'
                    value={stats.feedback.bugReports}
                    description='Issues reported'
                    icon={Bug}
                    href='/feedback'
                />
                <StatsCard
                    title='Beta Feedback'
                    value={stats.feedback.betaFeedback}
                    description='Feedback submissions'
                    icon={MessageSquare}
                    href='/feedback'
                />
            </div>

            {/* Recent Activity */}
            <div className='grid gap-6 lg:grid-cols-2'>
                {/* Recent Contacts */}
                <Card>
                    <CardHeader className='flex flex-row items-center justify-between'>
                        <CardTitle className='text-lg font-medium'>
                            Recent Contacts
                        </CardTitle>
                        <Link
                            href='/contacts'
                            className='text-muted-foreground hover:text-foreground text-sm'
                        >
                            View all
                        </Link>
                    </CardHeader>
                    <CardContent>
                        {recentContacts.length === 0 ? (
                            <p className='text-muted-foreground py-8 text-center text-sm'>
                                No contacts yet
                            </p>
                        ) : (
                            <div className='space-y-4'>
                                {recentContacts.map((contact) => (
                                    <div
                                        key={contact.id}
                                        className='flex items-start justify-between gap-4 rounded-lg border p-3'
                                    >
                                        <div className='min-w-0 flex-1'>
                                            <p className='truncate font-medium'>
                                                {contact.name}
                                            </p>
                                            <p className='text-muted-foreground truncate text-sm'>
                                                {contact.email}
                                            </p>
                                            {contact.subject && (
                                                <p className='text-muted-foreground mt-1 truncate text-sm'>
                                                    {contact.subject}
                                                </p>
                                            )}
                                        </div>
                                        <div className='text-muted-foreground flex shrink-0 items-center gap-1 text-xs'>
                                            <Clock className='h-3 w-3' />
                                            {contact.createdAt
                                                ? formatRelativeTime(
                                                      contact.createdAt
                                                  )
                                                : 'N/A'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Bug Reports */}
                <Card>
                    <CardHeader className='flex flex-row items-center justify-between'>
                        <CardTitle className='text-lg font-medium'>
                            Recent Bug Reports
                        </CardTitle>
                        <Link
                            href='/feedback'
                            className='text-muted-foreground hover:text-foreground text-sm'
                        >
                            View all
                        </Link>
                    </CardHeader>
                    <CardContent>
                        {recentBugReports.length === 0 ? (
                            <p className='text-muted-foreground py-8 text-center text-sm'>
                                No bug reports yet
                            </p>
                        ) : (
                            <div className='space-y-4'>
                                {recentBugReports.map((report) => (
                                    <div
                                        key={report.id}
                                        className='flex items-start justify-between gap-4 rounded-lg border p-3'
                                    >
                                        <div className='min-w-0 flex-1'>
                                            <p className='line-clamp-1 font-medium'>
                                                {report.description}
                                            </p>
                                            <p className='text-muted-foreground truncate text-sm'>
                                                {report.pageUrl}
                                            </p>
                                            <div className='mt-1 flex items-center gap-2'>
                                                <SeverityBadge
                                                    severity={report.severity}
                                                />
                                                <StatusBadge
                                                    status={report.status}
                                                />
                                            </div>
                                        </div>
                                        <div className='text-muted-foreground flex shrink-0 items-center gap-1 text-xs'>
                                            <Clock className='h-3 w-3' />
                                            {formatRelativeTime(
                                                report.createdAt
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

type StatsCardProps = {
    title: string
    value: number
    description: string
    icon: React.ComponentType<{ className?: string }>
    href: string
}

function StatsCard({
    title,
    value,
    description,
    icon: Icon,
    href,
}: StatsCardProps) {
    return (
        <Link href={href}>
            <Card className='transition-colors hover:bg-stone-50'>
                <CardHeader className='flex flex-row items-center justify-between pb-2'>
                    <CardTitle className='text-muted-foreground text-sm font-medium'>
                        {title}
                    </CardTitle>
                    <Icon className='text-muted-foreground h-4 w-4' />
                </CardHeader>
                <CardContent>
                    <div className='text-2xl font-bold'>{value}</div>
                    <p className='text-muted-foreground mt-1 text-xs'>
                        {description}
                    </p>
                </CardContent>
            </Card>
        </Link>
    )
}

function SeverityBadge({ severity }: { severity: string | null }) {
    const colors: Record<string, string> = {
        low: 'bg-green-100 text-green-800',
        medium: 'bg-yellow-100 text-yellow-800',
        high: 'bg-orange-100 text-orange-800',
        critical: 'bg-red-100 text-red-800',
    }

    return (
        <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                colors[severity ?? 'medium'] ?? colors.medium
            }`}
        >
            {severity ?? 'medium'}
        </span>
    )
}

function StatusBadge({ status }: { status: string | null }) {
    const colors: Record<string, string> = {
        new: 'bg-blue-100 text-blue-800',
        acknowledged: 'bg-purple-100 text-purple-800',
        'in-progress': 'bg-yellow-100 text-yellow-800',
        resolved: 'bg-green-100 text-green-800',
        'wont-fix': 'bg-stone-100 text-stone-800',
    }

    return (
        <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                colors[status ?? 'new'] ?? colors.new
            }`}
        >
            {status ?? 'new'}
        </span>
    )
}

function formatRelativeTime(date: Date): string {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`

    return date.toLocaleDateString()
}
