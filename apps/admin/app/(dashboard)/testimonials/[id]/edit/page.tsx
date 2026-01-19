import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { notFound } from 'next/navigation'

import { Button } from '@workspace/ui/components/button'

import { TestimonialForm } from '@/components/testimonials/testimonial-form.component'
import {
    getTestimonialById,
    getInstagramPostsForSelection,
} from '@/lib/queries/testimonial.query'
import { DeleteTestimonialButton } from './delete-button.component'

export const dynamic = 'force-dynamic'

type Params = Promise<{ id: string }>

export default async function EditTestimonialPage({
    params,
}: {
    params: Params
}) {
    const { id } = await params

    const [testimonial, { posts: instagramPosts }] = await Promise.all([
        getTestimonialById(id),
        getInstagramPostsForSelection({
            pageSize: 100,
        }),
    ])

    if (!testimonial) {
        notFound()
    }

    return (
        <div className='space-y-6'>
            {/* Header */}
            <div className='flex items-center justify-between'>
                <div className='flex items-center gap-4'>
                    <Button variant='ghost' size='sm' asChild>
                        <Link href='/testimonials'>
                            <ChevronLeft className='mr-1 h-4 w-4' />
                            Back
                        </Link>
                    </Button>
                    <div>
                        <h1 className='text-2xl font-semibold'>
                            Edit Testimonial
                        </h1>
                        <p className='text-muted-foreground'>
                            {testimonial.patientName} - {testimonial.procedure}
                        </p>
                    </div>
                </div>
                <DeleteTestimonialButton
                    testimonialId={testimonial.id}
                    patientName={testimonial.patientName}
                />
            </div>

            {/* Form */}
            <TestimonialForm
                mode='edit'
                initialData={testimonial}
                instagramPosts={instagramPosts}
            />
        </div>
    )
}
