import { cn } from '@workspace/ui/lib/utils'
import { Button } from '@workspace/ui/components/button'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

import { getGalleryMediaByProcedure } from '@/lib/queries/gallery/procedure-galleries.query'
import { ContentWrapper } from '@/components/shared/content-wrapper.component'
import { SectionContainer } from '@/components/shared/section-container.component'

type ProcedureGallerySectionProps = {
    /** The procedure page slug to fetch gallery media for */
    readonly procedureSlug: string
    /** Optional procedure title for the section header */
    readonly procedureTitle?: string
    /** Number of preview images to display (default: 6, configurable 4-6) */
    readonly previewCount?: 4 | 5 | 6
    /** Additional CSS classes */
    readonly className?: string
}

/**
 * Procedure Gallery Section
 *
 * A server component that displays inline gallery images from groups
 * linked to a specific procedure. Designed to be placed on procedure pages
 * to showcase additional patient photos beyond before/after pairs.
 *
 * Features:
 * - Server-side data fetching with caching
 * - Responsive grid layout (3 cols desktop, 2 tablet, 1 mobile)
 * - Configurable preview count (4-6 images)
 * - CTA button linking to full gallery
 * - Graceful handling when no images exist
 */
export async function ProcedureGallerySection({
    procedureSlug,
    procedureTitle,
    previewCount = 6,
    className,
}: ProcedureGallerySectionProps) {
    const { media, groupSlug } = await getGalleryMediaByProcedure(
        procedureSlug,
        previewCount
    )

    // Don't render anything if no media is available
    if (media.length === 0 || !groupSlug) {
        return null
    }

    const displayTitle = procedureTitle
        ? `${procedureTitle} Gallery`
        : 'Patient Gallery'

    return (
        <SectionContainer
            id='procedure-gallery'
            variant='default'
            className={cn('bg-white', className)}
        >
            <ContentWrapper>
                {/* Section Header */}
                <div className='mb-12 md:mb-16'>
                    <div className='mx-auto max-w-3xl text-center'>
                        {/* Badge */}
                        <div className='mb-4 flex justify-center'>
                            <span className='text-gold-500 text-sm font-bold tracking-[0.2em] uppercase'>
                                Gallery
                            </span>
                        </div>

                        {/* Title */}
                        <h2 className='mb-6 font-serif text-4xl text-stone-900 md:text-5xl'>
                            {displayTitle.includes('Gallery') ? (
                                <>
                                    {displayTitle.replace(' Gallery', '')}{' '}
                                    <span className='text-gold-600'>
                                        Gallery
                                    </span>
                                </>
                            ) : (
                                <>
                                    Patient{' '}
                                    <span className='text-gold-600'>
                                        Gallery
                                    </span>
                                </>
                            )}
                        </h2>

                        {/* Description */}
                        <p className='text-lg leading-relaxed font-light text-stone-600'>
                            Browse our collection of patient photos showcasing
                            real results and transformations.
                        </p>
                    </div>
                </div>

                {/* Gallery Grid */}
                <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
                    {media.map((item) => (
                        <div
                            key={item.id}
                            className='group relative aspect-square overflow-hidden rounded-lg bg-stone-100'
                        >
                            <Image
                                src={item.thumbnailUrl ?? item.url}
                                alt={item.alt}
                                fill
                                className='object-cover transition-transform duration-300 group-hover:scale-105'
                                sizes='(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw'
                                placeholder={
                                    item.blurDataUrl ? 'blur' : 'empty'
                                }
                                blurDataURL={item.blurDataUrl ?? undefined}
                            />
                        </div>
                    ))}
                </div>

                {/* CTA */}
                <div className='mt-12 text-center md:mt-16'>
                    <Button
                        asChild
                        variant='outline'
                        size='lg'
                        className='group hover:border-gold-500 hover:bg-gold-50 border-stone-300'
                    >
                        <Link href={`/gallery/${groupSlug}`}>
                            <span>View Full Gallery</span>
                            <ArrowRight className='ml-2 h-4 w-4 transition-transform group-hover:translate-x-1' />
                        </Link>
                    </Button>
                </div>
            </ContentWrapper>
        </SectionContainer>
    )
}
