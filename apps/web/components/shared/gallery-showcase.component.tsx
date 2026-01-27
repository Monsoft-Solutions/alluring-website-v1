import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

import { getFeaturedGalleryMedia } from '@/lib/queries/gallery/gallery-list.query'

import { SectionContainer } from './section-container.component'
import { ContentWrapper } from './content-wrapper.component'
import { GalleryShowcaseClient } from './gallery-showcase-client'

type GalleryShowcaseProps = {
    /** Section ID for anchor links */
    readonly id?: string
    /** Badge text above title */
    readonly badge?: string
    /** Section title */
    readonly title?: string
    /** Section description */
    readonly description?: string
    /** Number of images to display */
    readonly limit?: number
    /** Background variant */
    readonly variant?: 'default' | 'muted'
    /** Whether to show the "View Full Gallery" CTA */
    readonly showCta?: boolean
}

/**
 * Gallery Showcase Component
 *
 * Server component that fetches featured gallery images
 * and renders an interactive gallery showcase with hero image
 * and thumbnail carousel navigation.
 *
 * Features:
 * - Hero image with lightbox on click
 * - Thumbnail carousel for navigation
 * - Procedure type badges
 * - Mobile-optimized layout
 */
export async function GalleryShowcase({
    id = 'gallery',
    badge = 'The Evidence',
    title = 'Real Results.',
    description = 'See the artistry of our board-certified surgeons. Browse our verified patient transformations.',
    limit = 6,
    variant = 'default',
    showCta = true,
}: GalleryShowcaseProps) {
    // Fetch featured gallery media
    const { media } = await getFeaturedGalleryMedia(limit)

    // Don't render section if no media available
    if (media.length === 0) {
        return null
    }

    return (
        <SectionContainer
            id={id}
            variant={variant}
            className={variant === 'muted' ? 'bg-stone-50' : 'bg-white'}
            paddingY='py-24 md:py-32'
        >
            <ContentWrapper size='lg' paddingX='px-6 md:px-12'>
                {/* Section Header */}
                <div className='mx-auto mb-12 max-w-3xl text-center md:mb-16'>
                    <span className='text-gold-500 mb-3 block text-sm font-bold tracking-widest uppercase'>
                        {badge}
                    </span>
                    <h2 className='mb-6 font-serif text-4xl text-stone-900 md:text-5xl lg:text-6xl'>
                        {title}
                    </h2>
                    <p className='text-xl font-light text-stone-600'>
                        {description}
                    </p>
                </div>

                {/* Interactive Gallery Client Component */}
                <GalleryShowcaseClient media={media} />

                {/* View Full Gallery CTA */}
                {showCta && (
                    <div className='mt-12 text-center md:mt-16'>
                        <Link
                            href='/gallery'
                            className='inline-flex items-center gap-2 border border-stone-200 bg-white px-8 py-4 text-sm font-bold tracking-widest text-stone-900 uppercase transition-colors hover:bg-stone-900 hover:text-white'
                        >
                            View Full Gallery <ArrowRight className='h-4 w-4' />
                        </Link>
                    </div>
                )}
            </ContentWrapper>
        </SectionContainer>
    )
}
