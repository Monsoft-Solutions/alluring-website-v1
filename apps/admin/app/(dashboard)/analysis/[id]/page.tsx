/**
 * Analysis Result Page
 *
 * View and edit a specific analysis session with full result data.
 * Allows editing group assignments and applying results even after initial application.
 *
 * @module app/(dashboard)/analysis/[id]/page
 */
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { Button } from '@workspace/ui/components/button'

import { getAnalysisById } from '@/lib/queries/media-analysis.query'
import { getGalleryGroupsForAI } from '@/lib/queries/gallery.query'
import { AnalysisResultClient } from './analysis-result-client.component'

export async function generateMetadata({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const analysis = await getAnalysisById(id)

    if (!analysis) {
        return {
            title: 'Analysis Not Found',
        }
    }

    return {
        title: `${analysis.name} | Analysis`,
        description: `View analysis results for ${analysis.name}`,
    }
}

export default async function AnalysisResultPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const [analysis, galleryGroups] = await Promise.all([
        getAnalysisById(id),
        getGalleryGroupsForAI(),
    ])

    if (!analysis || !analysis.resultData) {
        notFound()
    }

    return (
        <div className='space-y-6'>
            {/* Header */}
            <div>
                <Button asChild variant='ghost' size='sm' className='mb-4'>
                    <Link href='/analysis'>
                        <ArrowLeft className='mr-2 h-4 w-4' />
                        Back to Analyses
                    </Link>
                </Button>
                <h1 className='text-3xl font-bold'>{analysis.name}</h1>
                <p className='text-muted-foreground mt-1'>
                    {new Date(analysis.startedAt).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                    })}
                </p>
            </div>

            {/* Result Component */}
            <AnalysisResultClient
                analysis={analysis}
                galleryGroups={galleryGroups}
            />
        </div>
    )
}
