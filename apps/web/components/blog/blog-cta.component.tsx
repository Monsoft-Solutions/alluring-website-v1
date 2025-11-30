/**
 * BlogCTA Component
 *
 * Extensible call-to-action component for blog posts.
 * Branded for Alluring Plastic Surgery with luxury aesthetics.
 *
 * Features:
 * - Inline variant: Gold-accented CTA with phone number display
 * - Footer variant: Lead capture form (name + phone only)
 * - Glassmorphism design with world-class aesthetics
 *
 * @example
 * ```tsx
 * // Inline CTA with predefined content
 * <BlogCTA variant="inline" ctaId="consultation" />
 *
 * // Footer lead capture form
 * <BlogCTA variant="footer" ctaId="consultation" />
 * ```
 */
'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@workspace/ui/components/button'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from '@workspace/ui/components/form'
import { Input } from '@workspace/ui/components/input'
import { cn } from '@workspace/ui/lib/utils'
import {
    AlertCircle,
    ArrowRight,
    CheckCircle2,
    Loader2,
    Mail,
    MessageCircle,
    Phone,
    Sparkles,
    Star,
} from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import {
    defaultCTAContent,
    footerCTAConfig,
    getCTAContentById,
} from '@/lib/data/blog-cta-content'
import type {
    BlogCTAProps,
    CTAColorScheme,
} from '@/lib/types/blog/blog-cta.type'
import {
    CONTACT_SOURCES,
    type ContactFormResponse,
    type LeadCaptureInput,
    leadCaptureSchema,
} from '@/lib/types/forms/contact-form.type'

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
        inline: 'my-12 rounded-2xl border px-8 py-12 md:px-12 md:py-16',
        footer: 'mt-20 rounded-2xl border px-8 py-12 md:px-12 md:py-16',
    }

    const colorClasses = {
        gold: {
            bg: 'bg-gradient-to-br from-stone-900 via-stone-900 to-stone-800',
            border: 'border-gold-500/30',
        },
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
 */
function getTextColorClasses(colorScheme: CTAColorScheme) {
    if (colorScheme === 'gold') {
        return {
            heading: 'text-white',
            description: 'text-stone-300',
            accent: 'text-gold-400',
        }
    }

    if (colorScheme === 'default') {
        return {
            heading: 'text-foreground',
            description: 'text-muted-foreground',
            accent: 'text-primary',
        }
    }

    // For colored schemes (blue, green, orange), use white text
    return {
        heading: 'text-white',
        description: 'text-white/90',
        accent: 'text-white',
    }
}

export function BlogCTA({
    variant,
    content,
    ctaId,
    colorScheme: propColorScheme,
}: BlogCTAProps) {
    // Form state for footer variant
    const [submissionState, setSubmissionState] = useState<{
        status: 'idle' | 'success' | 'error'
        message: string
    }>({
        status: 'idle',
        message: '',
    })

    const form = useForm<LeadCaptureInput>({
        resolver: zodResolver(leadCaptureSchema),
        defaultValues: {
            name: '',
            phone: '',
        },
    })

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

    // Determine color scheme (priority: prop > content.colorScheme > 'gold' default)
    const colorScheme: CTAColorScheme =
        propColorScheme ?? ctaContent.colorScheme ?? 'gold'

    const primaryIcon = getIcon(ctaContent.primaryButton.iconName)
    const textColors = getTextColorClasses(colorScheme)

    /**
     * Handle lead capture form submission
     * Uses unified /api/contact endpoint with blog-lead source
     */
    const onSubmit = async (data: LeadCaptureInput) => {
        try {
            setSubmissionState({ status: 'idle', message: '' })

            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...data,
                    source: CONTACT_SOURCES.BLOG_LEAD,
                }),
            })

            const result: ContactFormResponse = await response.json()

            if (response.ok && result.success) {
                setSubmissionState({
                    status: 'success',
                    message:
                        result.message ||
                        "Thank you! We'll call you within 24 hours.",
                })
                form.reset()
            } else {
                setSubmissionState({
                    status: 'error',
                    message:
                        result.error ||
                        'Something went wrong. Please try again.',
                })
            }
        } catch (error) {
            console.error('Lead capture submission error:', error)
            setSubmissionState({
                status: 'error',
                message: 'Network error. Please check your connection.',
            })
        }
    }

    const isSubmitting = form.formState.isSubmitting

    // Inline variant - branded CTA box with phone number
    if (variant === 'inline') {
        return (
            <aside
                className={cn(
                    getColorSchemeClasses(colorScheme, 'inline'),
                    'relative overflow-hidden'
                )}
            >
                {/* Decorative elements */}
                <div className='bg-gold-500/5 absolute top-0 right-0 h-64 w-64 translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl' />
                <div className='bg-gold-500/5 absolute bottom-0 left-0 h-48 w-48 -translate-x-1/2 translate-y-1/2 rounded-full blur-3xl' />

                <div className='relative flex flex-col gap-8'>
                    {/* Header */}
                    <div className='space-y-4'>
                        <div className='flex items-center gap-2'>
                            <Star
                                className={cn(
                                    'h-5 w-5 fill-current',
                                    textColors.accent
                                )}
                            />
                            <span
                                className={cn(
                                    'text-sm font-semibold tracking-wide uppercase',
                                    textColors.accent
                                )}
                            >
                                Alluring Plastic Surgery
                            </span>
                        </div>
                        <h3
                            className={cn(
                                'font-serif text-3xl font-bold tracking-tight md:text-4xl',
                                textColors.heading
                            )}
                        >
                            {ctaContent.heading}
                        </h3>
                        <p
                            className={cn(
                                'max-w-2xl text-lg leading-relaxed',
                                textColors.description
                            )}
                        >
                            {ctaContent.description}
                        </p>
                    </div>

                    {/* Phone number highlight */}
                    {ctaContent.phoneNumber && (
                        <a
                            href={`tel:${ctaContent.phoneNumber.replace(/[\s()-]/g, '')}`}
                            className='group inline-flex items-center gap-3 self-start'
                        >
                            <span className='bg-gold-500/20 group-hover:bg-gold-500/30 flex h-12 w-12 items-center justify-center rounded-full transition-colors'>
                                <Phone className='text-gold-400 h-5 w-5' />
                            </span>
                            <span className='flex flex-col'>
                                <span className='text-sm text-stone-400'>
                                    Call us now
                                </span>
                                <span className='group-hover:text-gold-400 text-xl font-bold text-white transition-colors'>
                                    {ctaContent.phoneNumber}
                                </span>
                            </span>
                        </a>
                    )}

                    {/* Action buttons */}
                    <div className='flex flex-col gap-4 sm:flex-row'>
                        <Button
                            asChild
                            size='lg'
                            variant='gold'
                            className='h-14 px-8 text-base font-semibold shadow-lg transition-all hover:shadow-xl'
                        >
                            <Link href={ctaContent.primaryButton.href}>
                                {ctaContent.primaryButton.text}
                                {primaryIcon}
                            </Link>
                        </Button>
                        {ctaContent.secondaryButton && (
                            <Button
                                asChild
                                size='lg'
                                variant='outline'
                                className='h-14 border-stone-600 px-8 text-base font-semibold text-white hover:bg-white/10 hover:text-white'
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

    // Footer variant - Lead capture form
    return (
        <section
            className={cn(
                'relative mt-20 overflow-hidden rounded-2xl border',
                'bg-gradient-to-br from-stone-900 via-stone-900 to-stone-800',
                'border-gold-500/30'
            )}
        >
            {/* Decorative background */}
            <div className='absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.08),transparent_60%)]' />
            <div className='absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(212,175,55,0.05),transparent_50%)]' />

            <div className='relative px-8 py-12 md:px-12 md:py-16'>
                <div className='mx-auto max-w-xl'>
                    {/* Header */}
                    <div className='mb-10 text-center'>
                        <div className='mb-4 inline-flex items-center gap-2'>
                            <Sparkles className='text-gold-400 h-5 w-5' />
                            <span className='text-gold-400 text-sm font-semibold tracking-wide uppercase'>
                                Free Consultation
                            </span>
                        </div>
                        <h2 className='mb-3 font-serif text-3xl font-bold tracking-tight text-white md:text-4xl'>
                            {footerCTAConfig.heading}
                        </h2>
                        <p className='text-lg leading-relaxed text-stone-300'>
                            {footerCTAConfig.description}
                        </p>
                    </div>

                    {/* Success state */}
                    {submissionState.status === 'success' ? (
                        <div className='rounded-xl border border-green-500/30 bg-green-500/10 p-8 text-center'>
                            <div className='mb-4 flex justify-center'>
                                <div className='flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20'>
                                    <CheckCircle2 className='h-8 w-8 text-green-400' />
                                </div>
                            </div>
                            <h3 className='mb-2 text-xl font-semibold text-white'>
                                Thank You!
                            </h3>
                            <p className='text-stone-300'>
                                {submissionState.message}
                            </p>
                        </div>
                    ) : (
                        /* Lead capture form */
                        <Form {...form}>
                            <form
                                onSubmit={form.handleSubmit(onSubmit)}
                                className='space-y-6'
                            >
                                {/* Form fields */}
                                <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                                    <FormField
                                        control={form.control}
                                        name='name'
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <Input
                                                        placeholder='Your Name'
                                                        {...field}
                                                        disabled={isSubmitting}
                                                        className='focus:border-gold-500/50 focus:ring-gold-500/20 h-14 border-stone-700 bg-white/5 text-white placeholder:text-stone-500'
                                                    />
                                                </FormControl>
                                                <FormMessage className='text-red-400' />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name='phone'
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <Input
                                                        type='tel'
                                                        placeholder='Phone Number'
                                                        {...field}
                                                        disabled={isSubmitting}
                                                        className='focus:border-gold-500/50 focus:ring-gold-500/20 h-14 border-stone-700 bg-white/5 text-white placeholder:text-stone-500'
                                                    />
                                                </FormControl>
                                                <FormMessage className='text-red-400' />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {/* Error message */}
                                {submissionState.status === 'error' && (
                                    <div className='flex items-center gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-400'>
                                        <AlertCircle className='h-5 w-5 flex-shrink-0' />
                                        <p className='text-sm'>
                                            {submissionState.message}
                                        </p>
                                    </div>
                                )}

                                {/* Submit button */}
                                <Button
                                    type='submit'
                                    size='lg'
                                    variant='gold'
                                    disabled={isSubmitting}
                                    className='h-14 w-full text-base font-semibold shadow-lg transition-all hover:shadow-xl'
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className='mr-2 h-5 w-5 animate-spin' />
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            {footerCTAConfig.submitButtonText}
                                            <ArrowRight className='ml-2 h-5 w-5' />
                                        </>
                                    )}
                                </Button>

                                {/* Trust badge */}
                                <div className='flex items-center justify-center gap-2 text-sm text-stone-400'>
                                    <CheckCircle2 className='text-gold-400 h-4 w-4' />
                                    <span>{footerCTAConfig.trustBadge}</span>
                                </div>
                            </form>
                        </Form>
                    )}

                    {/* Alternative: Call directly */}
                    <div className='mt-8 border-t border-stone-700/50 pt-8 text-center'>
                        <p className='mb-3 text-sm text-stone-400'>
                            Or call us directly
                        </p>
                        <a
                            href={`tel:${footerCTAConfig.phoneNumber.replace(/[\s()-]/g, '')}`}
                            className='hover:text-gold-400 inline-flex items-center gap-2 text-xl font-bold text-white transition-colors'
                        >
                            <Phone className='h-5 w-5' />
                            {footerCTAConfig.phoneNumber}
                        </a>
                    </div>
                </div>
            </div>
        </section>
    )
}
