/**
 * Google Reviews Page
 *
 * Manage and display Google reviews.
 *
 * @module app/(dashboard)/reviews/page
 */
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent } from '@workspace/ui/components/card'
import { ArrowLeft, Settings, AlertCircle, Star } from 'lucide-react'
import Link from 'next/link'

import {
    getGoogleReviews,
    getGoogleReviewsSettings,
    getGoogleReviewsStats,
} from '@/lib/queries/google-reviews.query'
import { ReviewsGrid } from '@/components/reviews/reviews-grid.component'
import { SyncReviewsButton } from '@/components/reviews/sync-reviews-button.component'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

export default async function GoogleReviewsPage() {
    const [settings, reviewsData, stats] = await Promise.all([
        getGoogleReviewsSettings(),
        getGoogleReviews({
            page: 1,
            pageSize: 50,
            sortBy: 'date',
            sortDirection: 'desc',
        }),
        getGoogleReviewsStats(),
    ])

    const isConfigured = !!(settings?.locationId && settings?.isEnabled)
    const isConnected = !!(settings?.accessToken && settings?.refreshToken)

    return (
        <div className='space-y-6'>
            {/* Header */}
            <div className='flex items-center justify-between'>
                <div className='flex items-center gap-4'>
                    <Button variant='ghost' size='icon' asChild>
                        <Link href='/' aria-label='Back'>
                            <ArrowLeft className='h-4 w-4' aria-hidden='true' />
                        </Link>
                    </Button>
                    <div>
                        <h1 className='text-2xl font-semibold'>
                            Google Reviews
                        </h1>
                        <p className='text-muted-foreground'>
                            Manage reviews from Google Business Profile
                        </p>
                    </div>
                </div>
                <div className='flex items-center gap-2'>
                    <Button variant='outline' asChild>
                        <Link href='/reviews/settings'>
                            <Settings className='mr-2 h-4 w-4' />
                            Settings
                        </Link>
                    </Button>
                    <SyncReviewsButton disabled={!isConfigured} />
                </div>
            </div>

            {/* Not Connected Warning */}
            {!isConnected && (
                <Card className='border-yellow-200 bg-yellow-50'>
                    <CardContent className='flex items-center gap-4 pt-6'>
                        <AlertCircle className='h-5 w-5 text-yellow-600' />
                        <div className='flex-1'>
                            <p className='font-medium text-yellow-800'>
                                Google Reviews not connected
                            </p>
                            <p className='text-sm text-yellow-700'>
                                Connect your Google Business Profile to sync and
                                display reviews.
                            </p>
                        </div>
                        <Button asChild variant='outline' size='sm'>
                            <Link href='/reviews/settings'>Connect Now</Link>
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Not Enabled Warning */}
            {isConnected && !isConfigured && (
                <Card className='border-yellow-200 bg-yellow-50'>
                    <CardContent className='flex items-center gap-4 pt-6'>
                        <AlertCircle className='h-5 w-5 text-yellow-600' />
                        <div className='flex-1'>
                            <p className='font-medium text-yellow-800'>
                                Integration not enabled
                            </p>
                            <p className='text-sm text-yellow-700'>
                                Select a business location and enable the
                                integration in settings.
                            </p>
                        </div>
                        <Button asChild variant='outline' size='sm'>
                            <Link href='/reviews/settings'>Configure</Link>
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Stats */}
            {isConfigured && stats.totalReviews > 0 && (
                <div className='grid gap-4 md:grid-cols-4'>
                    <Card>
                        <CardContent className='pt-6'>
                            <div className='flex items-center justify-between'>
                                <div>
                                    <p className='text-muted-foreground text-sm'>
                                        Total Reviews
                                    </p>
                                    <p className='text-2xl font-bold'>
                                        {stats.totalReviews}
                                    </p>
                                </div>
                                <Star className='text-muted-foreground h-8 w-8' />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className='pt-6'>
                            <div className='flex items-center justify-between'>
                                <div>
                                    <p className='text-muted-foreground text-sm'>
                                        Published
                                    </p>
                                    <p className='text-2xl font-bold'>
                                        {stats.publishedReviews}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className='pt-6'>
                            <div className='flex items-center justify-between'>
                                <div>
                                    <p className='text-muted-foreground text-sm'>
                                        High Rating (4+)
                                    </p>
                                    <p className='text-2xl font-bold'>
                                        {stats.highRatingReviews}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className='pt-6'>
                            <div className='flex items-center justify-between'>
                                <div>
                                    <p className='text-muted-foreground text-sm'>
                                        Average Rating
                                    </p>
                                    <p className='text-2xl font-bold'>
                                        {stats.averageRating?.toFixed(1) ??
                                            'N/A'}
                                    </p>
                                </div>
                                <Star className='h-8 w-8 fill-yellow-400 text-yellow-400' />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Reviews Grid */}
            <ReviewsGrid
                reviews={reviewsData.reviews}
                total={reviewsData.total}
            />
        </div>
    )
}
