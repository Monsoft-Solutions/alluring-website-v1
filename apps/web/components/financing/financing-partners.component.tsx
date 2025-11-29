/**
 * FinancingPartners Component
 *
 * Showcases financing partners (Cherry, CareCredit, United Credit) with
 * beautiful glassmorphic cards featuring official logos, hover animations,
 * benefits reveal, and highlight statistics.
 *
 * SSR-optimized: Content renders visible by default for SEO crawlers.
 * CSS animations enhance UX for users with JavaScript enabled.
 */
import { ArrowRight, CheckCircle, ExternalLink } from 'lucide-react'
import Image from 'next/image'

import { Button } from '@workspace/ui/components/button'
import { cn } from '@workspace/ui/lib/utils'

import { ContentWrapper } from '@/components/shared/content-wrapper.component'
import { SectionContainer } from '@/components/shared/section-container.component'
import { SectionHeader } from '@/components/shared/section-header.component'
import type { FinancingPartnersProps } from '@/lib/types/financing.type'

/**
 * Valid accent color keys
 */
type AccentColorKey = 'rose' | 'blue' | 'emerald'

/**
 * Default accent color
 */
const DEFAULT_ACCENT_COLOR: AccentColorKey = 'blue'

/**
 * Helper function to safely get accent color key
 */
function getAccentColorKey(color: string | undefined): AccentColorKey {
    if (color === 'rose' || color === 'blue' || color === 'emerald') {
        return color
    }
    return DEFAULT_ACCENT_COLOR
}

/**
 * Accent color mappings for partner cards - refined luxury aesthetic
 */
const accentColors: Record<
    AccentColorKey,
    {
        bg: string
        border: string
        borderHover: string
        text: string
        textDark: string
        gradient: string
        logoBg: string
        highlightBg: string
        buttonBg: string
        buttonHover: string
        ring: string
    }
> = {
    rose: {
        bg: 'bg-rose-50',
        border: 'border-rose-200/60',
        borderHover: 'hover:border-rose-400',
        text: 'text-rose-600',
        textDark: 'dark:text-rose-400',
        gradient: 'from-rose-500/10 via-rose-500/5 to-transparent',
        logoBg: 'bg-linear-to-br from-rose-100 to-rose-50',
        highlightBg: 'bg-rose-100/80',
        buttonBg: 'bg-rose-600 hover:bg-rose-700',
        buttonHover: 'hover:bg-rose-50',
        ring: 'ring-rose-200',
    },
    blue: {
        bg: 'bg-blue-50',
        border: 'border-blue-200/60',
        borderHover: 'hover:border-blue-400',
        text: 'text-blue-600',
        textDark: 'dark:text-blue-400',
        gradient: 'from-blue-500/10 via-blue-500/5 to-transparent',
        logoBg: 'bg-linear-to-br from-blue-100 to-blue-50',
        highlightBg: 'bg-blue-100/80',
        buttonBg: 'bg-blue-600 hover:bg-blue-700',
        buttonHover: 'hover:bg-blue-50',
        ring: 'ring-blue-200',
    },
    emerald: {
        bg: 'bg-emerald-50',
        border: 'border-emerald-200/60',
        borderHover: 'hover:border-emerald-400',
        text: 'text-emerald-600',
        textDark: 'dark:text-emerald-400',
        gradient: 'from-emerald-500/10 via-emerald-500/5 to-transparent',
        logoBg: 'bg-linear-to-br from-emerald-100 to-emerald-50',
        highlightBg: 'bg-emerald-100/80',
        buttonBg: 'bg-emerald-600 hover:bg-emerald-700',
        buttonHover: 'hover:bg-emerald-50',
        ring: 'ring-emerald-200',
    },
}

/**
 * Dark mode accent color mappings
 */
const darkAccentColors: Record<
    AccentColorKey,
    {
        logoBg: string
        highlightBg: string
        cardBg: string
    }
