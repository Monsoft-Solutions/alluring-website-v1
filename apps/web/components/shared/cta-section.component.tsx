'use client'

import { useRef } from 'react'
import { Button } from '@workspace/ui/components/button'
import { cn } from '@workspace/ui/lib/utils'
import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'
import Image from 'next/image'
import { Sparkles } from 'lucide-react'

import type { CTASectionProps } from '@/lib/types/sections/cta-section.type'
import { siteConfig } from '@/lib/data/site-config'

import { ContentWrapper } from './content-wrapper.component'
import { SectionContainer } from './section-container.component'
import { useAnalyticsEvent } from '@/lib/analytics/useAnalyticsEvent.hook'

const containerStyles = 'flex items-center relative overflow-hidden'

/**
 * Maps variant to background classes
 */
const variantStyles = {
    default: 'bg-background',
    muted: 'bg-muted/30',
    accent: 'bg-accent/30',
    primary: 'bg-primary text-primary-foreground',
    luxury: 'bg-stone-900',
}

/**
 * Maps alignment to flexbox classes
 */
const alignmentStyles = {
    left: 'text-left items-start',
    center: 'text-center items-center flex flex-col justify-center',
    right: 'text-right items-end',
}

/**
 * Maps size to padding classes
 */
const sizeStyles = {
    sm: 'py-12 md:py-16',
    default: 'py-16 md:py-24',
    lg: 'py-24 md:py-32',
}

/**
 * Luxury CTA variant component
 * Premium design with split layout, trust badges, and gold accents
 */
