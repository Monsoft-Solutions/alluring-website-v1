/**
 * ServiceFeatures Component
 *
 * Displays service features in a responsive grid layout using FeatureCard components.
 * Features section showcases the key capabilities and characteristics of a service.
 *
 * Features:
 * - 3-column responsive grid (1 col mobile, 2 col tablet, 3 col desktop)
 * - Reuses existing FeatureCard component for consistency
 * - Optional section header with title and description
 * - Support for different background variants
 *
 * @example
 * ```tsx
 * <ServiceFeatures
 *   features={service.features}
 *   title="What You Get"
 *   description="Comprehensive features designed for your success"
 *   variant="muted"
 * />
 * ```
 */
import Image from 'next/image'

import { Card, CardContent, CardHeader } from '@workspace/ui/components/card'
import { cn } from '@workspace/ui/lib/utils'

import type { ServiceFeature } from '@/lib/types/services/service-feature.type'

import { ContentWrapper } from '../shared/content-wrapper.component'
import { SectionContainer } from '../shared/section-container.component'
import { SectionHeader } from '../shared/section-header.component'

/**
 * ServiceFeatures Component Props
 */
export type ServiceFeaturesProps = {
    /**
     * Array of service features to display
     */
    readonly features: ServiceFeature[]

    /**
     * Optional section title
     * @default "Key Features"
     */
    readonly title?: string

    /**
     * Optional section description
     */
    readonly description?: string

    /**
     * Background variant for the section
     * @default "muted"
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
 * ServiceFeatures Component
 *
 * Renders a grid of feature cards showcasing service capabilities.
 * Uses the existing FeatureCard pattern but adapted for image-based icons.
 */
export function ServiceFeatures({
    features,
    title = 'Key Features',
    description,
    variant = 'muted',
    id = 'features',
    className,
}: ServiceFeaturesProps) {
    // Handle empty features array
    if (!features || features.length === 0) {
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

                {/* Features Grid */}
                <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
                    {features.map((feature, index) => (
                        <Card
                            key={`${feature.title}-${index}`}
                            className={cn(
                                'h-full transition-all hover:-translate-y-1 hover:shadow-md'
                            )}
                        >
                            <CardHeader className='space-y-4'>
                                {/* Icon Container */}
                                <div
                                    className={cn(
                                        'bg-primary/10 w-fit rounded-lg p-3',
                                        'flex items-center justify-center'
                                    )}
                                    aria-hidden='true'
                                >
                                    <div className='relative size-10'>
                                        <Image
                                            src={feature.iconPath}
                                            alt=''
                                            fill
                                            className='text-primary object-contain'
                                        />
                                    </div>
                                </div>

                                {/* Title */}
                                <h3 className='text-foreground text-xl font-semibold tracking-tight'>
                                    {feature.title}
                                </h3>
                            </CardHeader>

                            <CardContent>
                                {/* Description */}
                                <p
                                    className='text-muted-foreground text-sm leading-relaxed md:text-base'
                                    aria-label={feature.ariaLabel}
                                >
                                    {feature.description}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </ContentWrapper>
        </SectionContainer>
    )
}
