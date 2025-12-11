import { Button } from '@workspace/ui/components/button'
import { Card, CardContent } from '@workspace/ui/components/card'
import { ArrowLeft, Settings, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import {
    getInstagramPosts,
    getInstagramSettings,
} from '@/lib/queries/social-media.query'
import { InstagramPostsFeed } from '@/components/social-media/instagram-posts-feed.component'
import { SyncButton } from '@/components/social-media/sync-button.component'
import { InstagramProfileHeader } from '@/components/social-media/instagram-profile-header.component'

export const dynamic = 'force-dynamic'

export default async function InstagramPostsPage() {
    const [settings, postsData] = await Promise.all([
        getInstagramSettings(),
        getInstagramPosts({
            page: 1,
            pageSize: 20,
            sortBy: 'date',
            sortDirection: 'desc',
        }),
    ])

    const isConfigured = settings?.handle && settings?.isEnabled
    const hasApiKey = !!settings?.apiKey

    return (
        <div className='space-y-6'>
            {/* Header */}
            <div className='flex items-center justify-between'>
                <div className='flex items-center gap-4'>
                    <Button variant='ghost' size='icon' asChild>
                        <Link href='/social-media'>
                            <ArrowLeft className='h-4 w-4' />
                        </Link>
                    </Button>
                    <div>
                        <h1 className='text-2xl font-semibold'>
                            Instagram Posts
                        </h1>
                        <p className='text-muted-foreground'>
                            Manage and sync content from your Instagram profile
                        </p>
                    </div>
                </div>
                <div className='flex items-center gap-2'>
                    <Button variant='outline' asChild>
                        <Link href='/social-media/settings'>
                            <Settings className='mr-2 h-4 w-4' />
                            Settings
                        </Link>
                    </Button>
                    <SyncButton disabled={!isConfigured || !hasApiKey} />
                </div>
            </div>

            {/* Configuration Warning */}
            {!isConfigured && (
                <Card className='border-yellow-200 bg-yellow-50'>
                    <CardContent className='flex items-center gap-4 pt-6'>
                        <AlertCircle className='h-5 w-5 text-yellow-600' />
                        <div className='flex-1'>
                            <p className='font-medium text-yellow-800'>
                                Instagram not configured
                            </p>
                            <p className='text-sm text-yellow-700'>
                                Please configure your Instagram handle in
                                settings to start syncing posts.
                            </p>
                        </div>
                        <Button asChild variant='outline' size='sm'>
                            <Link href='/social-media/settings'>
                                Configure Now
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* API Key Warning */}
            {isConfigured && !hasApiKey && (
                <Card className='border-yellow-200 bg-yellow-50'>
                    <CardContent className='flex items-center gap-4 pt-6'>
                        <AlertCircle className='h-5 w-5 text-yellow-600' />
                        <div className='flex-1'>
                            <p className='font-medium text-yellow-800'>
                                API key not configured
                            </p>
                            <p className='text-sm text-yellow-700'>
                                Add your ScrapeSocial API key in settings or set
                                the SCRAPE_SOCIAL_API_KEY environment variable.
                            </p>
                        </div>
                        <Button asChild variant='outline' size='sm'>
                            <Link href='/social-media/settings'>
                                Add API Key
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Profile Header */}
            {isConfigured && settings && (
                <InstagramProfileHeader profile={settings} />
            )}

            {/* Posts Grid */}
            <InstagramPostsFeed
                initialPosts={postsData.posts}
                total={postsData.total}
                profile={
                    settings
                        ? {
                              handle: settings.handle,
                              profilePictureUrl: settings.profilePictureUrl,
                              fullName: settings.fullName,
                          }
                        : null
                }
                defaultSortBy='date'
                defaultSortDirection='desc'
            />
        </div>
    )
}