function LuxuryCTASection({
    heading,
    description,
    primaryButton,
    secondaryButton,
    className,
    id = 'cta',
    size = 'lg',
    backgroundImage,
    trustBadges,
    eyebrow,
    stats,
}: CTASectionProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const { track } = useAnalyticsEvent()

    const handlePrimaryClick = () => {
        track('cta_click', {
            cta_name: id,
            cta_text: primaryButton.text,
            cta_variant: 'luxury',
            cta_position: 'primary',
            section_id: id,
        })
    }

    const handleSecondaryClick = () => {
        if (secondaryButton) {
            track('cta_click', {
                cta_name: id,
                cta_text: secondaryButton.text,
                cta_variant: 'luxury',
                cta_position: 'secondary',
                section_id: id,
            })
        }
    }

    // Use stats from props if provided, otherwise fall back to siteConfig
    // Default values as fallback if neither is provided
    const displayStats = stats ??
        siteConfig.trustStats ?? {
            patients: '5,000+',
            years: '15+',
            certified: '100%',
            rating: '4.7',
            accreditation: 'Double Board-Certified',
        }

    const { scrollYProgress } = useScroll({
        target: backgroundImage ? containerRef : undefined,
        offset: ['start end', 'end start'],
    })

    const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])
    const opacity = useTransform(
        scrollYProgress,
        [0, 0.3, 0.7, 1],
        [0.6, 1, 1, 0.6]
    )

    return (
        <SectionContainer
            id={id}
            variant='default'
            noPadding
            className={cn(
                'relative min-h-[500px] overflow-hidden bg-stone-900 lg:min-h-[600px]',
                sizeStyles[size],
                containerStyles,
                className
            )}
        >
            {/* Parallax Background Image with Premium Overlay */}
            {backgroundImage && (
                <div
                    ref={containerRef}
                    className='absolute inset-0 -top-[15%] z-0 h-[130%]'
                >
                    <motion.div
                        style={{ y, opacity }}
                        className='relative h-full w-full'
                    >
                        <Image
                            src={backgroundImage}
                            alt='Background'
                            fill
                            className='object-cover'
                            priority={false}
                        />
                        {/* Sophisticated gradient overlay */}
                        <div className='absolute inset-0 bg-linear-to-r from-stone-900/95 via-stone-900/80 to-stone-900/60' />
                        <div className='absolute inset-0 bg-linear-to-t from-stone-900/90 via-transparent to-stone-900/40' />
                    </motion.div>
                </div>
            )}

            {/* Decorative elements */}
            <div className='bg-gold-500/10 pointer-events-none absolute top-1/4 left-0 h-[400px] w-[400px] -translate-x-1/2 rounded-full blur-[120px]' />
            <div className='bg-gold-400/5 pointer-events-none absolute right-0 bottom-0 h-[300px] w-[300px] translate-x-1/3 rounded-full blur-[100px]' />

            <ContentWrapper
                size='lg'
                paddingX='px-6 md:px-12'
                className='relative z-10'
            >
                <div className='grid items-center gap-12 lg:grid-cols-12 lg:gap-16'>
                    {/* Left Column - Main Content */}
                    <motion.div
                        className='lg:col-span-7'
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
                        viewport={{ once: true }}
                    >
                        {/* Eyebrow Badge */}
                        {eyebrow && (
                            <div className='border-gold-500/30 bg-gold-500/10 mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-2'>
                                <Sparkles className='text-gold-400 h-4 w-4' />
                                <span className='text-gold-400 text-sm font-medium tracking-wide'>
                                    {eyebrow}
                                </span>
                            </div>
                        )}

                        {/* Heading */}
                        <h2 className='mb-6 font-serif text-4xl leading-tight text-white md:text-5xl lg:text-6xl'>
                            {heading}
                        </h2>

                        {/* Gold Accent Line */}
                        <div className='bg-gold-500 mb-8 h-1 w-24 shadow-[0_0_20px_rgba(234,179,8,0.4)]' />

                        {/* Description */}
                        {description && (
                            <div className='mb-10 max-w-xl text-lg leading-relaxed font-light text-stone-300 md:text-xl'>
                                {description}
                            </div>
                        )}

                        {/* Trust Badges */}
                        {trustBadges && trustBadges.length > 0 && (
                            <motion.div
                                className='mb-10 flex flex-wrap gap-6'
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                                viewport={{ once: true }}
                            >
                                {trustBadges.map((badge, idx) => (
                                    <div
                                        key={idx}
                                        className='flex items-center gap-3 text-stone-400'
                                    >
                                        <div className='text-gold-500 flex h-10 w-10 items-center justify-center rounded-full bg-white/5'>
                                            {badge.icon}
                                        </div>
                                        <span className='text-sm font-medium'>
                                            {badge.label}
                                        </span>
                                    </div>
                                ))}
                            </motion.div>
                        )}

                        {/* CTA Buttons */}
                        <motion.div
                            className='flex flex-col gap-4 sm:flex-row'
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            viewport={{ once: true }}
                        >
                            {/* Primary Button */}
                            {primaryButton.onClick ? (
                                <Button
                                    size='lg'
                                    variant='default'
                                    onClick={() => {
                                        handlePrimaryClick()
                                        primaryButton.onClick?.()
                                    }}
                                    className='bg-gold-500 hover:bg-gold-600 min-w-[200px] border-none px-8 py-6 text-base font-bold tracking-wide text-white uppercase shadow-lg shadow-amber-500/20 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/30'
                                >
                                    {primaryButton.icon &&
                                        primaryButton.iconPosition !==
                                            'right' &&
                                        primaryButton.icon}
                                    {primaryButton.text}
                                    {primaryButton.icon &&
                                        primaryButton.iconPosition ===
                                            'right' &&
                                        primaryButton.icon}
                                </Button>
                            ) : (
                                <Button
                                    asChild
                                    size='lg'
                                    variant='default'
                                    className='bg-gold-500 hover:bg-gold-600 min-w-[200px] border-none px-8 py-6 text-base font-bold tracking-wide text-white uppercase shadow-lg shadow-amber-500/20 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/30'
                                >
                                    <Link
                                        href={primaryButton.href}
                                        onClick={handlePrimaryClick}
                                        {...(primaryButton.external && {
                                            target: '_blank',
                                            rel: 'noopener noreferrer',
                                        })}
                                    >
                                        {primaryButton.icon &&
                                            primaryButton.iconPosition !==
                                                'right' &&
                                            primaryButton.icon}
                                        {primaryButton.text}
                                        {primaryButton.icon &&
                                            primaryButton.iconPosition ===
                                                'right' &&
                                            primaryButton.icon}
                                    </Link>
                                </Button>
                            )}

                            {/* Secondary Button */}
                            {secondaryButton && (
                                <>
                                    {secondaryButton.onClick ? (
                                        <Button
                                            size='lg'
                                            variant='outline'
                                            onClick={() => {
                                                handleSecondaryClick()
                                                secondaryButton.onClick?.()
                                            }}
                                            className='hover:border-gold-500/50 min-w-[160px] border-white/20 bg-white/5 px-8 py-6 text-base font-bold tracking-wide text-white uppercase backdrop-blur-sm transition-all duration-300 hover:bg-white/10 hover:text-white'
                                        >
                                            {secondaryButton.icon &&
                                                secondaryButton.iconPosition !==
                                                    'right' &&
                                                secondaryButton.icon}
                                            {secondaryButton.text}
                                            {secondaryButton.icon &&
                                                secondaryButton.iconPosition ===
                                                    'right' &&
                                                secondaryButton.icon}
                                        </Button>
                                    ) : (
                                        <Button
                                            asChild
                                            size='lg'
                                            variant='outline'
                                            className='hover:border-gold-500/50 min-w-[160px] border-white/20 bg-white/5 px-8 py-6 text-base font-bold tracking-wide text-white uppercase backdrop-blur-sm transition-all duration-300 hover:bg-white/10 hover:text-white'
                                        >
                                            <Link
                                                href={secondaryButton.href}
                                                onClick={handleSecondaryClick}
                                                {...(secondaryButton.external && {
                                                    target: '_blank',
                                                    rel: 'noopener noreferrer',
                                                })}
                                            >
                                                {secondaryButton.icon &&
                                                    secondaryButton.iconPosition !==
                                                        'right' &&
                                                    secondaryButton.icon}
                                                {secondaryButton.text}
                                                {secondaryButton.icon &&
                                                    secondaryButton.iconPosition ===
                                                        'right' &&
                                                    secondaryButton.icon}
                                            </Link>
                                        </Button>
                                    )}
                                </>
                            )}
                        </motion.div>
                    </motion.div>

                    {/* Right Column - Visual Element / Stats */}
                    <motion.div
                        className='hidden flex-col items-end justify-center lg:col-span-5 lg:flex'
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{
                            duration: 0.8,
                            delay: 0.2,
                            ease: [0.19, 1, 0.22, 1],
                        }}
                        viewport={{ once: true }}
                    >
                        {/* Premium Stats Card */}
                        {displayStats && (
                            <div className='relative w-full max-w-sm'>
                                {/* Glass card effect */}
                                <div className='rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-md'>
                                    <div className='mb-6 text-center'>
                                        <div className='mb-2 font-serif text-sm font-medium tracking-widest text-stone-400 uppercase'>
                                            Trusted By
                                        </div>
                                        <div className='text-gold-400 font-serif text-6xl font-bold'>
                                            {displayStats.patients}
                                        </div>
                                        <div className='text-lg text-stone-300'>
                                            Happy Patients
                                        </div>
                                    </div>

                                    <div className='border-t border-white/10 pt-6'>
                                        <div className='grid grid-cols-2 gap-4'>
                                            <div className='text-center'>
                                                <div className='text-gold-400 font-serif text-3xl font-bold'>
                                                    {displayStats.years}
                                                </div>
                                                <div className='text-sm text-stone-400'>
                                                    Years Experience
                                                </div>
                                            </div>
                                            <div className='text-center'>
                                                <div className='text-gold-400 font-serif text-3xl font-bold'>
                                                    {displayStats.certified}
                                                </div>
                                                <div className='text-sm text-stone-400'>
                                                    Board-Certified
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Decorative corner accent */}
                                <div className='bg-gold-500 absolute -top-2 -right-2 h-16 w-16 rounded-tr-2xl opacity-20 blur-xl' />
                                <div className='border-gold-500 absolute -top-2 -right-2 h-8 w-8 rounded-tr-xl border-t-2 border-r-2' />
                            </div>
                        )}
                    </motion.div>
                </div>
            </ContentWrapper>
        </SectionContainer>
    )
}

