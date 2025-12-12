/**
 * Analysis List Page
 *
 * Lists all media analysis sessions with filtering and pagination.
 * Shows status, source, stats, and links to view results.
 *
 * @module app/(dashboard)/analysis/page
 */
import { Suspense } from 'react'
import Link from 'next/link'
import { Sparkles, Plus } from 'lucide-react'

import { Button } from '@workspace/ui/components/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card'

import {
    listAnalyses,
    getAnalysisStatusCounts,
} from '@/lib/queries/media-analysis.query'
import { AnalysisListClient } from './analysis-list-client.component'

export const metadata = {
    title: 'Media Analysis | Admin Dashboard',
    description: 'View and manage AI media analysis sessions',
}

export default async function AnalysisPage({
    searchParams,
}: {
    searchParams: Promise<{
        page?: string
        status?: string
        source?: string
    }>
}) {
    const params = await searchParams
    const page = params.page ? parseInt(params.page) : 1
    const status = params.status as
        | 'pending'
        | 'analyzing'
        | 'completed'
        | 'applied'
        | 'failed'
        | undefined
    const source = params.source as 'instagram' | 'gallery' | undefined

    const [result, statusCounts] = await Promise.all([
        listAnalyses({ status, source }, { page, pageSize: 20 }),
        getAnalysisStatusCounts(),
    ])

    return (
        <div className='space-y-6'>
            {/* Header */}
            <div className='flex items-center justify-between'>
                <div>
                    <h1 className='text-3xl font-bold'>Media Analysis</h1>
                    <p className='text-muted-foreground mt-1'>
                        View and manage AI analysis sessions
                    </p>
                </div>
                <Button asChild>
                    <Link href='/social-media/instagram/analyze'>
                        <Plus className='mr-2 h-4 w-4' />
                        New Analysis
                    </Link>
                </Button>
            </div>

            {/* Stats */}
            <div className='grid gap-4 md:grid-cols-5'>
                <Card>
                    <CardHeader className='pb-2'>
                        <CardTitle className='text-sm font-medium'>
                            Total
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className='text-2xl font-bold'>{result.total}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className='pb-2'>
                        <CardTitle className='text-sm font-medium'>
                            Pending
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className='text-2xl font-bold'>
                            {statusCounts.pending}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className='pb-2'>
                        <CardTitle className='text-sm font-medium'>
                            Analyzing
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className='text-2xl font-bold text-blue-600'>
                            {statusCounts.analyzing}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className='pb-2'>
                        <CardTitle className='text-sm font-medium'>
                            Completed
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className='text-2xl font-bold text-green-600'>
                            {statusCounts.completed}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className='pb-2'>
                        <CardTitle className='text-sm font-medium'>
                            Applied
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className='text-2xl font-bold text-purple-600'>
                            {statusCounts.applied}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Analysis List */}
            <Suspense fallback={<div>Loading...</div>}>
                <AnalysisListClient
                    initialData={result}
                    initialFilters={{ status, source }}
                />
            </Suspense>
        </div>
    )
}
