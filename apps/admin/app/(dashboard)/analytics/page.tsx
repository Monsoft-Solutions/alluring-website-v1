/**
 * Analytics Dashboard Page
 *
 * Displays page view analytics, traffic sources, device breakdown,
 * and geographic distribution.
 *
 * @module app/(dashboard)/analytics/page
 */
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card'
import {
    Eye,
    Users,
    TrendingUp,
    Globe,
    Monitor,
    Smartphone,
    ExternalLink,
    BarChart3,
} from 'lucide-react'

import {
    BrowserChart,
    DeviceChart,
    GeoTable,
    PageViewsChart,
    TopPagesChart,
    TrafficSourcesChart,
} from '@/components/charts/analytics-charts.component'
import {
    getAnalyticsSummary,
    getPageViewsOverTime,
    getTopPagesInRange,
    getTrafficSources,
    getDeviceBreakdown,
    getBrowserBreakdown,
    getGeoDistribution,
} from '@/lib/queries/analytics.query'

export const dynamic = 'force-dynamic'

export default async function AnalyticsPage() {
    const [
        summary,
        pageViewsOverTime,
        topPages,
        trafficSources,
        deviceBreakdown,
        browserBreakdown,
        geoDistribution,
    ] = await Promise.all([
        getAnalyticsSummary(),
        getPageViewsOverTime(30),
        getTopPagesInRange(30, 10),
        getTrafficSources(10),
        getDeviceBreakdown(),
        getBrowserBreakdown(5),
        getGeoDistribution(10),
    ])

    return (
        <div className='space-y-8'>
            {/* Header */}
            <div>
                <h1 className='text-2xl font-bold tracking-tight'>Analytics</h1>
                <p className='text-muted-foreground'>
                    Cookie-free page view analytics for your website
                </p>
            </div>

            {/* Summary Stats */}
            <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
                <StatsCard
                    title='Total Page Views'
                    value={summary.totalViews.toLocaleString()}
                    description='All time'
                    icon={Eye}
                />
                <StatsCard
                    title='Unique Sessions'
                    value={summary.uniqueSessions.toLocaleString()}
                    description='All time'
                    icon={Users}
                />
                <StatsCard
                    title="Today's Views"
                    value={summary.todayViews.toLocaleString()}
                    description='Since midnight'
                    icon={TrendingUp}
                />
                <StatsCard
                    title='Top Source'
                    value={summary.topSource ?? 'N/A'}
                    description='By page views'
                    icon={ExternalLink}
                />
            </div>

            {/* Page Views Over Time */}
            <Card>
                <CardHeader>
                    <CardTitle className='flex items-center gap-2 text-lg'>
                        <BarChart3 className='h-5 w-5' />
                        Page Views Over Time
                    </CardTitle>
                    <CardDescription>
                        Page views and sessions for the last 30 days
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {pageViewsOverTime.length > 0 ? (
                        <PageViewsChart data={pageViewsOverTime} />
                    ) : (
                        <EmptyState message='No page view data yet' />
                    )}
                </CardContent>
            </Card>

            {/* Top Pages & Traffic Sources */}
            <div className='grid gap-6 lg:grid-cols-2'>
                <Card>
                    <CardHeader>
                        <CardTitle className='flex items-center gap-2 text-lg'>
                            <Eye className='h-5 w-5' />
                            Top Pages
                        </CardTitle>
                        <CardDescription>
                            Most viewed pages in the last 30 days
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {topPages.length > 0 ? (
                            <TopPagesChart data={topPages} />
                        ) : (
                            <EmptyState message='No page data yet' />
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className='flex items-center gap-2 text-lg'>
                            <ExternalLink className='h-5 w-5' />
                            Traffic Sources
                        </CardTitle>
                        <CardDescription>
                            Where your visitors come from
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {trafficSources.length > 0 ? (
                            <TrafficSourcesChart data={trafficSources} />
                        ) : (
                            <EmptyState message='No traffic source data yet' />
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Device & Browser Stats */}
            <div className='grid gap-6 lg:grid-cols-3'>
                <Card>
                    <CardHeader>
                        <CardTitle className='flex items-center gap-2 text-lg'>
                            <Monitor className='h-5 w-5' />
                            Devices
                        </CardTitle>
                        <CardDescription>Device type breakdown</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {deviceBreakdown.length > 0 ? (
                            <>
                                <DeviceChart data={deviceBreakdown} />
                                <div className='mt-4 flex flex-wrap justify-center gap-4'>
                                    {deviceBreakdown.map((device) => (
                                        <div
                                            key={device.deviceType}
                                            className='flex items-center gap-2 text-sm'
                                        >
                                            {device.deviceType === 'mobile' ? (
                                                <Smartphone className='h-4 w-4 text-amber-600' />
                                            ) : (
                                                <Monitor className='h-4 w-4 text-stone-500' />
                                            )}
                                            <span className='capitalize'>
                                                {device.deviceType}
                                            </span>
                                            <span className='text-muted-foreground'>
                                                {device.percentage}%
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <EmptyState message='No device data yet' />
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className='flex items-center gap-2 text-lg'>
                            <Globe className='h-5 w-5' />
                            Browsers
                        </CardTitle>
                        <CardDescription>Browser distribution</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {browserBreakdown.length > 0 ? (
                            <BrowserChart data={browserBreakdown} />
                        ) : (
                            <EmptyState message='No browser data yet' />
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className='flex items-center gap-2 text-lg'>
                            <Globe className='h-5 w-5' />
                            Countries
                        </CardTitle>
                        <CardDescription>
                            Geographic distribution
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {geoDistribution.length > 0 ? (
                            <GeoTable data={geoDistribution} />
                        ) : (
                            <EmptyState message='No geo data yet' />
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Top Page Path List */}
            <Card>
                <CardHeader>
                    <CardTitle className='text-lg'>Page Details</CardTitle>
                    <CardDescription>
                        Detailed breakdown of top pages
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {topPages.length > 0 ? (
                        <div className='space-y-3'>
                            <div className='grid grid-cols-12 gap-4 border-b pb-2 text-xs font-medium text-stone-500'>
                                <div className='col-span-1'>#</div>
                                <div className='col-span-5'>Page</div>
                                <div className='col-span-3 text-right'>
                                    Views
                                </div>
                                <div className='col-span-3 text-right'>
                                    Sessions
                                </div>
                            </div>
                            {topPages.map((page, index) => (
                                <div
                                    key={page.pagePath}
                                    className='grid grid-cols-12 gap-4 text-sm'
                                >
                                    <div className='col-span-1 text-stone-400'>
                                        {index + 1}
                                    </div>
                                    <div className='col-span-5'>
                                        <p
                                            className='truncate font-medium'
                                            title={
                                                page.pageTitle ?? page.pagePath
                                            }
                                        >
                                            {page.pageTitle ?? page.pagePath}
                                        </p>
                                        <p
                                            className='text-muted-foreground truncate text-xs'
                                            title={page.pagePath}
                                        >
                                            {page.pagePath}
                                        </p>
                                    </div>
                                    <div className='col-span-3 text-right tabular-nums'>
                                        {page.views.toLocaleString()}
                                    </div>
                                    <div className='text-muted-foreground col-span-3 text-right tabular-nums'>
                                        {page.uniqueSessions.toLocaleString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <EmptyState message='No page data yet. Views will appear after visitors browse your site.' />
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

// ============================================================================
// Helper Components
// ============================================================================

type StatsCardProps = {
    title: string
    value: string
    description: string
    icon: React.ComponentType<{ className?: string }>
}

function StatsCard({ title, value, description, icon: Icon }: StatsCardProps) {
    return (
        <Card>
            <CardHeader className='flex flex-row items-center justify-between pb-2'>
                <CardTitle className='text-muted-foreground text-sm font-medium'>
                    {title}
                </CardTitle>
                <Icon className='text-muted-foreground h-4 w-4' />
            </CardHeader>
            <CardContent>
                <div className='truncate text-2xl font-bold'>{value}</div>
                <p className='text-muted-foreground mt-1 text-xs'>
                    {description}
                </p>
            </CardContent>
        </Card>
    )
}

function EmptyState({ message }: { message: string }) {
    return (
        <div className='flex h-[200px] items-center justify-center'>
            <p className='text-muted-foreground text-sm'>{message}</p>
        </div>
    )
}
