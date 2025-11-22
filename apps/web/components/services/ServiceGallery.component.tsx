/**
 * ServiceGallery Component
 *
 * Wrapper component for service detail pages that adds section layout
 * (SectionContainer, ContentWrapper, SectionHeader) around the shared Gallery component.
 *
 * This component provides a consistent layout for galleries on service pages
 * while using the reusable Gallery component for core functionality.
 *
 * Features:
 * - Section layout with title and description
 * - Configurable background variant
 * - Responsive grid (2 cols tablet, 3 cols desktop)
 * - Reuses shared Gallery component for lightbox and image display
 *
 * @example
 * ```tsx
 * <ServiceGallery
 *   images={[
 *     { url: '/images/project-1.jpg', alt: 'Project 1', caption: 'E-commerce platform' },
 *     { url: '/images/project-2.jpg', alt: 'Project 2', caption: 'Mobile app' }
 *   ]}
 *   title="Project Gallery"
 *   description="Examples of our work"
 * />
 * ```
 */

import { SectionContainer } from '../shared/SectionContainer.component'
import { ContentWrapper } from '../shared/ContentWrapper.component'
import { SectionHeader } from '../shared/SectionHeader.component'
import { Gallery } from '../shared/Gallery.component'
import { GalleryImage } from '@/lib/types/shared/gallery-image.type'

/**
 * ServiceGallery Component Props
 */
export type ServiceGalleryProps = {
    /**
     * Array of gallery images to display
     */
    readonly images: GalleryImage[]

    /**
     * Optional section title
     * @default "Project Gallery"
     */
    readonly title?: string

    /**
     * Optional section description
     */
    readonly description?: string

    /**
     * Background variant for the section
     * @default "default"
     */
    readonly variant?: 'default' | 'muted' | 'accent'

    /**
     * Optional section ID for anchor links
     */
    readonly id?: string

    /**
     * Optional additional CSS classes
     */
    readonly className?: string
}

/**
 * ServiceGallery Component
 *
 * Renders a gallery section with title, description, and the shared Gallery component.
 * This is a composition of layout components and the core Gallery functionality.
 */
export function ServiceGallery({
    images,
    title = 'Project Gallery',
    description,
    variant = 'default',
    id = 'gallery',
    className,
}: ServiceGalleryProps) {
    // Handle empty images array
    if (!images || images.length === 0) {
        return null
    }

    return (
        <SectionContainer variant={variant} id={id} className={className}>
            <ContentWrapper size='lg'>
                {/* Section Header */}
                <SectionHeader
                    title={title}
                    description={description}
                    align='center'
                    className='mb-12'
                />

                {/* Gallery Component */}
                <Gallery
                    images={images}
                    columns={{ mobile: 1, tablet: 2, desktop: 3 }}
                    aspectRatio='video'
                />
            </ContentWrapper>
        </SectionContainer>
    )
}
