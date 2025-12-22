import { Suspense } from 'react'
import { Lightbulb } from 'lucide-react'

import { IdeasPipelineClient } from '@/components/blog/ideas/ideas-pipeline-client.component'
import { IdeasPipelineSkeleton } from '@/components/blog/ideas/ideas-pipeline-skeleton.component'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

export const metadata = {
    title: 'Blog Ideas | Admin',
    description: 'Manage blog post ideas, track progress, and generate content',
}

export default function BlogIdeasPage() {
    return (
        <div className='space-y-6'>
            <div className='flex items-center gap-3'>
                <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100'>
                    <Lightbulb className='h-5 w-5 text-amber-600' />
                </div>
                <div>
                    <h1 className='text-2xl font-semibold'>Blog Ideas</h1>
                    <p className='text-muted-foreground'>
                        Brainstorm, plan, and track your content pipeline
                    </p>
                </div>
            </div>

            <Suspense fallback={<IdeasPipelineSkeleton />}>
                <IdeasPipelineClient />
            </Suspense>
        </div>
    )
}
