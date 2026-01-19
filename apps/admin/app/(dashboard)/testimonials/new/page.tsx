import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

import { Button } from '@workspace/ui/components/button'

import { TestimonialForm } from '@/components/testimonials/testimonial-form.component'
import { getInstagramPostsForSelection } from '@/lib/queries/testimonial.query'

export const dynamic = 'force-dynamic'

export default async function NewTestimonialPage() {
    // Fetch Instagram posts for the picker (all media types)
    const { posts: instagramPosts } = await getInstagramPostsForSelection({
        pageSize: 100,
    })

    return (
        <div className='space-y-6'>
            {/* Header */}
            <div className='flex items-center gap-4'>
                <Button variant='ghost' size='sm' asChild>
                    <Link href='/testimonials'>
                        <ChevronLeft className='mr-1 h-4 w-4' />
                        Back
                    </Link>
                </Button>
                <div>
                    <h1 className='text-2xl font-semibold'>Add Testimonial</h1>
                    <p className='text-muted-foreground'>
                        Create a new patient testimonial
                    </p>
                </div>
            </div>

            {/* Form */}
            <TestimonialForm mode='create' instagramPosts={instagramPosts} />
        </div>
    )
}
