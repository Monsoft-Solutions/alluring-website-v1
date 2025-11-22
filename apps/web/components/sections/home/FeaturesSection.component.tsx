/**
 * FeaturesSection Component
 *
 * Displays a grid of feature/service cards with icons, titles, and descriptions.
 * Fully responsive with configurable column layouts and hover effects.
 *
 * @example
 * ```tsx
 * <FeaturesSection
 *   title="Our Services"
 *   description="Discover what we can do for you"
 *   features={[
 *     {
 *       icon: Target,
 *       title: "Strategic Planning",
 *       description: "We help you plan for success"
 *     },
 *     // ... more features
 *   ]}
 *   columns={3}
 * />
 * ```
 */
import { cn } from '@workspace/ui/lib/utils'

import { ContentWrapper } from '@/components/shared/ContentWrapper.component'
import { IconCard } from '@/components/shared/IconCard.component'
import { SectionContainer } from '@/components/shared/SectionContainer.component'
import { SectionHeader } from '@/components/shared/SectionHeader.component'
import type { FeaturesSectionProps } from '@/lib/types/sections/features-section.type'

/**
 * Maps column count to grid classes
 */
const columnClasses = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-2 lg:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-4',
}

export function FeaturesSection({
    title,
    description,
    features,
    columns = 3,
    variant = 'default',
    className,
    id,
    iconStyle = 'outlined',
    iconVariant = 'primary',
    showBorders = true,
}: FeaturesSectionProps) {
    return (
        <SectionContainer variant={variant} id={id} className={className}>
            <ContentWrapper>
                {/* Section Header */}
                <SectionHeader
                    title={title}
                    description={description}
                    align='center'
                    className='mb-12 md:mb-16'
                />

                {/* Features Grid */}
                <div
                    className={cn(
                        'grid grid-cols-1 gap-6 md:gap-8',
                        columnClasses[columns]
                    )}
                >
                    {features.map((feature, index) => (
                        <IconCard
                            key={`${feature.title}-${index}`}
                            icon={feature.icon}
                            title={feature.title}
                            description={feature.description}
                            href={feature.href}
                            external={feature.external}
                            ariaLabel={feature.ariaLabel}
                            iconStyle={iconStyle}
                            iconVariant={iconVariant}
                            showBorder={showBorders}
                        />
                    ))}
                </div>
            </ContentWrapper>
        </SectionContainer>
    )
}
