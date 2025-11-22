/**
 * ContactHeroSection Component
 *
 * A hero section for the contact page displaying page title, introduction,
 * and breadcrumb navigation. Features subtle fade-in animations and centered layout.
 *
 * @example
 * ```tsx
 * <ContactHeroSection
 *   badge="Get In Touch"
 *   headline="Let's Start a Conversation"
 *   description="We'd love to hear from you..."
 * />
 * ```
 */
import { cn } from '@workspace/ui/lib/utils'

import { Breadcrumbs } from '@/components/shared/breadcrumbs.component'
import { ContentWrapper } from '@/components/shared/content-wrapper.component'
import { SectionContainer } from '@/components/shared/section-container.component'
import type { ContactHeroSectionProps } from '@/lib/types/sections/contact-hero-section.type'

export function ContactHeroSection({
    badge,
    headline,
    description,
    enableAnimations = true,
    className,
    id,
}: ContactHeroSectionProps) {
    // Breadcrumb items for navigation
    const breadcrumbItems = [{ label: 'Home', href: '/' }, { label: 'Contact' }]

    return (
        <SectionContainer
            variant='default'
            id={id}
            className={cn(
                'relative overflow-hidden py-20 md:py-24 lg:py-32',
                className
            )}
        >
            {/* Enhanced background elements */}
            <div className='from-primary/[0.03] to-secondary/[0.03] absolute inset-0 bg-gradient-to-br via-transparent' />
            <div className='absolute top-0 left-0 h-full w-full bg-[radial-gradient(circle_at_20%_80%,rgba(120,119,198,0.08),transparent_50%)]' />
            <div className='absolute top-0 right-0 h-full w-full bg-[radial-gradient(circle_at_80%_20%,rgba(255,107,107,0.06),transparent_50%)]' />

            {/* Animated background shapes */}
            <div className='bg-primary/5 absolute top-10 left-10 h-32 w-32 animate-pulse rounded-full blur-2xl' />
            <div className='bg-secondary/5 absolute right-10 bottom-10 h-40 w-40 animate-pulse rounded-full blur-2xl [animation-delay:1s]' />

            <ContentWrapper className='relative'>
                <div className='flex flex-col items-center space-y-8 text-center'>
                    {/* Breadcrumbs */}
                    <div
                        className={cn(
                            'flex w-full justify-center',
                            enableAnimations && 'animate-fade-in'
                        )}
                    >
                        <Breadcrumbs
                            items={breadcrumbItems}
                            showBackground={true}
                        />
                    </div>

                    {/* Content Container */}
                    <div
                        className={cn(
                            'flex max-w-4xl flex-col space-y-8',
                            enableAnimations &&
                                'animate-fade-in [animation-delay:100ms]'
                        )}
                    >
                        {/* Badge */}
                        {badge && (
                            <div className='inline-flex items-center justify-center'>
                                <div className='bg-primary/10 text-primary border-primary/20 rounded-full border px-4 py-2 text-sm font-semibold tracking-wider uppercase shadow-sm backdrop-blur-sm'>
                                    {badge}
                                </div>
                            </div>
                        )}

                        {/* Headline */}
                        <h1 className='text-foreground from-foreground to-foreground/80 bg-gradient-to-br bg-clip-text text-4xl leading-tight font-bold tracking-tight md:text-5xl lg:text-6xl xl:text-7xl'>
                            {headline}
                        </h1>

                        {/* Description */}
                        {description && (
                            <p className='text-muted-foreground mx-auto max-w-3xl text-lg leading-relaxed font-light md:text-xl lg:text-2xl'>
                                {description}
                            </p>
                        )}
                    </div>
                </div>
            </ContentWrapper>
        </SectionContainer>
    )
}
