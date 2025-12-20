/**
 * Social Media Dashboard Page
 *
 * Overview of social media integrations with stats and quick actions.
 *
 * @module app/(dashboard)/social-media/page
 */
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import {
    Instagram,
    Settings,
    Image,
    Star,
    Clock,
    ExternalLink,
} from 'lucide-react'
import Link from 'next/link'

import {
    getSocialMediaStats,
    getInstagramSettings,
} from '@/lib/queries/social-media.query'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

export default async function SocialMediaDashboardPage() {
    const [stats, settings] = await Promise.all([
        getSocialMediaStats(),
        getInstagramSettings(),
    ])

    const isConfigured = !!settings?.handle
    const isEnabled = settings?.isEnabled ?? false

    return (
        <div className='space-y-6'>
            {/* Header */}
            <div className='flex items-center justify-between'>
                <div>
                    <h1 className='text-2xl font-semibold'>Social Media</h1>
                    <p className='text-muted-foreground'>
                        Manage social media integrations and content
                    </p>
                </div>
                <div className='flex items-center gap-3'>
                    <Button asChild variant='outline' size='sm'>
                        <Link href='/social-media/settings'>
                            <Settings className='mr-2 h-4 w-4' />
                            Settings
                        </Link>
                    </Button>
                    <Button asChild size='sm'>
                        <Link href='/social-media/instagram'>
                            <Instagram className='mr-2 h-4 w-4' />
                            View Posts
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Instagram Integration Card */}
            <Card>
                <CardHeader>
                    <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-3'>
                            <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500'>
                                <Instagram className='h-5 w-5 text-white' />
                            </div>
                            <div>
                                <CardTitle>Instagram</CardTitle>
                                <CardDescription>
                                    {isConfigured
                                        ? `@${settings?.handle}`
                                        : 'Not configured'}
                                </CardDescription>
                            </div>
                        </div>
                        <Badge variant={isEnabled ? 'default' : 'secondary'}>
                            {isEnabled ? 'Enabled' : 'Disabled'}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    {!isConfigured ? (
                        <div className='py-6 text-center'>
                            <p className='text-muted-foreground mb-4'>
                                Configure your Instagram handle to start syncing
                                posts
                            </p>
                            <Button asChild>
                                <Link href='/social-media/settings'>
                                    Configure Instagram
                                </Link>
                            </Button>
                        </div>
                    ) : (
                        <div className='grid gap-4 md:grid-cols-4'>
                            <div className='rounded-lg border p-4'>
                                <div className='flex items-center gap-2'>
                                    <Image className='text-muted-foreground h-4 w-4' />
                                    <span className='text-muted-foreground text-sm'>
                                        Total Posts
                                    </span>
                                </div>
                                <p className='mt-2 text-2xl font-bold'>
                                    {stats.totalPosts}
                                </p>
                            </div>
                            <div className='rounded-lg border p-4'>
                                <div className='flex items-center gap-2'>
                                    <ExternalLink className='text-muted-foreground h-4 w-4' />
                                    <span className='text-muted-foreground text-sm'>
                                        Published
                                    </span>
                                </div>
                                <p className='mt-2 text-2xl font-bold'>
                                    {stats.publishedPosts}
                                </p>
                            </div>
                            <div className='rounded-lg border p-4'>
                                <div className='flex items-center gap-2'>
                                    <Star className='text-muted-foreground h-4 w-4' />
                                    <span className='text-muted-foreground text-sm'>
                                        Featured
                                    </span>
                                </div>
                                <p className='mt-2 text-2xl font-bold'>
                                    {stats.featuredPosts}
                                </p>
                            </div>
                            <div className='rounded-lg border p-4'>
                                <div className='flex items-center gap-2'>
                                    <Clock className='text-muted-foreground h-4 w-4' />
                                    <span className='text-muted-foreground text-sm'>
                                        Last Sync
                                    </span>
                                </div>
                                <p className='mt-2 text-sm font-medium'>
                                    {stats.lastSyncAt
                                        ? new Date(
                                              stats.lastSyncAt
                                          ).toLocaleDateString('en-US', {
                                              month: 'short',
                                              day: 'numeric',
                                              hour: '2-digit',
                                              minute: '2-digit',
                                          })
                                        : 'Never'}
                                </p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Quick Actions */}
            {isConfigured && (
                <div className='grid gap-4 md:grid-cols-2'>
                    <Card>
                        <CardHeader>
                            <CardTitle className='text-lg'>
                                Instagram Posts
                            </CardTitle>
                            <CardDescription>
                                View and manage synced Instagram content
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button
                                asChild
                                variant='outline'
                                className='w-full'
                            >
                                <Link href='/social-media/instagram'>
                                    <Instagram className='mr-2 h-4 w-4' />
                                    View All Posts
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className='text-lg'>
                                Integration Settings
                            </CardTitle>
                            <CardDescription>
                                Configure API keys and sync preferences
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button
                                asChild
                                variant='outline'
                                className='w-full'
                            >
                                <Link href='/social-media/settings'>
                                    <Settings className='mr-2 h-4 w-4' />
                                    Manage Settings
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}
