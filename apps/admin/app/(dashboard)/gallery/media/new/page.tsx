import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

import { Button } from '@workspace/ui/components/button'

import { MediaForm } from '@/components/gallery/media-form.component'
import { getGalleryGroupsWithSlug } from '@/lib/queries/gallery.query'

export const dynamic = 'force-dynamic'

export default async function NewMediaPage() {
    const groups = await getGalleryGroupsWithSlug()

    return (
        <div className='space-y-6'>
            {/* Header */}
            <div className='flex items-center gap-4'>
                <Button variant='ghost' size='sm' asChild>
                    <Link href='/gallery/media'>
                        <ChevronLeft className='mr-1 h-4 w-4' />
                        Back
                    </Link>
                </Button>
                <div>
                    <h1 className='text-2xl font-semibold'>Upload Media</h1>
                    <p className='text-muted-foreground'>
                        Add a new image or video to your gallery
                    </p>
                </div>
            </div>

            {/* Form */}
            <MediaForm groups={groups} mode='create' />
        </div>
    )
}
