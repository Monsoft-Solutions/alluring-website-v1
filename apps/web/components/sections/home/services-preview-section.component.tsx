/**
 * ServicesPreviewSection Component
 *
 * Displays a preview of available services on the home page.
 * Shows actual service cards from the services data with links to detail pages.
 *
 * Features:
 * - Dynamically loads published services
 * - Responsive grid layout (1-3 columns)
 * - Section header with title and description
 * - Links to individual service pages
 * - "View All Services" button to services listing page
 * - Mobile-first responsive design
 *
 * @example
 * ```tsx
 * <ServicesPreviewSection
 *   id="services-preview"
 *   title="Our Services"
 *   description="Discover what we can do for you"
 *   maxServices={3}
 * />
 * ```
 */

import { Button } from '@workspace/ui/components/button'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

import { ServiceCard } from '@/components/services/service-card.component'
import { ContentWrapper } from '@/components/shared/content-wrapper.component'
import { SectionContainer } from '@/components/shared/section-container.component'
import { SectionHeader } from '@/components/shared/section-header.component'
import { getPublishedServices } from '@/lib/queries/get-services.query'
import type { CommonSectionProps } from '@/lib/types/sections/section.type'

interface ServicesPreviewSectionProps extends CommonSectionProps {
    /**
     * Section title
     */
    readonly title?: string

    /**
     * Section description
     */
    readonly description?: string

    /**
     * Maximum number of services to display
     * @default 3
     */
    readonly maxServices?: number

    /**
     * Section background variant
     * @default 'default'
     */
    readonly variant?: 'default' | 'muted' | 'accent'
}

export function ServicesPreviewSection({
    id,
    title = 'Our Services',
    description = 'Explore our comprehensive range of professional services designed to help your business grow and succeed.',
    maxServices = 3,
    variant = 'default',
    className,
}: ServicesPreviewSectionProps) {
    // Get published services
    const allServices = getPublishedServices()
    const services = allServices.slice(0, maxServices)

    // Don't render if no services
    if (services.length === 0) {
        return null
    }

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

                {/* Services Grid */}
                <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
                    {services.map((service) => (
                        <ServiceCard
                            key={service.slug}
                            service={service}
                            className='h-full'
                        />
                    ))}
                </div>

                {/* View All Services Button */}
                {allServices.length > maxServices && (
                    <div className='mt-12 flex justify-center'>
                        <Button variant='outline' size='lg' asChild>
                            <Link href='/services'>
                                View All Services
                                <ArrowRight className='ml-2 h-4 w-4' />
                            </Link>
                        </Button>
                    </div>
                )}
            </ContentWrapper>
        </SectionContainer>
    )
}