> = {
    rose: {
        logoBg: 'dark:bg-linear-to-br dark:from-rose-950/80 dark:to-rose-900/40',
        highlightBg: 'dark:bg-rose-950/50',
        cardBg: 'dark:bg-stone-900/80',
    },
    blue: {
        logoBg: 'dark:bg-linear-to-br dark:from-blue-950/80 dark:to-blue-900/40',
        highlightBg: 'dark:bg-blue-950/50',
        cardBg: 'dark:bg-stone-900/80',
    },
    emerald: {
        logoBg: 'dark:bg-linear-to-br dark:from-emerald-950/80 dark:to-emerald-900/40',
        highlightBg: 'dark:bg-emerald-950/50',
        cardBg: 'dark:bg-stone-900/80',
    },
}

/**
 * Animation delay classes for staggered reveal
 */
const animationDelays = [
    'animate-delay-0',
    'animate-delay-150',
    'animate-delay-300',
] as const

export function FinancingPartners({
    badge,
    title,
    description,
    partners,
    variant = 'default',
    id = 'financing-partners',
    className,
}: FinancingPartnersProps) {
    return (
        <SectionContainer
            id={id}
            variant={variant}
            className={cn('py-20 md:py-28', className)}
            aria-labelledby={`${id}-title`}
        >
            <ContentWrapper size='lg'>
                {/* Section Header */}
                <SectionHeader
                    badge={badge}
                    title={title}
                    description={description}
                    align='center'
                    spacing='loose'
                    className='mb-16'
                    titleClassName='text-balance'
                />

                {/* Partners Grid - Using semantic structure for SEO */}
                <div
                    className='grid gap-8 md:grid-cols-2 lg:grid-cols-3'
                    role='list'
                    aria-label='Financing partners'
                >
                    {partners.map((partner, idx) => {
                        // Safely resolve accent color with fallback to 'blue'
                        const colorKey = getAccentColorKey(partner.accentColor)
                        const colors =
                            accentColors[colorKey] ??
                            accentColors[DEFAULT_ACCENT_COLOR]
                        const darkColors =
                            darkAccentColors[colorKey] ??
                            darkAccentColors[DEFAULT_ACCENT_COLOR]
                        const delayClass =
                            animationDelays[idx % animationDelays.length]

                        return (
                            <article
                                key={partner.id}
                                className={cn(
                                    'group animate-fade-in-up relative',
                                    delayClass
                                )}
                                role='listitem'
                            >
                                <div
                                    className={cn(
                                        'relative h-full overflow-hidden rounded-3xl border bg-white/90 backdrop-blur-sm transition-all duration-500',
                                        'shadow-lg shadow-stone-200/40 hover:shadow-2xl hover:shadow-stone-300/50',
                                        'hover:-translate-y-1',
                                        darkColors.cardBg,
                                        'dark:shadow-stone-950/50 dark:backdrop-blur-md dark:hover:shadow-stone-950/70',
                                        colors.border,
                                        colors.borderHover
                                    )}
                                >
                                    {/* Decorative top accent bar */}
                                    <div
                                        className={cn(
                                            'absolute inset-x-0 top-0 h-1.5 bg-linear-to-r opacity-80',
                                            colors.gradient
                                        )}
                                        aria-hidden='true'
                                    />

                                    {/* Content */}
                                    <div className='relative z-10 p-8'>
                                        {/* Logo Section */}
                                        <div className='mb-8'>
                                            {partner.logoUrl ? (
                                                <div
                                                    className={cn(
                                                        'flex h-24 items-center justify-center rounded-2xl p-5 ring-1 transition-all duration-300',
                                                        'group-hover:scale-[1.02] group-hover:shadow-md',
                                                        colors.logoBg,
                                                        colors.ring,
                                                        darkColors.logoBg,
                                                        'dark:ring-stone-700'
                                                    )}
                                                >
                                                    <Image
                                                        src={partner.logoUrl}
                                                        alt={`${partner.name} financing partner logo`}
                                                        width={200}
                                                        height={70}
                                                        className='h-auto max-h-14 w-auto object-contain'
                                                        loading='eager'
                                                    />
                                                </div>
                                            ) : (
                                                <div
                                                    className={cn(
                                                        'inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold tracking-wider uppercase',
                                                        colors.bg,
                                                        colors.text
                                                    )}
                                                >
                                                    {partner.name}
                                                </div>
                                            )}
                                        </div>

                                        {/* Tagline - Using h3 for proper heading hierarchy */}
                                        <h3 className='mb-4 text-xl font-bold tracking-tight text-stone-900 dark:text-white'>
                                            {partner.tagline}
                                        </h3>

                                        {/* Description */}
                                        <p className='mb-8 text-sm leading-relaxed text-stone-600 dark:text-stone-400'>
                                            {partner.description}
                                        </p>

                                        {/* Highlights - Key stats in elegant grid */}
                                        <div
                                            className='mb-8 grid grid-cols-3 gap-3'
                                            aria-label={`${partner.name} key statistics`}
                                        >
                                            {partner.highlights.map(
                                                (highlight, hIdx) => (
                                                    <div
                                                        key={hIdx}
                                                        className={cn(
                                                            'rounded-xl p-4 text-center transition-all duration-300',
                                                            'ring-1 ring-stone-200/50 ring-inset',
                                                            'group-hover:ring-stone-300/60',
                                                            colors.highlightBg,
                                                            darkColors.highlightBg,
                                                            'dark:ring-stone-700/50'
                                                        )}
                                                    >
                                                        <div
                                                            className={cn(
                                                                'text-xl font-bold tracking-tight',
                                                                colors.text,
                                                                colors.textDark
                                                            )}
                                                        >
                                                            {highlight.value}
                                                        </div>
                                                        <div className='mt-1 text-xs font-medium text-stone-500 dark:text-stone-500'>
                                                            {highlight.label}
                                                        </div>
                                                    </div>
                                                )
                                            )}
                                        </div>

                                        {/* Benefits - Semantic list with elegant styling */}
                                        <ul
                                            className='mb-8 space-y-3'
                                            aria-label={`${partner.name} benefits`}
                                        >
                                            {partner.benefits.map(
                                                (benefit, bIdx) => (
                                                    <li
                                                        key={bIdx}
                                                        className='flex items-start gap-3 text-sm text-stone-700 dark:text-stone-300'
                                                    >
                                                        <CheckCircle
                                                            className={cn(
                                                                'mt-0.5 h-5 w-5 shrink-0',
                                                                colors.text,
                                                                colors.textDark
                                                            )}
                                                            aria-hidden='true'
                                                        />
                                                        <span className='leading-relaxed'>
                                                            {benefit}
                                                        </span>
                                                    </li>
                                                )
                                            )}
                                        </ul>

                                        {/* Apply Button - Refined style */}
                                        {partner.applyUrl && (
                                            <Button
                                                asChild
                                                className={cn(
                                                    'w-full gap-2 font-semibold tracking-wide transition-all duration-300',
                                                    colors.buttonBg,
                                                    'text-white shadow-md hover:shadow-lg'
                                                )}
                                            >
                                                <a
                                                    href={partner.applyUrl}
                                                    target='_blank'
                                                    rel='noopener noreferrer'
                                                    aria-label={`Apply for financing with ${partner.name} (opens in new tab)`}
                                                >
                                                    Apply with {partner.name}
                                                    <ExternalLink
                                                        className='h-4 w-4'
                                                        aria-hidden='true'
                                                    />
                                                </a>
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </article>
                        )
                    })}
                </div>

                {/* Disclaimer - Elegant styling */}
                <p className='mt-14 text-center text-sm text-stone-500 dark:text-stone-500'>
                    *Subject to credit approval. Terms and conditions apply.
                    Visit each partner&apos;s website for complete details.
                </p>
            </ContentWrapper>
        </SectionContainer>
    )
}
