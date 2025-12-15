import { cn } from '@workspace/ui/lib/utils'

import type { GalleryGroupCard as GalleryGroupCardType } from '@/lib/types/gallery/gallery-group.type'

import { ContentWrapper } from '@/components/shared/content-wrapper.component'
import { SectionContainer } from '@/components/shared/section-container.component'
import { SectionHeader } from '@/components/shared/section-header.component'

import { GalleryGroupCard } from './gallery-group-card.component'

type GalleryGroupsSectionProps = {
    readonly groups: GalleryGroupCardType[]
    readonly className?: string
}

/**
 * Gallery Groups Section Component
 *
 * Displays a grid of gallery group cards with section header.
 */
export function GalleryGroupsSection({
    groups,
    className,
}: GalleryGroupsSectionProps) {
    // Filter groups to only show those with images
    const groupsWithImages = groups.filter((group) => group.mediaCount > 0)

    if (groupsWithImages.length === 0) {
        return null
    }

    return (
        <SectionContainer
            id='gallery-groups'
            variant='default'
            className={cn('bg-white', className)}
        >
            <ContentWrapper>
                {/* Section Header */}
                <SectionHeader
                    badge='Browse by Category'
                    title='Explore Our Collections'
                    description='Discover transformative results organized by procedure type. Each gallery showcases the artistry and precision of our board-certified surgeons.'
                    align='center'
                    className='mb-12 md:mb-16'
                />

                {/* Groups Grid */}
                <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8'>
                    {groupsWithImages.map((group) => (
                        <GalleryGroupCard key={group.id} group={group} />
                    ))}
                </div>
            </ContentWrapper>
        </SectionContainer>
    )
}
