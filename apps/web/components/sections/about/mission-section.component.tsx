/**
 * MissionSection Component
 *
 * Displays company Mission, Vision, and Values in a 3-column grid layout.
 * Uses IconCard components for consistent styling and responsive behavior.
 *
 * @example
 * ```tsx
 * <MissionSection
 *   items={[
 *     {
 *       icon: Target,
 *       title: "Our Mission",
 *       description: "To deliver innovative solutions..."
 *     },
 *     // ... more items
 *   ]}
 * />
 * ```
 */
import { cn } from '@workspace/ui/lib/utils'

import { ContentWrapper } from '@/components/shared/content-wrapper.component'
import { IconCard } from '@/components/shared/icon-card.component'
import { SectionContainer } from '@/components/shared/section-container.component'
import { SectionHeader } from '@/components/shared/section-header.component'
import type { MissionSectionProps } from '@/lib/types/sections/mission-section.type'

export function MissionSection({
    badge,
    headline,
    description,
    items,
    variant = 'default',
    className,
    id,
}: MissionSectionProps) {
    return (
        <SectionContainer
            variant={variant}
            id={id}
            className={cn('py-16 md:py-24 lg:py-32', className)}
        >
            <ContentWrapper>
                {/* Section Header */}
                {(badge || headline) && (
                    <SectionHeader
                        badge={badge}
                        title={headline || ''}
                        description={description}
                        align='center'
                        className='mb-12 md:mb-16'
                    />
                )}

                {/* Mission Items Grid */}
                <div className='grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8'>
                    {items.map((item, index) => (
                        <IconCard
                            key={`mission-item-${index}`}
                            icon={item.icon}
                            title={item.title}
                            description={item.description}
                            iconStyle='filled'
                            iconVariant='primary'
                            ariaLabel={item.ariaLabel}
                        />
                    ))}
                </div>
            </ContentWrapper>
        </SectionContainer>
    )
}
