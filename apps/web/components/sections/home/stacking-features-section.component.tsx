/**
 * StackingFeaturesSection Component
 *
 * A complete section component that combines StackingCard and StackingFeatureCard
 * to create an Apple-style stacking scroll effect for features.
 *
 * Features:
 * - Scroll-based card stacking animation
 * - 3D transforms and dynamic shadows
 * - Configurable animation intensity
 * - Accessibility support (reduced motion)
 *
 * @example
 * ```tsx
 * <StackingFeaturesSection
 *   id="features"
 *   title="Key Features"
 *   description="Everything you need"
 *   features={featuresData}
 *   variant="muted"
 *   animationIntensity="normal"
 * />
 * ```
 */
'use client'

import type { Feature } from '@/lib/types/sections/features-section.type'
import type {
    AnimationIntensity,
    StackingVariant,
} from '@/lib/types/sections/stacking.type'
import type { SectionBackgroundVariant } from '@/lib/types/sections/section-container.type'

import { ContentWrapper } from '@/components/shared/content-wrapper.component'
import { SectionContainer } from '@/components/shared/section-container.component'
import { SectionHeader } from '@/components/shared/section-header.component'
import { StackingCard } from '@/components/shared/stacking-card.component'
import { StackingFeatureCard } from '@/components/shared/stacking-feature-card.component'

/**
 * Feature type for stacking features section (icon is optional since it's not used)
 */
type StackingFeature = Omit<Feature, 'icon'> & {
    icon?: Feature['icon']
}

export type StackingFeaturesSectionProps = {
    /** Section ID for anchor navigation */
    id?: string
    /** Section title */
    title: string
    /** Optional section description */
    description?: string
    /** Array of feature items (icon is optional) */
    features: StackingFeature[]
    /** Background variant */
    variant?: SectionBackgroundVariant
    /** Animation intensity preset */
    animationIntensity?: AnimationIntensity
    /** Stacking variant for container heights */
    stackingVariant?: StackingVariant
    /** Additional CSS classes */
    className?: string
}

export function StackingFeaturesSection({
    id,
    title,
    description,
    features,
    variant = 'default',
    animationIntensity = 'normal',
    stackingVariant = 'default',
    className,
}: StackingFeaturesSectionProps) {
    return (
        <SectionContainer id={id} variant={variant} className={className}>
            <ContentWrapper>
                {/* Section Header */}
                {(title || description) && (
                    <div className='mb-16'>
                        <SectionHeader
                            title={title}
                            description={description}
                            align='center'
                        />
                    </div>
                )}

                {/* Stacking Cards */}
                <div className='space-y-0'>
                    {features.map((feature, index) => {
                        // Ensure feature has required image properties
                        if (!feature.imageSrc || !feature.imageAlt) {
                            console.warn(
                                `Feature "${feature.title}" is missing imageSrc or imageAlt. Skipping.`
                            )
                            return null
                        }

                        return (
                            <StackingCard
                                key={`${feature.title}-${index}`}
                                index={index}
                                total={features.length}
                                animationIntensity={animationIntensity}
                                stackingVariant={stackingVariant}
                            >
                                <StackingFeatureCard
                                    title={feature.title}
                                    description={feature.description}
                                    imageSrc={feature.imageSrc}
                                    imageAlt={feature.imageAlt}
                                />
                            </StackingCard>
                        )
                    })}
                </div>
            </ContentWrapper>
        </SectionContainer>
    )
}
