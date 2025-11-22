/**
 * StackingFeaturesSection Component
 *
 * Displays feature cards with an elegant stacking scroll effect.
 * As users scroll, cards travel up and pin to the top, stacking on each other
 * with sophisticated 3D animations, dynamic shadows, and depth perception.
 *
 * Features:
 * - Configurable animation intensity (subtle, normal, dramatic)
 * - Multiple stacking variants (default, compact, spacious)
 * - Full accessibility support
 * - Performance optimized
 * - Reusable across different sections
 *
 * @example
 * ```tsx
 * <StackingFeaturesSection
 *   title="Everything You Need"
 *   description="Complete features for your success"
 *   features={[
 *     { icon: Zap, title: "Fast", description: "Lightning fast" },
 *     // ... more features
 *   ]}
 *   animationIntensity="normal"
 *   stackingVariant="default"
 * />
 * ```
 */
import { ContentWrapper } from '@/components/shared/ContentWrapper.component'
import { SectionContainer } from '@/components/shared/SectionContainer.component'
import { SectionHeader } from '@/components/shared/SectionHeader.component'
import { StackingCard } from '@/components/shared/StackingCard.component'
import { StackingFeatureCard } from '@/components/shared/StackingFeatureCard.component'
import type {
    AnimationIntensity,
    StackingCardConfig,
    StackingVariant,
} from '@/lib/types/sections/stacking.type'
import type { Feature } from '@/lib/types/sections/features-section.type'

export type StackingFeaturesSectionProps = {
    /** Section title */
    title: string
    /** Section description */
    description?: string
    /** Array of feature items */
    features: Feature[]
    /** Background variant */
    variant?: 'default' | 'muted' | 'accent'
    /** Additional CSS classes */
    className?: string
    /** Section ID for anchor links */
    id?: string
    /** Animation intensity preset */
    animationIntensity?: AnimationIntensity
    /** Stacking variant for container heights */
    stackingVariant?: StackingVariant
    /** Custom stacking card configuration */
    stackingConfig?: Partial<StackingCardConfig>
}

/**
 * StackingFeaturesSection with enhanced Apple-style stacking scroll effect
 *
 * Features:
 * - Single-column layout for maximum stacking effect
 * - Each card in a StackingCard wrapper with configurable animations
 * - Section header remains static at top
 * - Narrower content width for better focus
 * - Larger section padding for emphasis
 * - Visible spacing between cards for better visual hierarchy
 */
export function StackingFeaturesSection({
    title,
    description,
    features,
    variant = 'default',
    className,
    id,
    animationIntensity = 'normal',
    stackingVariant = 'default',
    stackingConfig,
}: StackingFeaturesSectionProps) {
    return (
        <SectionContainer
            variant={variant}
            id={id}
            className={className}
            paddingY='py-20 md:py-32'
        >
            <ContentWrapper size='md'>
                {/* Section Header - remains static */}
                <SectionHeader
                    title={title}
                    description={description}
                    align='center'
                    className='mb-16 md:mb-20'
                />

                {/* Stacking Cards Container - Enhanced spacing for visual hierarchy */}
                <div className='space-y-16'>
                    {features.map((feature, index) => (
                        <StackingCard
                            key={`${feature.title}-${index}`}
                            index={index}
                            total={features.length}
                            animationIntensity={animationIntensity}
                            stackingVariant={stackingVariant}
                            config={stackingConfig}
                        >
                            <StackingFeatureCard
                                title={feature.title}
                                description={feature.description}
                                imageSrc={
                                    feature.imageSrc || '/images/hero.jpg'
                                }
                                imageAlt={feature.imageAlt || feature.title}
                            />
                        </StackingCard>
                    ))}
                </div>
            </ContentWrapper>
        </SectionContainer>
    )
}