/**
 * Default CTA variant component
 */
function DefaultCTASection({
    heading,
    description,
    primaryButton,
    secondaryButton,
    variant = 'accent',
    align = 'center',
    className,
    id = 'cta',
    buttonLayout = 'stack',
    size = 'default',
    backgroundImage,
}: CTASectionProps) {
    const isPrimaryVariant = variant === 'primary'
    const containerRef = useRef<HTMLDivElement>(null)
    const { track } = useAnalyticsEvent()

    const handlePrimaryClick = () => {
        track('cta_click', {
            cta_name: id,
            cta_text: primaryButton.text,
            cta_variant: variant,
            cta_position: 'primary',
            section_id: id,
        })
    }

    const handleSecondaryClick = () => {
        if (secondaryButton) {
            track('cta_click', {
                cta_name: id,
                cta_text: secondaryButton.text,
                cta_variant: variant,
                cta_position: 'secondary',
                section_id: id,
            })
        }
    }

    // Only use scroll-based animations when we have a background image
    const { scrollYProgress } = useScroll({
        target: backgroundImage ? containerRef : undefined,
        offset: ['start end', 'end start'],
    })

    const y = useTransform(scrollYProgress, [0, 1], ['0%', '20%'])

    return (
        <SectionContainer
            id={id}
            variant={
                backgroundImage
                    ? 'default'
                    : variant === 'primary'
                      ? 'default'
                      : variant === 'luxury'
                        ? 'default'
                        : variant
            }
            noPadding
            className={cn(
                !backgroundImage &&
                    variant !== 'luxury' &&
                    variantStyles[variant],
                sizeStyles[size],
                containerStyles,
                className
            )}
        >
            {/* Parallax Background Image */}
            {backgroundImage && (
                <div
                    ref={containerRef}
                    className='absolute inset-0 -top-[10%] z-0 h-[120%]'
                >
                    <motion.div
                        style={{ y }}
                        className='relative h-full w-full'
                    >
                        <Image
                            src={backgroundImage}
                            alt='Background'
                            fill
                            className='object-cover'
                            priority={false}
                        />
                        <div className='absolute inset-0 bg-stone-900/60 backdrop-blur-[2px]' />
                    </motion.div>
                </div>
            )}

            <ContentWrapper size='md' className='relative z-10'>
                <div
                    className={cn(
                        'flex flex-col gap-8',
                        alignmentStyles[align]
                    )}
                >
                    {/* Header Content */}
                    <div
                        className={cn(
                            'space-y-4',
                            align === 'center' && 'mx-auto max-w-2xl'
                        )}
                    >
                        <h2
                            className={cn(
                                'font-serif text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl',
                                isPrimaryVariant || backgroundImage
                                    ? 'text-white'
                                    : 'text-stone-900'
                            )}
                        >
                            {heading}
                        </h2>

                        {description && (
                            <div
                                className={cn(
                                    'text-base leading-relaxed font-light md:text-lg',
                                    isPrimaryVariant || backgroundImage
                                        ? 'text-stone-200'
                                        : 'text-muted-foreground'
                                )}
                            >
                                {description}
                            </div>
                        )}
                    </div>

                    {/* CTA Buttons */}
                    <div
                        className={cn(
                            'flex gap-4',
                            buttonLayout === 'stack'
                                ? 'flex-col sm:flex-row'
                                : 'flex-row flex-wrap',
                            align === 'center' && 'justify-center',
                            align === 'right' && 'justify-end'
                        )}
                    >
                        {/* Primary Button */}
                        {primaryButton.onClick ? (
                            <Button
                                size='lg'
                                variant={
                                    isPrimaryVariant || backgroundImage
                                        ? 'default' // Use default (gold) on dark bg
                                        : primaryButton.variant || 'primary'
                                }
                                onClick={() => {
                                    handlePrimaryClick()
                                    primaryButton.onClick?.()
                                }}
                                className={cn(
                                    'min-w-[140px] font-bold tracking-wide uppercase',
                                    (isPrimaryVariant || backgroundImage) &&
                                        'bg-gold-500 hover:bg-gold-600 border-none text-white'
                                )}
                            >
                                {primaryButton.icon &&
                                    primaryButton.iconPosition !== 'right' &&
                                    primaryButton.icon}
                                {primaryButton.text}
                                {primaryButton.icon &&
                                    primaryButton.iconPosition === 'right' &&
                                    primaryButton.icon}
                            </Button>
                        ) : (
                            <Button
                                asChild
                                size='lg'
                                variant={
                                    isPrimaryVariant || backgroundImage
                                        ? 'default'
                                        : primaryButton.variant || 'primary'
                                }
                                className={cn(
                                    'min-w-[140px] font-bold tracking-wide uppercase',
                                    (isPrimaryVariant || backgroundImage) &&
                                        'bg-gold-500 hover:bg-gold-600 border-none text-white'
                                )}
                            >
                                <Link
                                    href={primaryButton.href}
                                    onClick={handlePrimaryClick}
                                    {...(primaryButton.external && {
                                        target: '_blank',
                                        rel: 'noopener noreferrer',
                                    })}
                                >
                                    {primaryButton.icon &&
                                        primaryButton.iconPosition !==
                                            'right' &&
                                        primaryButton.icon}
                                    {primaryButton.text}
                                    {primaryButton.icon &&
                                        primaryButton.iconPosition ===
                                            'right' &&
                                        primaryButton.icon}
                                </Link>
                            </Button>
                        )}

                        {/* Secondary Button */}
                        {secondaryButton && (
                            <>
                                {secondaryButton.onClick ? (
                                    <Button
                                        size='lg'
                                        variant={
                                            isPrimaryVariant || backgroundImage
                                                ? 'outline'
                                                : secondaryButton.variant ||
                                                  'outline'
                                        }
                                        onClick={() => {
                                            handleSecondaryClick()
                                            secondaryButton.onClick?.()
                                        }}
                                        className={cn(
                                            'min-w-[140px] font-bold tracking-wide uppercase',
                                            (isPrimaryVariant ||
                                                backgroundImage) &&
                                                'border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white'
                                        )}
                                    >
                                        {secondaryButton.icon &&
                                            secondaryButton.iconPosition !==
                                                'right' &&
                                            secondaryButton.icon}
                                        {secondaryButton.text}
                                        {secondaryButton.icon &&
                                            secondaryButton.iconPosition ===
                                                'right' &&
                                            secondaryButton.icon}
                                    </Button>
                                ) : (
                                    <Button
                                        asChild
                                        size='lg'
                                        variant={
                                            isPrimaryVariant || backgroundImage
                                                ? 'outline'
                                                : secondaryButton.variant ||
                                                  'outline'
                                        }
                                        className={cn(
                                            'min-w-[140px] font-bold tracking-wide uppercase',
                                            (isPrimaryVariant ||
                                                backgroundImage) &&
                                                'border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white'
                                        )}
                                    >
                                        <Link
                                            href={secondaryButton.href}
                                            onClick={handleSecondaryClick}
                                            {...(secondaryButton.external && {
                                                target: '_blank',
                                                rel: 'noopener noreferrer',
                                            })}
                                        >
                                            {secondaryButton.icon &&
                                                secondaryButton.iconPosition !==
                                                    'right' &&
                                                secondaryButton.icon}
                                            {secondaryButton.text}
                                            {secondaryButton.icon &&
                                                secondaryButton.iconPosition ===
                                                    'right' &&
                                                secondaryButton.icon}
                                        </Link>
                                    </Button>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </ContentWrapper>
        </SectionContainer>
    )
}

/**
 * CTASection Component
 *
 * A prominent call-to-action section with multiple variants:
 * - default/muted/accent/primary: Standard centered CTA
 * - luxury: Premium split-layout with trust badges and gold accents
 */
export function CTASection(props: CTASectionProps) {
    if (props.variant === 'luxury') {
        return <LuxuryCTASection {...props} />
    }

    return <DefaultCTASection {...props} />
}
