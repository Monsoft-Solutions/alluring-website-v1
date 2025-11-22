/**
 * StackingCard Component
 *
 * A wrapper component that creates an enhanced stacking scroll effect for cards.
 * Cards travel up through a vertical path and pin to the top of the viewport,
 * stacking on top of each other with sophisticated 3D animations, dynamic shadows,
 * and blur effects.
 *
 * Features:
 * - 3D perspective transforms for depth perception
 * - Dynamic shadow and blur effects
 * - Performance optimized with RAF throttling and Intersection Observer
 * - Accessibility support for reduced motion preferences
 * - Fully configurable animation intensity and variants
 *
 * @example
 * ```tsx
 * <StackingCard index={0} total={6} animationIntensity="normal">
 *   <IconCard icon={Zap} title="Feature" description="Description" />
 * </StackingCard>
 * ```
 */
'use client'

import { cn } from '@workspace/ui/lib/utils'
import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'

import type {
    AnimationIntensity,
    StackingCardConfig,
    StackingVariant,
} from '@/lib/types/sections/stacking.type'
import {
    ANIMATION_PRESETS,
    STACKING_VARIANTS,
} from '@/lib/types/sections/stacking.type'

export type StackingCardProps = {
    /** Child content to be wrapped with stacking effect */
    children: ReactNode
    /** Zero-based index of the card in the stack */
    index: number
    /** Total number of cards in the stack */
    total: number
    /** Additional CSS classes */
    className?: string
    /** Animation intensity preset */
    animationIntensity?: AnimationIntensity
    /** Stacking variant for container heights */
    stackingVariant?: StackingVariant
    /** Custom configuration overrides */
    config?: Partial<StackingCardConfig>
}

/**
 * StackingCard creates an enhanced stacking scroll effect using:
 * - Large container height for the "travel path"
 * - Sticky positioning to pin cards at the top
 * - 3D transforms (scale, rotate, translate) for depth perception
 * - Dynamic shadows and blur for realism
 * - z-index layering for proper stacking order
 * - Performance optimizations (RAF, Intersection Observer)
 * - Accessibility (reduced motion support)
 */
export function StackingCard({
    children,
    index,
    total,
    className,
    animationIntensity = 'normal',
    stackingVariant = 'default',
    config: customConfig,
}: StackingCardProps) {
    const cardRef = useRef<HTMLDivElement>(null)
    const [scrollProgress, setScrollProgress] = useState(0)
    const [isVisible, setIsVisible] = useState(false)
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
    const rafRef = useRef<number | undefined>(undefined)

    // Merge preset configuration with custom overrides
    const config: StackingCardConfig = {
        ...ANIMATION_PRESETS[animationIntensity],
        ...customConfig,
    }

    const {
        scaleAmount = 0.15,
        rotationAmount = 2,
        blurAmount = 4,
        enableBlur = true,
        enable3D = true,
        offsetAmount = 10,
        brightnessReduction = 0.2,
    } = config

    // Check for reduced motion preference
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
        setPrefersReducedMotion(mediaQuery.matches)

        const handleChange = (e: MediaQueryListEvent) => {
            setPrefersReducedMotion(e.matches)
        }

        mediaQuery.addEventListener('change', handleChange)
        return () => mediaQuery.removeEventListener('change', handleChange)
    }, [])

    // Intersection Observer for performance optimization
    useEffect(() => {
        if (!cardRef.current) return

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    setIsVisible(entry.isIntersecting)
                })
            },
            {
                threshold: 0.1,
                rootMargin: '100px 0px',
            }
        )

        observer.observe(cardRef.current)

        return () => observer.disconnect()
    }, [])

    // Scroll handler with RAF throttling
    useEffect(() => {
        if (!isVisible) return

        let ticking = false

        const handleScroll = () => {
            if (!ticking) {
                rafRef.current = window.requestAnimationFrame(() => {
                    if (!cardRef.current) {
                        ticking = false
                        return
                    }

                    const card = cardRef.current
                    const cardRect = card.getBoundingClientRect()
                    const stickyTop = 80 // Header height
                    const cardHeight = cardRect.height

                    // Calculate how much the card has "traveled" past the sticky point
                    // When cardRect.top reaches stickyTop, it starts sticking
                    // Progress is how much of the next card is overlapping this one
                    const distanceFromSticky = stickyTop - cardRect.top
                    const progress = Math.max(
                        0,
                        Math.min(1, distanceFromSticky / (cardHeight * 0.5))
                    )

                    setScrollProgress(progress)
                    ticking = false
                })

                ticking = true
            }
        }

        window.addEventListener('scroll', handleScroll, { passive: true })
        handleScroll() // Initial calculation

        return () => {
            window.removeEventListener('scroll', handleScroll)
            if (rafRef.current) {
                cancelAnimationFrame(rafRef.current)
            }
        }
    }, [isVisible])

    // Calculate sticky top position (all cards stick at same position)
    const topOffset = 80 // 80px base (header height)

    // Calculate z-index (incoming cards stack OVER previous ones)
    const zIndex = index

    // Container height based on variant and position
    const isLastCard = index === total - 1
    const variantConfig = STACKING_VARIANTS[stackingVariant]
    const containerHeight = isLastCard
        ? variantConfig.last
        : variantConfig.default

    // Calculate transform values based on scroll progress and accessibility
    const scale = prefersReducedMotion ? 1 : 1 - scrollProgress * scaleAmount

    const rotateX =
        prefersReducedMotion || !enable3D ? 0 : scrollProgress * rotationAmount

    const translateY =
        prefersReducedMotion || !enable3D ? 0 : scrollProgress * 10

    // Alternating horizontal offset for visual interest
    const offsetX = prefersReducedMotion
        ? 0
        : (index % 2 === 0 ? 1 : -1) * scrollProgress * offsetAmount

    // Subtle rotation for depth
    const rotate = prefersReducedMotion
        ? 0
        : (index % 2 === 0 ? 1 : -1) * scrollProgress * 1

    // Dynamic blur and brightness
    const blur =
        prefersReducedMotion || !enableBlur ? 0 : scrollProgress * blurAmount
    const brightness = prefersReducedMotion
        ? 1
        : 1 - scrollProgress * brightnessReduction

    // Compose transform string
    const transform = `
        translateX(${offsetX}px)
        translateY(${translateY}px)
        scale(${scale})
        ${enable3D ? `perspective(1000px) rotateX(${rotateX}deg)` : ''}
        rotate(${rotate}deg)
    `

    // Compose filter string
    const filter = `blur(${blur}px) brightness(${brightness})`

    return (
        <div
            className={cn(
                'flex items-start',
                containerHeight,
                'md:items-center',
                className
            )}
            style={{ zIndex }}
        >
            <div
                ref={cardRef}
                className={cn(
                    'sticky w-full transition-all duration-300 ease-out will-change-transform',
                    !prefersReducedMotion &&
                        (scrollProgress < 0.33
                            ? 'shadow-md'
                            : scrollProgress < 0.66
                              ? 'shadow-lg'
                              : 'shadow-xl')
                )}
                style={{
                    top: `${topOffset}px`,
                    transform,
                    transformOrigin: 'top center',
                    filter: prefersReducedMotion ? undefined : filter,
                }}
            >
                <div
                    className='transition-opacity duration-300'
                    style={{
                        opacity: prefersReducedMotion
                            ? 1
                            : 0.95 + scrollProgress * 0.05,
                    }}
                >
                    {children}
                </div>
            </div>
        </div>
    )
}
