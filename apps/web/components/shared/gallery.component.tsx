/**
 * Gallery Component
 *
 * A reusable, mobile-first gallery component with lightbox functionality.
 * Uses yet-another-react-lightbox for optimal mobile experience, lazy loading,
 * and touch gesture support.
 *
 * Features:
 * - Mobile-first responsive design
 * - Lazy loading (built-in with yet-another-react-lightbox)
 * - Touch gesture support on mobile
 * - Keyboard navigation (ESC, arrow keys)
 * - Click-to-expand lightbox
 * - Configurable grid columns
 * - Hover overlay with captions
 * - Next.js Image optimization
 * - Accessibility (ARIA labels, keyboard navigation)
 *
 * @example
 * ```tsx
 * <Gallery
 *   images={[
 *     { url: '/images/project-1.jpg', alt: 'Project 1', caption: 'E-commerce platform' },
 *     { url: '/images/project-2.jpg', alt: 'Project 2', caption: 'Mobile app' }
 *   ]}
 *   columns={{ mobile: 1, tablet: 2, desktop: 3 }}
 *   aspectRatio="video"
 * />
 * ```
 */
'use client'

import { ImageObjectSchema } from '@workspace/seo/react'
import { cn } from '@workspace/ui/lib/utils'
import Image from 'next/image'
import { useState } from 'react'
import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'

import { siteConfig } from '@/lib/data/site-config'
import type { GalleryImage } from '@/lib/types/shared/gallery-image.type'

/**
 * Gallery Component Props
 */
export type GalleryProps = {
    /**
     * Array of gallery images to display
     */
    readonly images: GalleryImage[]

    /**
     * Grid column configuration per breakpoint
     * @default { mobile: 1, tablet: 2, desktop: 3 }
     */
    readonly columns?: {
        readonly mobile?: 1 | 2
        readonly tablet?: 2 | 3
        readonly desktop?: 3 | 4
    }

    /**
     * Image aspect ratio for consistent grid
     * @default "video"
     */
    readonly aspectRatio?: 'square' | 'video' | 'portrait'

    /**
     * Optional additional CSS classes for the gallery container
     */
    readonly className?: string

    /**
     * Whether to show captions on hover
     * @default true
     */
    readonly showCaptions?: boolean

    /**
     * Whether to include ImageObject schema for each image
     * @default false
     */
    readonly includeSchema?: boolean
}

/**
 * Gallery Component
 *
 * Core gallery component without section wrappers.
 * Consumers can add their own layout wrappers (SectionContainer, etc.) as needed.
 */
export function Gallery({
    images,
    columns = { mobile: 1, tablet: 2, desktop: 3 },
    aspectRatio = 'video',
    className,
    showCaptions = true,
    includeSchema = false,
}: GalleryProps) {
    const [lightboxIndex, setLightboxIndex] = useState(-1)

    const defaultAuthor = {
        '@type': 'Organization' as const,
        name: siteConfig.business.name,
    }

    // Handle empty images array
    if (!images || images.length === 0) {
        return null
    }

    // Convert GalleryImage to Lightbox slides format
    const lightboxSlides = images.map((image) => ({
        src: image.url,
        alt: image.alt,
        width: image.width,
        height: image.height,
        title: image.caption,
    }))

    const openLightbox = (index: number) => {
        setLightboxIndex(index)
    }

    const closeLightbox = () => {
        setLightboxIndex(-1)
    }

    // Build grid classes based on columns configuration
    const gridClasses = cn(
        'grid gap-4 md:gap-6',
        // Mobile columns
        columns.mobile === 1 && 'grid-cols-1',
        columns.mobile === 2 && 'grid-cols-2',
        // Tablet columns
        columns.tablet === 2 && 'md:grid-cols-2',
        columns.tablet === 3 && 'md:grid-cols-3',
        // Desktop columns
        columns.desktop === 3 && 'lg:grid-cols-3',
        columns.desktop === 4 && 'lg:grid-cols-4'
    )

    // Build aspect ratio classes
    const aspectRatioClasses = cn(
        aspectRatio === 'square' && 'aspect-square',
        aspectRatio === 'video' && 'aspect-video',
        aspectRatio === 'portrait' && 'aspect-[3/4]'
    )

    return (
        <>
            {includeSchema &&
                images.map((image, index) => (
                    <ImageObjectSchema
                        key={`schema-${index}`}
                        url={image.url}
                        alt={image.alt}
                        caption={image.caption}
                        width={image.width}
                        height={image.height}
                        author={defaultAuthor}
                        copyrightHolder={siteConfig.business.name}
                        name={image.alt || siteConfig.business.name}
                    />
                ))}
            {/* Gallery Grid */}
            <div className={cn(gridClasses, className)}>
                {images.map((image, index) => (
                    <GalleryImageCard
                        key={`gallery-image-${index}`}
                        image={image}
                        aspectRatioClasses={aspectRatioClasses}
                        showCaption={showCaptions}
                        onClick={() => openLightbox(index)}
                    />
                ))}
            </div>

            {/* Lightbox */}
            <Lightbox
                open={lightboxIndex >= 0}
                close={closeLightbox}
                index={lightboxIndex}
                slides={lightboxSlides}
                carousel={{
                    finite: true,
                }}
                render={{
                    buttonPrev: () => null,
                    buttonNext: () => null,
                }}
                styles={{
                    container: {
                        backgroundColor: 'rgba(0, 0, 0, 0.95)',
                    },
                }}
            />
        </>
    )
}

/**
 * Individual Gallery Image Card Component
 */
type GalleryImageCardProps = {
    readonly image: GalleryImage
    readonly aspectRatioClasses: string
    readonly showCaption: boolean
    readonly onClick: () => void
}

function GalleryImageCard({
    image,
    aspectRatioClasses,
    showCaption,
    onClick,
}: GalleryImageCardProps) {
    return (
        <button
            onClick={onClick}
            className={cn(
                'group relative w-full overflow-hidden rounded-xl',
                aspectRatioClasses,
                'hover:shadow-primary/10 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl',
                'focus:ring-primary focus:ring-2 focus:ring-offset-2 focus:outline-none'
            )}
            aria-label={`View ${image.alt} in full size`}
        >
            <Image
                src={image.url}
                alt={image.alt}
                fill
                className='object-cover transition-transform duration-300 group-hover:scale-105'
                sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
            />

            {/* Hover Overlay with Caption */}
            {showCaption && image.caption && (
                <div
                    className={cn(
                        'absolute inset-0 flex items-end',
                        'bg-gradient-to-t from-black/80 via-black/20 to-transparent',
                        'opacity-0 transition-opacity duration-300 group-hover:opacity-100'
                    )}
                >
                    <p className='p-3 text-sm font-medium text-white md:p-4 md:text-base'>
                        {image.caption}
                    </p>
                </div>
            )}
        </button>
    )
}
