/**
 * ServiceProcess Component
 *
 * Displays a step-by-step process visualization showing the service delivery workflow.
 * Features numbered steps with connecting lines for visual flow.
 *
 * Features:
 * - Numbered steps (1, 2, 3, 4...)
 * - Visual timeline with connecting lines
 * - Vertical layout on mobile, optional horizontal on desktop
 * - Optional icons for each step
 * - Responsive design with proper spacing
 *
 * @example
 * ```tsx
 * <ServiceProcess
 *   steps={service.process}
 *   title="Our Process"
 *   description="How we deliver exceptional results"
 *   layout="vertical"
 * />
 * ```
 */
import Image from 'next/image'

import { cn } from '@workspace/ui/lib/utils'

import type { ServiceProcessStep } from '@/lib/types/services/service-process-step.type'
import { SectionContainer } from '../shared/SectionContainer.component'
import { ContentWrapper } from '../shared/ContentWrapper.component'
import { SectionHeader } from '../shared/SectionHeader.component'

/**
 * ServiceProcess Component Props
 */
export type ServiceProcessProps = {
    /**
     * Array of process steps to display
     */
    readonly steps: ServiceProcessStep[]

    /**
     * Optional section title
     * @default "Our Process"
     */
    readonly title?: string

    /**
     * Optional section description
     */
    readonly description?: string

    /**
     * Layout orientation
     * @default "vertical"
     * Note: Horizontal layout may be added in future if needed
     */
    readonly layout?: 'vertical' | 'horizontal'

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
 * ServiceProcess Component
 *
 * Renders a visual timeline of process steps with numbered indicators.
 * Currently implements vertical layout with connecting lines.
 */
export function ServiceProcess({
    steps,
    title = 'Our Process',
    description,
    layout = 'vertical',
    variant = 'muted',
    id = 'process',
    className,
}: ServiceProcessProps) {
    // Handle empty or undefined steps array
    if (!steps || steps.length === 0) {
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

                {/* Process Steps - Vertical Layout */}
                <div className='mx-auto max-w-3xl'>
                    <div className='relative space-y-8'>
                        {/* Vertical connecting line */}
                        <div
                            className='bg-border absolute top-8 bottom-8 left-8 w-0.5 md:left-10'
                            aria-hidden='true'
                        />

                        {/* Steps */}
                        {steps.map((step, index) => {
                            const isLastStep = index === steps.length - 1

                            return (
                                <div
                                    key={`step-${step.step}-${index}`}
                                    className='relative flex gap-6 md:gap-8'
                                >
                                    {/* Step Number Circle */}
                                    <div className='relative z-10 flex shrink-0 flex-col items-center'>
                                        <div
                                            className={cn(
                                                'flex size-16 items-center justify-center',
                                                'border-background rounded-full border-4',
                                                'bg-primary text-primary-foreground',
                                                'text-xl font-bold md:size-20 md:text-2xl',
                                                'shadow-lg'
                                            )}
                                            aria-label={`Step ${step.step}`}
                                        >
                                            {step.step}
                                        </div>
                                    </div>

                                    {/* Step Content */}
                                    <div
                                        className={cn(
                                            'border-border/50 bg-card flex-1 rounded-lg border p-6',
                                            'hover:border-primary/50 transition-all hover:shadow-sm',
                                            !isLastStep && 'mb-4'
                                        )}
                                    >
                                        <div className='flex items-start gap-4'>
                                            {/* Optional Icon */}
                                            {step.iconPath && (
                                                <div
                                                    className='shrink-0 pt-1'
                                                    aria-hidden='true'
                                                >
                                                    <div
                                                        className={cn(
                                                            'flex items-center justify-center',
                                                            'bg-primary/10 rounded-lg p-2'
                                                        )}
                                                    >
                                                        <div className='relative size-6'>
                                                            <Image
                                                                src={
                                                                    step.iconPath
                                                                }
                                                                alt=''
                                                                fill
                                                                className='text-primary object-contain'
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Text Content */}
                                            <div className='flex-1 space-y-2'>
                                                <h3 className='text-foreground text-xl font-semibold tracking-tight md:text-2xl'>
                                                    {step.title}
                                                </h3>

                                                <p className='text-muted-foreground text-sm leading-relaxed md:text-base'>
                                                    {step.description}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Future: Horizontal layout can be implemented here if needed */}
                {layout === 'horizontal' && (
                    <div className='text-muted-foreground text-center text-sm'>
                        Horizontal layout coming soon
                    </div>
                )}
            </ContentWrapper>
        </SectionContainer>
    )
}
