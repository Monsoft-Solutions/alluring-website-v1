/**
 * StackingFeatureCard Component
 *
 * A visually rich feature card designed for the stacking scroll effect.
 * Includes an image, title, and description in an elegant layout with
 * enhanced hover effects, gradient overlays, and smooth transitions.
 *
 * Features:
 * - Gradient glow effect on hover
 * - Dynamic border color transitions
 * - Smooth image scaling
 * - Optimized for stacking animations
 *
 * @example
 * ```tsx
 * <StackingFeatureCard
 *   title="Fast Development"
 *   description="Ship faster with our tools"
 *   imageSrc="/images/feature-1.jpg"
 *   imageAlt="Development tools"
 * />
 * ```
 */
import { cn } from '@workspace/ui/lib/utils'
import Image from 'next/image'

export type StackingFeatureCardProps = {
    /** Feature title */
    title: string
    /** Feature description */
    description: string
    /** Image source path */
    imageSrc: string
    /** Image alt text */
    imageAlt: string
    /** Additional CSS classes */
    className?: string
}

export function StackingFeatureCard({
    title,
    description,
    imageSrc,
    imageAlt,
    className,
}: StackingFeatureCardProps) {
    return (
        <div
            className={cn(
                'group relative overflow-hidden rounded-2xl border shadow-2xl',
                'border-border/50 bg-background',
                'transition-all duration-500',
                // Gradient overlay effect
                'before:absolute before:inset-0 before:z-10 before:rounded-2xl',
                'before:from-primary/10 before:bg-gradient-to-br before:via-transparent before:to-transparent',
                'before:opacity-0 before:transition-opacity before:duration-500',
                'hover:before:opacity-100',
                // Border glow effect
                'hover:border-primary/30',
                'hover:shadow-xl',
                // Subtle lift on hover
                'hover:scale-[1.02]',
                className
            )}
        >
            {/* Image Section - Top Half */}
            <div className='bg-muted/30 relative h-64 w-full overflow-hidden md:h-80'>
                <Image
                    src={imageSrc}
                    alt={imageAlt}
                    fill
                    className='object-cover transition-transform duration-700 ease-out group-hover:scale-110'
                    sizes='(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 45vw'
                />
                {/* Gradient Overlay - Enhanced */}
                <div className='to-background/90 group-hover:to-background/95 absolute inset-0 bg-gradient-to-b from-transparent via-transparent transition-opacity duration-500' />
            </div>

            {/* Content Section - Bottom Half - Centered */}
            <div className='relative z-20 flex flex-col items-center space-y-4 p-8 text-center md:p-10'>
                {/* Title */}
                <h3 className='text-foreground group-hover:text-primary text-2xl font-bold tracking-tight transition-colors duration-300 md:text-3xl'>
                    {title}
                </h3>

                {/* Description */}
                <p className='text-muted-foreground group-hover:text-foreground text-base leading-relaxed transition-colors duration-300 md:text-lg'>
                    {description}
                </p>
            </div>
        </div>
    )
}
