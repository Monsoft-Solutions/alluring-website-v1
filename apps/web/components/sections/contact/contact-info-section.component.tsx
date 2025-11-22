/**
 * ContactInfoSection Component
 *
 * Displays contact information (phone, email, address) and social media links
 * in a visually organized card layout. Includes interactive elements with
 * proper accessibility attributes.
 *
 * @example
 * ```tsx
 * <ContactInfoSection
 *   headline="Other Ways to Reach Us"
 *   contactItems={contactItems}
 *   showSocialLinks={true}
 * />
 * ```
 */
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card'
import { cn } from '@workspace/ui/lib/utils'
import { Github, Linkedin, Sparkles, Twitter } from 'lucide-react'
import Link from 'next/link'

import { ContentWrapper } from '@/components/shared/ContentWrapper.component'
import { SectionContainer } from '@/components/shared/SectionContainer.component'
import { SectionHeader } from '@/components/shared/SectionHeader.component'
import { socialLinks } from '@/lib/data/navigation'
import type { ContactInfoSectionProps } from '@/lib/types/sections/contact-info-section.type'

/**
 * Map social platform names to their corresponding Lucide icons
 */
const socialIconMap = {
    github: Github,
    twitter: Twitter,
    linkedin: Linkedin,
} as const

/**
 * Get icon component for social platform
 */
function getSocialIcon(platform: string) {
    const normalizedPlatform = platform.toLowerCase()
    return (
        socialIconMap[normalizedPlatform as keyof typeof socialIconMap] ||
        Github
    )
}

export function ContactInfoSection({
    badge,
    headline,
    description,
    contactItems,
    showSocialLinks = true,
    className,
    id,
}: ContactInfoSectionProps) {
    return (
        <SectionContainer
            variant='default'
            id={id}
            className={cn('relative py-16 md:py-24', className)}
        >
            {/* Subtle background elements */}
            <div className='from-muted/30 pointer-events-none absolute inset-0 bg-gradient-to-t via-transparent to-transparent' />
            <div className='bg-primary/5 pointer-events-none absolute top-0 left-1/4 h-96 w-96 rounded-full blur-3xl' />
            <div className='bg-secondary/5 pointer-events-none absolute right-1/4 bottom-0 h-96 w-96 rounded-full blur-3xl' />

            <ContentWrapper size='md' className='relative'>
                {/* Section Header */}
                {(badge || headline || description) && (
                    <SectionHeader
                        badge={badge}
                        title={headline || ''}
                        description={description}
                        className='mb-16 text-center'
                    />
                )}

                <div className='grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3'>
                    {/* Contact Information Cards */}
                    {contactItems.map((item, index) => {
                        const Icon = item.icon
                        const isClickable = !!item.href

                        const cardContent = (
                            <Card
                                className={cn(
                                    'bg-card/60 border-border/50 hover:shadow-primary/5 relative overflow-hidden backdrop-blur-sm transition-all duration-300 hover:shadow-lg',
                                    isClickable &&
                                        'group hover:border-primary/20 cursor-pointer hover:-translate-y-1 hover:shadow-xl'
                                )}
                            >
                                {/* Card background gradient */}
                                <div className='from-primary/[0.02] to-secondary/[0.02] absolute inset-0 bg-gradient-to-br via-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100' />

                                <CardHeader className='relative pb-4'>
                                    <div className='flex items-center gap-4'>
                                        <div
                                            className={cn(
                                                'from-primary/10 to-primary/5 text-primary flex size-12 items-center justify-center rounded-xl bg-gradient-to-br shadow-sm',
                                                isClickable &&
                                                    'group-hover:from-primary/20 group-hover:to-primary/10 transition-all duration-300 group-hover:scale-105 group-hover:shadow-md'
                                            )}
                                        >
                                            <Icon
                                                className='size-6'
                                                aria-hidden='true'
                                            />
                                        </div>
                                        <CardTitle className='text-lg font-semibold'>
                                            {item.title}
                                        </CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className='relative pt-0'>
                                    <p
                                        className={cn(
                                            'text-muted-foreground text-sm leading-relaxed',
                                            isClickable &&
                                                'group-hover:text-foreground transition-colors duration-300'
                                        )}
                                    >
                                        {item.value}
                                    </p>

                                    {/* Hover indicator for clickable cards */}
                                    {isClickable && (
                                        <div className='absolute right-4 bottom-4 translate-x-2 transform opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100'>
                                            <div className='bg-primary/10 text-primary rounded-full p-1.5'>
                                                <svg
                                                    className='h-3 w-3'
                                                    fill='none'
                                                    stroke='currentColor'
                                                    viewBox='0 0 24 24'
                                                >
                                                    <path
                                                        strokeLinecap='round'
                                                        strokeLinejoin='round'
                                                        strokeWidth={2}
                                                        d='M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14'
                                                    />
                                                </svg>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )

                        return (
                            <div key={`${item.title}-${index}`}>
                                {isClickable && item.href ? (
                                    <Link
                                        href={item.href}
                                        aria-label={item.ariaLabel}
                                        className='block'
                                    >
                                        {cardContent}
                                    </Link>
                                ) : (
                                    <div aria-label={item.ariaLabel}>
                                        {cardContent}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>

                {/* Social Media Links */}
                {showSocialLinks && socialLinks.length > 0 && (
                    <div className='mt-16'>
                        <div className='from-muted/40 via-muted/20 to-muted/40 border-border/50 relative flex flex-col items-center gap-8 rounded-2xl border bg-gradient-to-br p-8 shadow-sm backdrop-blur-sm md:p-12'>
                            {/* Background decoration */}
                            <div className='from-primary/[0.03] to-secondary/[0.03] absolute inset-0 rounded-2xl bg-gradient-to-br via-transparent' />
                            <div className='bg-primary/5 absolute top-4 right-4 h-24 w-24 rounded-full blur-2xl' />
                            <div className='bg-secondary/5 absolute bottom-4 left-4 h-32 w-32 rounded-full blur-2xl' />

                            <div className='relative space-y-3 text-center'>
                                <h3 className='text-foreground flex items-center justify-center gap-2 text-xl font-bold'>
                                    <Sparkles className='text-primary size-5' />
                                    Follow Us
                                </h3>
                                <p className='text-muted-foreground max-w-md text-base leading-relaxed'>
                                    Connect with us on social media for updates,
                                    insights, and behind-the-scenes content
                                </p>
                            </div>
                            <div className='relative flex flex-wrap items-center justify-center gap-4'>
                                {socialLinks.map((social, index) => {
                                    const SocialIcon = getSocialIcon(
                                        social.platform
                                    )
                                    return (
                                        <Link
                                            key={social.platform}
                                            href={social.url}
                                            target='_blank'
                                            rel='noopener noreferrer'
                                            aria-label={
                                                social.label ||
                                                `Follow us on ${social.platform}`
                                            }
                                            className='group bg-background/80 hover:bg-primary hover:text-primary-foreground border-border/60 flex size-14 items-center justify-center rounded-2xl border shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:scale-110 hover:shadow-lg'
                                            style={{
                                                animationDelay: `${index * 100}ms`,
                                            }}
                                        >
                                            <SocialIcon
                                                className='size-6 transition-transform duration-300 group-hover:scale-110'
                                                aria-hidden='true'
                                            />
                                        </Link>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                )}
            </ContentWrapper>
        </SectionContainer>
    )
}
