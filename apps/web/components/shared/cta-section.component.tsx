'use client'

import { useRef } from 'react'
import { Button } from '@workspace/ui/components/button'
import { cn } from '@workspace/ui/lib/utils'
import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'
import Image from 'next/image'

import type { CTASectionProps } from '@/lib/types/sections/cta-section.type'

import { ContentWrapper } from './content-wrapper.component'
import { SectionContainer } from './section-container.component'

const containerStyles = 'flex items-center relative overflow-hidden'

/**
 * Maps variant to background classes
 */
const variantStyles = {
    default: 'bg-background',
    muted: 'bg-muted/30',
    accent: 'bg-accent/30',
    primary: 'bg-primary text-primary-foreground',
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

export function CTASection({
    heading,
    description,
    primaryButton,
    secondaryButton,
    variant = 'accent',
    align = 'center',
    className,
    id,
    buttonLayout = 'stack',
    size = 'default',
    backgroundImage,
}: CTASectionProps) {
    const isPrimaryVariant = variant === 'primary'
    const containerRef = useRef<HTMLDivElement>(null)

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
                      : variant
            }
            noPadding
            className={cn(
                !backgroundImage && variantStyles[variant],
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
                                onClick={primaryButton.onClick}
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
                                        onClick={secondaryButton.onClick}
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
