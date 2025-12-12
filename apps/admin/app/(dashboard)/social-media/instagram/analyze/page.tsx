/**
 * Instagram Bulk Analysis Page
 *
 * Page for selecting and analyzing Instagram posts in bulk.
 * Shows detected B&A pairs for review before applying.
 *
 * @module app/(dashboard)/social-media/instagram/analyze/page
 */
import { Button } from '@workspace/ui/components/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

import {
    getInstagramPosts,
    getAnalysisStatusCounts,
} from '@/lib/queries/social-media.query'
import { AnalyzePageClient } from './analyze-page-client.component'

export const dynamic = 'force-dynamic'

export default async function InstagramAnalyzePage() {
    const [postsData, statusCounts] = await Promise.all([
        getInstagramPosts({
            page: 1,
            pageSize: 24, // Initial page size for better UX
            sortBy: 'date',
            sortDirection: 'desc',
            analysisStatus: 'pending', // Default to pending status
            mediaType: 'all', // Default to all media types
        }),
        getAnalysisStatusCounts(),
    ])

    // Filter to only show images and carousels (skip videos)
    const analyzablePosts = postsData.posts.filter(
        (p) => p.mediaType !== 'video'
    )

    return (
        <div className='space-y-6'>
            {/* Header */}
            <div className='flex items-center justify-between'>
                <div className='flex items-center gap-4'>
                    <Button variant='ghost' size='icon' asChild>
                        <Link
                            href='/social-media/instagram'
                            aria-label='Back to Instagram'
                        >
                            <ArrowLeft className='h-4 w-4' aria-hidden='true' />
                        </Link>
                    </Button>
                    <div>
                        <h1 className='text-2xl font-semibold'>
                            Bulk Analysis
                        </h1>
                        <p className='text-muted-foreground'>
                            Analyze Instagram posts to detect Before/After pairs
                            and classify content
                        </p>
                    </div>
                </div>
            </div>

            {/* Status Overview */}
            <div className='grid gap-4 md:grid-cols-4'>
                <div className='rounded-lg border p-4'>
                    <p className='text-muted-foreground text-sm'>Pending</p>
                    <p className='text-2xl font-bold'>{statusCounts.pending}</p>
                </div>
                <div className='rounded-lg border p-4'>
                    <p className='text-muted-foreground text-sm'>Analyzed</p>
                    <p className='text-2xl font-bold'>
                        {statusCounts.analyzed}
                    </p>
                </div>
                <div className='rounded-lg border p-4'>
                    <p className='text-muted-foreground text-sm'>Reviewed</p>
                    <p className='text-2xl font-bold'>
                        {statusCounts.reviewed}
                    </p>
                </div>
                <div className='rounded-lg border p-4'>
                    <p className='text-muted-foreground text-sm'>Applied</p>
                    <p className='text-2xl font-bold'>{statusCounts.applied}</p>
                </div>
            </div>

            {/* Client Component for Interactive Parts */}
            <AnalyzePageClient
                initialPosts={analyzablePosts}
                initialTotal={postsData.total}
                statusCounts={statusCounts}
            />
        </div>
    )
}
