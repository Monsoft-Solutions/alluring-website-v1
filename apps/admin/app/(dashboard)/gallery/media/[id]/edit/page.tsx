import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'

import { Button } from '@workspace/ui/components/button'

import { MediaForm } from '@/components/gallery/media-form.component'
import { DeleteMediaButton } from './delete-button.component'
import {
    getGalleryGroupsWithSlug,
    getGalleryMediaById,
} from '@/lib/queries/gallery.query'

export const dynamic = 'force-dynamic'

type PageProps = {
    params: Promise<{ id: string }>
}

export default async function EditMediaPage({ params }: PageProps) {
    const { id } = await params

    const [media, groups] = await Promise.all([
        getGalleryMediaById(id),
        getGalleryGroupsWithSlug(),
    ])

    if (!media) {
        notFound()
    }

    return (
        <div className='space-y-6'>
            {/* Header */}
            <div className='flex items-center justify-between'>
                <div className='flex items-center gap-4'>
                    <Button variant='ghost' size='sm' asChild>
                        <Link href='/gallery/media'>
                            <ChevronLeft className='mr-1 h-4 w-4' />
                            Back
                        </Link>
                    </Button>
                    <div>
                        <h1 className='text-2xl font-semibold'>Edit Media</h1>
                        <p className='text-muted-foreground'>
                            Update media details and settings
                        </p>
                    </div>
                </div>
                <DeleteMediaButton id={id} title={media.title} />
            </div>

            {/* Form */}
            <MediaForm
                groups={groups}
                initialData={{
                    id: media.id,
                    type: media.type,
                    url: media.url,
                    thumbnailUrl: media.thumbnailUrl,
                    title: media.title,
                    description: media.description,
                    alt: media.alt,
                    seoTitle: media.seoTitle,
                    seoDescription: media.seoDescription,
                    slug: media.slug,
                    width: media.width,
                    height: media.height,
                    duration: media.duration,
                    fileSize: media.fileSize,
                    mimeType: media.mimeType,
                    originalFilename: media.originalFilename,
                    blurDataUrl: media.blurDataUrl,
                    isFeatured: media.isFeatured,
                    isBeforeAfter: media.isBeforeAfter,
                    displayOrder: media.displayOrder,
                    status: media.status,
                    groupIds: media.groupIds,
                    aiAnalysis: media.aiAnalysis,
                }}
                mode='edit'
            />
        </div>
    )
}
