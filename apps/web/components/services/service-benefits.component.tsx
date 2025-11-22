/**
 * ServiceBenefits Component
 *
 * Displays service benefits in a responsive grid layout using IconCard components.
 * Benefits section emphasizes business value and customer outcomes.
 *
 * Features:
 * - 2-3 column responsive grid (1 col mobile, 2 col tablet, 3 col desktop)
 * - Reuses existing IconCard component for consistency
 * - Optional section header with title and description
 * - Emphasizes measurable outcomes and business value
 *
 * @example
 * ```tsx
 * <ServiceBenefits
 *   benefits={service.benefits}
 *   title="Business Benefits"
 *   description="Real results that impact your bottom line"
 * />
 * ```
 */
import Image from 'next/image'

import { cn } from '@workspace/ui/lib/utils'

import type { ServiceBenefit } from '@/lib/types/services/service-benefit.type'

import { ContentWrapper } from '../shared/content-wrapper.component'
import { SectionContainer } from '../shared/section-container.component'
import { SectionHeader } from '../shared/section-header.component'

/**
 * ServiceBenefits Component Props
 */
export type ServiceBenefitsProps = {
    /**
     * Array of service benefits to display
     */
    readonly benefits: ServiceBenefit[]

    /**
     * Optional section title
     * @default "Why Choose This Service"
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
 * ServiceBenefits Component
 *
 * Renders a grid of benefit cards focusing on business outcomes.
 * Uses IconCard pattern with image-based icons.
 */
export function ServiceBenefits({
    benefits,
    title = 'Why Choose This Service',
    description,
    variant = 'default',
    id = 'benefits',
    className,
}: ServiceBenefitsProps) {
    // Handle empty benefits array
    if (!benefits || benefits.length === 0) {
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

                {/* Benefits Grid */}
                <div className='grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3'>
                    {benefits.map((benefit, index) => (
                        <div
                            key={`${benefit.title}-${index}`}
                            className={cn(
                                'flex flex-col items-start gap-4',
                                'border-border/50 rounded-lg border p-6',
                                'hover:border-primary/50 transition-all hover:shadow-sm'
                            )}
                        >
                            {/* Icon */}
                            <div
                                className={cn(
                                    'flex w-fit items-center justify-center',
                                    'border-primary/20 bg-background rounded-lg border-2 p-3'
                                )}
                                aria-hidden='true'
                            >
                                <div className='relative size-6'>
                                    <Image
                                        src={benefit.iconPath}
                                        alt=''
                                        fill
                                        className='text-primary object-contain'
                                    />
                                </div>
                            </div>

                            {/* Text Content */}
                            <div className='flex-1 space-y-2'>
                                <h3 className='text-foreground text-lg font-semibold tracking-tight md:text-xl'>
                                    {benefit.title}
                                </h3>

                                <p className='text-muted-foreground text-sm leading-relaxed md:text-base'>
                                    {benefit.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </ContentWrapper>
        </SectionContainer>
    )
}
