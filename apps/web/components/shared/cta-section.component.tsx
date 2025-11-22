/**
 * CTASection Component
 *
 * A prominent call-to-action section with heading, description,
 * and primary/secondary buttons. Features flexible layouts and
 * background variants.
 *
 * @example
 * ```tsx
 * <CTASection
 *   heading="Ready to Get Started?"
 *   description="Join thousands of satisfied customers today"
 *   primaryButton={{ text: "Sign Up Now", href: "/signup" }}
 *   secondaryButton={{ text: "Learn More", href: "/about", variant: "outline" }}
 *   variant="accent"
 * />
 * ```
 */
import { Button } from '@workspace/ui/components/button'
import { cn } from '@workspace/ui/lib/utils'
import Link from 'next/link'

import type { CTASectionProps } from '@/lib/types/sections/cta-section.type'

import { ContentWrapper } from './ContentWrapper.component'
import { SectionContainer } from './SectionContainer.component'

const containerStyles = 'flex items-center'

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
}: CTASectionProps) {
    const isPrimaryVariant = variant === 'primary'

    return (
        <SectionContainer
            id={id}
            variant={variant === 'primary' ? 'default' : variant}
            noPadding
            className={cn(
                variantStyles[variant],
                sizeStyles[size],
                containerStyles,
                className
            )}
        >
            <ContentWrapper size='md'>
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
                                'text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl',
                                isPrimaryVariant
                                    ? 'text-primary-foreground'
                                    : 'text-foreground'
                            )}
                        >
                            {heading}
                        </h2>

                        {description && (
                            <div
                                className={cn(
                                    'text-base md:text-lg',
                                    isPrimaryVariant
                                        ? 'text-primary-foreground/90'
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
                                    isPrimaryVariant
                                        ? 'secondary'
                                        : primaryButton.variant || 'default'
                                }
                                onClick={primaryButton.onClick}
                                className='min-w-[140px]'
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
                                    isPrimaryVariant
                                        ? 'secondary'
                                        : primaryButton.variant || 'default'
                                }
                                className='min-w-[140px]'
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
                                            isPrimaryVariant
                                                ? 'outline'
                                                : secondaryButton.variant ||
                                                  'outline'
                                        }
                                        onClick={secondaryButton.onClick}
                                        className={cn(
                                            'min-w-[140px]',
                                            isPrimaryVariant &&
                                                'border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10'
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
                                            isPrimaryVariant
                                                ? 'outline'
                                                : secondaryButton.variant ||
                                                  'outline'
                                        }
                                        className={cn(
                                            'min-w-[140px]',
                                            isPrimaryVariant &&
                                                'border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10'
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
