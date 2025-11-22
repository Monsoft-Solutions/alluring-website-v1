/**
 * ServicesContact Component
 *
 * A service-focused contact section with call-to-action for consultation/quote.
 * Designed to convert visitors into leads by emphasizing service expertise.
 *
 * Features:
 * - Service-focused messaging
 * - Multiple contact options
 * - Prominent CTA buttons
 * - Contact information display
 * - Responsive design with accent variant
 *
 * @example
 * ```tsx
 * <ServicesContact
 *   title="Ready to Start Your Project?"
 *   variant="accent"
 * />
 * ```
 */

import { Button } from '@workspace/ui/components/button'
import { cn } from '@workspace/ui/lib/utils'
import { ArrowRight, Mail, Phone } from 'lucide-react'

import { ContentWrapper } from '@/components/shared/content-wrapper.component'
import { SectionContainer } from '@/components/shared/section-container.component'
import { SectionHeader } from '@/components/shared/section-header.component'
import { siteConfig } from '@/lib/data/site-config'
import type { ServicesContactProps } from '@/lib/types/services/services-page.type'

export function ServicesContact({
    title = 'Ready to Start Your Project?',
    description = "Let's discuss how our services can help bring your vision to life. Get a free consultation and detailed quote tailored to your specific needs.",
    className,
    variant = 'accent',
}: ServicesContactProps) {
    const { contact } = siteConfig

    return (
        <SectionContainer
            variant={variant}
            className={cn('py-16 md:py-24', className)}
        >
            <ContentWrapper size='md'>
                {/* Section Header */}
                <SectionHeader
                    title={title}
                    description={description}
                    align='center'
                    spacing='loose'
                    className='mb-12'
                />

                {/* Contact Options */}
                <div className='mb-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3'>
                    {/* Get Quote CTA */}
                    <div className='text-center'>
                        <div className='bg-primary/10 text-primary mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full'>
                            <ArrowRight className='h-8 w-8' />
                        </div>
                        <h3 className='mb-2 text-lg font-semibold'>
                            Get a Free Quote
                        </h3>
                        <p className='text-muted-foreground mb-4 text-sm'>
                            Detailed proposal with timeline and pricing for your
                            project
                        </p>
                        <Button asChild>
                            <a href='/contact'>Start Quote Process</a>
                        </Button>
                    </div>

                    {/* Phone Contact */}
                    <div className='text-center'>
                        <div className='bg-primary/10 text-primary mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full'>
                            <Phone className='h-8 w-8' />
                        </div>
                        <h3 className='mb-2 text-lg font-semibold'>
                            Call Us Directly
                        </h3>
                        <p className='text-muted-foreground mb-4 text-sm'>
                            Speak with our team for immediate assistance and
                            consultation
                        </p>
                        <Button variant='outline' asChild>
                            <a href={`tel:${contact.phone.replace(/\s/g, '')}`}>
                                {contact.phone}
                            </a>
                        </Button>
                    </div>

                    {/* Email Contact */}
                    <div className='text-center sm:col-span-2 lg:col-span-1'>
                        <div className='bg-primary/10 text-primary mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full'>
                            <Mail className='h-8 w-8' />
                        </div>
                        <h3 className='mb-2 text-lg font-semibold'>
                            Send us an Email
                        </h3>
                        <p className='text-muted-foreground mb-4 text-sm'>
                            Detailed project discussions and file sharing
                        </p>
                        <Button variant='outline' asChild>
                            <a href={`mailto:${contact.email}`}>
                                {contact.email}
                            </a>
                        </Button>
                    </div>
                </div>

                {/* Primary CTA Section */}
                <div className='bg-background/50 border-border/50 rounded-lg border p-8 text-center backdrop-blur-sm'>
                    <h3 className='mb-4 text-2xl font-bold'>
                        Let&apos;s Discuss Your Project
                    </h3>
                    <p className='text-muted-foreground mx-auto mb-6 max-w-2xl'>
                        Every project is unique. We&apos;ll work closely with
                        you to understand your requirements, goals, and timeline
                        to deliver a solution that exceeds your expectations.
                    </p>

                    <div className='flex flex-col items-center justify-center gap-4 sm:flex-row'>
                        <Button size='lg' asChild>
                            <a href='/contact'>
                                Get Free Consultation
                                <ArrowRight className='ml-2 h-4 w-4' />
                            </a>
                        </Button>

                        <Button variant='outline' size='lg' asChild>
                            <a href='/portfolio'>View Our Work</a>
                        </Button>
                    </div>
                </div>

                {/* Business Hours & Availability */}
                <div className='mt-8 text-center'>
                    <p className='text-muted-foreground mb-2 text-sm'>
                        <strong>Business Hours:</strong>
                    </p>
                    {contact.businessHours &&
                        contact.businessHours.length > 0 && (
                            <div className='text-muted-foreground space-y-1 text-xs'>
                                {contact.businessHours.map(
                                    (schedule, index) => (
                                        <p key={index}>
                                            {schedule.days}: {schedule.open} -{' '}
                                            {schedule.close}
                                        </p>
                                    )
                                )}
                            </div>
                        )}
                    <p className='text-muted-foreground mt-2 text-xs'>
                        We typically respond to all inquiries within 24 hours
                        during business days.
                    </p>
                </div>
            </ContentWrapper>
        </SectionContainer>
    )
}
