import { cn } from '@workspace/ui/lib/utils'

import { ContentWrapper } from '@/components/shared/content-wrapper.component'
import { SectionContainer } from '@/components/shared/section-container.component'
import type { ProcedureContentImage } from '@/lib/types/procedure.type'
import { ProcedureContentImage as ImageComponent } from './procedure-content-image.component'

type ProcedureContentImagesSectionProps = {
    /** All content images for the procedure */
    readonly images: ProcedureContentImage[]
    /** Which section's images to display */
    readonly section: ProcedureContentImage['section']
    /** Optional section title */
    readonly title?: string
    /** Optional section description */
    readonly description?: string
    /** Background variant */
    readonly variant?: 'default' | 'muted'
    /** Additional CSS classes */
    readonly className?: string
}

/**
 * Procedure Content Images Section
 *
 * Renders a grid of inline images for a specific section of the procedure page.
 * Automatically filters images by section and displays them in a responsive grid.
 */
export function ProcedureContentImagesSection({
    images,
    section,
    title,
    description,
    variant = 'default',
    className,
}: ProcedureContentImagesSectionProps) {
    // Filter images for this section
    const sectionImages = images.filter((img) => img.section === section)

    // Don't render if no images for this section
    if (sectionImages.length === 0) {
        return null
    }

    return (
        <SectionContainer
            variant={variant}
            className={cn('py-12 lg:py-16', className)}
        >
            <ContentWrapper>
                {/* Optional Header */}
                {(title || description) && (
                    <div className='mb-10 text-center'>
                        {title && (
                            <h3 className='mb-4 font-serif text-2xl text-stone-900 md:text-3xl'>
                                {title}
                            </h3>
                        )}
                        {description && (
                            <p className='mx-auto max-w-2xl text-lg font-light text-stone-600'>
                                {description}
                            </p>
                        )}
                    </div>
                )}

                {/* Images Grid */}
                <div
                    className={cn(
                        'grid gap-6',
                        sectionImages.length === 1 && 'grid-cols-1',
                        sectionImages.length === 2 &&
                            'grid-cols-1 md:grid-cols-2',
                        sectionImages.length >= 3 &&
                            'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                    )}
                >
                    {sectionImages.map((image) => (
                        <ImageComponent
                            key={image.id}
                            image={{ ...image, variant: 'full-width' }}
                            className='my-0'
                        />
                    ))}
                </div>
            </ContentWrapper>
        </SectionContainer>
    )
}
