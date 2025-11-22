/**
 * BlogCTA Component
 *
 * Extensible call-to-action component for blog posts.
 * Supports multiple content variants and two visual styles.
 *
 * Features:
 * - Load predefined CTA content via ctaId
 * - Pass custom content directly
 * - Two visual variants: inline (accent box) and footer (large section)
 * - Responsive design with proper spacing
 *
 * @example
 * ```tsx
 * // Use predefined CTA
 * <BlogCTA variant="inline" ctaId="consultation" />
 *
 * // Use custom content
 * <BlogCTA
 *   variant="footer"
 *   content={{
 *     id: "custom",
 *     heading: "Custom Heading",
 *     description: "Custom description",
 *     primaryButton: { text: "Click Me", href: "/page" }
 *   }}
 * />
 * ```
 */
'use client'

import { Button } from '@workspace/ui/components/button'
import { cn } from '@workspace/ui/lib/utils'
import { ArrowRight, Mail, MessageCircle, Sparkles } from 'lucide-react'
import Link from 'next/link'

import {
    defaultCTAContent,
    getCTAContentById,
} from '@/lib/data/blog-cta-content'
import type {
    BlogCTAProps,
    CTAColorScheme,
} from '@/lib/types/blog/blog-cta.type'

/**
 * Map icon names to lucide-react components
 */
function getIcon(iconName?: string) {
    if (!iconName) return null

    const iconProps = { className: 'ml-2 h-4 w-4' }

    switch (iconName) {
        case 'arrow-right':
            return <ArrowRight {...iconProps} />
        case 'mail':
            return <Mail {...iconProps} />
        case 'message-circle':
            return <MessageCircle {...iconProps} />
        case 'sparkles':
            return <Sparkles {...iconProps} />
        default:
            return null
    }
}

/**
 * Get background and border classes for color scheme
 */
function getColorSchemeClasses(
    colorScheme: CTAColorScheme,
    variant: 'inline' | 'footer'
) {
    const baseClasses = {
        inline: 'my-12 rounded-lg border px-8 py-16',
        footer: 'mt-20 rounded-lg border px-12 py-16',
    }

    const colorClasses = {
        blue: {
            bg: 'bg-cta-blue-bg',
            border: 'border-cta-blue-border',
        },
        green: {
            bg: 'bg-cta-green-bg',
            border: 'border-cta-green-border',
        },
        orange: {
            bg: 'bg-cta-orange-bg',
            border: 'border-cta-orange-border',
        },
        default: {
            bg: variant === 'inline' ? 'bg-accent/30' : 'bg-primary/5',
            border:
                variant === 'inline' ? 'border-accent/40' : 'border-border/30',
        },
    }

    const colors = colorClasses[colorScheme]
    return cn(baseClasses[variant], colors.bg, colors.border)
}

/**
 * Get text color classes based on color scheme
 * Returns white text for colored schemes, default theme colors for 'default' scheme
 */
function getTextColorClasses(colorScheme: CTAColorScheme) {
    if (colorScheme === 'default') {
        return {
            heading: 'text-foreground',
            description: 'text-muted-foreground',
        }
    }

    // For colored schemes (blue, green, orange), use white text
    return {
        heading: 'text-white',
        description: 'text-white/90',
    }
}

/**
 * Get button variant based on color scheme
 */
function getButtonVariant(
    colorScheme: CTAColorScheme
): 'cta-blue' | 'cta-green' | 'cta-orange' | 'default' {
    switch (colorScheme) {
        case 'blue':
            return 'cta-blue'
        case 'green':
            return 'cta-green'
        case 'orange':
            return 'cta-orange'
        default:
            return 'default'
    }
}

export function BlogCTA({
    variant,
    content,
    ctaId,
    colorScheme: propColorScheme,
}: BlogCTAProps) {
    // Determine which content to use (priority: content prop > ctaId > default)
    const ctaContent =
        content ?? (ctaId ? getCTAContentById(ctaId) : defaultCTAContent)

    // If no content found, log error and return null
    if (!ctaContent) {
        console.error(
            `BlogCTA: No content found for ctaId "${ctaId}". Component will not render.`
        )
        return null
    }

    // Determine color scheme (priority: prop > content.colorScheme > 'blue' default)
    const colorScheme: CTAColorScheme =
        propColorScheme ?? ctaContent.colorScheme ?? 'blue'

    const primaryIcon = getIcon(ctaContent.primaryButton.iconName)
    const buttonVariant =
        ctaContent.primaryButton.variant ?? getButtonVariant(colorScheme)
    const textColors = getTextColorClasses(colorScheme)

    if (variant === 'inline') {
        return (
            <aside className={getColorSchemeClasses(colorScheme, 'inline')}>
                <div className='flex flex-col gap-6'>
                    <div>
                        <h3
                            className={cn(
                                'mb-2 text-3xl font-semibold',
                                textColors.heading
                            )}
                        >
                            {ctaContent.heading}
                        </h3>
                        <p
                            className={cn(
                                'text-lg leading-relaxed',
                                textColors.description
                            )}
                        >
                            {ctaContent.description}
                        </p>
                    </div>
                    <div className='flex flex-col gap-3 sm:flex-row'>
                        <Button asChild size='lg' variant={buttonVariant}>
                            <Link href={ctaContent.primaryButton.href}>
                                {ctaContent.primaryButton.text}
                                {primaryIcon}
                            </Link>
                        </Button>
                        {ctaContent.secondaryButton && (
                            <Button
                                asChild
                                size='lg'
                                variant={
                                    ctaContent.secondaryButton.variant ??
                                    'outline'
                                }
                            >
                                <Link href={ctaContent.secondaryButton.href}>
                                    {ctaContent.secondaryButton.text}
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>
            </aside>
        )
    }

    // Footer variant
    return (
        <section className={getColorSchemeClasses(colorScheme, 'footer')}>
            <div className='mx-auto max-w-3xl text-center'>
                <h2
                    className={cn(
                        'mb-4 text-3xl font-bold tracking-tight sm:text-4xl',
                        textColors.heading
                    )}
                >
                    {ctaContent.heading}
                </h2>
                <p
                    className={cn(
                        'mb-8 text-lg leading-relaxed',
                        textColors.description
                    )}
                >
                    {ctaContent.description}
                </p>
                <div className='flex flex-col justify-center gap-4 sm:flex-row'>
                    <Button asChild size='lg' variant={buttonVariant}>
                        <Link href={ctaContent.primaryButton.href}>
                            {ctaContent.primaryButton.text}
                            {primaryIcon}
                        </Link>
                    </Button>
                    {ctaContent.secondaryButton && (
                        <Button
                            asChild
                            size='lg'
                            variant={
                                ctaContent.secondaryButton.variant ?? 'outline'
                            }
                        >
                            <Link href={ctaContent.secondaryButton.href}>
                                {ctaContent.secondaryButton.text}
                            </Link>
                        </Button>
                    )}
                </div>
            </div>
        </section>
    )
}
