/**
 * BMI Hero Component
 *
 * Educational hero section for the BMI calculator page.
 * Server-rendered for SEO optimization.
 *
 * Features:
 * - SSR for SEO crawlability
 * - Trust indicators with icons
 * - CSS animations instead of JS for better performance
 * - Luxury aesthetic with gold accents
 */
import { Award, Heart, Shield } from 'lucide-react'

import { Button } from '@workspace/ui/components/button'
import { cn } from '@workspace/ui/lib/utils'

import { ContentWrapper } from '@/components/shared/content-wrapper.component'
import { SectionContainer } from '@/components/shared/section-container.component'
import type { BmiHeroData } from '@/lib/data/webpages/bmi-calculator.data'

/**
 * Map icon names to Lucide components
 */
const iconMap: Record<string, React.ElementType> = {
    Shield,
    Award,
    Heart,
}

type BmiHeroProps = BmiHeroData & {
    readonly id?: string
    readonly className?: string
}

export function BmiHero({
    badge,
    headline,
    subheadline,
    description,
    trustIndicators,
    primaryCta,
    secondaryCta,
    id = 'bmi-hero',
    className,
}: BmiHeroProps) {
    return (
        <SectionContainer
            id={id}
            variant='default'
            noPadding
            className={cn(
                'relative overflow-hidden bg-stone-900 py-16 pt-24 md:py-24 md:pt-32',
                className
            )}
        >
            {/* Decorative background elements */}
            <div className='bg-gold-500/10 pointer-events-none absolute top-1/4 left-0 h-[400px] w-[400px] -translate-x-1/2 rounded-full blur-[120px]' />
            <div className='bg-gold-400/5 pointer-events-none absolute right-0 bottom-0 h-[300px] w-[300px] translate-x-1/3 rounded-full blur-[100px]' />

            <ContentWrapper size='lg' className='relative z-10'>
                <div className='mx-auto max-w-3xl text-center'>
                    {/* Badge */}
                    {badge && (
                        <div className='animate-fade-in-up mb-6'>
                            <span className='border-gold-500/40 bg-gold-500/10 text-gold-400 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium tracking-wide'>
                                {badge}
                            </span>
                        </div>
                    )}

                    {/* Headline */}
                    <h1 className='animate-fade-in-up mb-4 font-serif text-4xl leading-[1.1] text-white [animation-delay:100ms] md:text-5xl lg:text-6xl'>
                        {headline}
                    </h1>

                    {/* Subheadline */}
                    {subheadline && (
                        <p className='text-gold-400 animate-fade-in-up mb-6 font-serif text-xl font-light italic [animation-delay:200ms] md:text-2xl'>
                            {subheadline}
                        </p>
                    )}

                    {/* Gold accent line */}
                    <div className='bg-gold-500 animate-scale-x mx-auto mb-8 h-1 w-24 shadow-[0_0_20px_rgba(234,179,8,0.4)] [animation-delay:300ms]' />

                    {/* Description */}
                    <p className='animate-fade-in-up mx-auto mb-8 max-w-2xl text-base leading-relaxed font-light text-stone-300 [animation-delay:400ms] md:text-lg'>
                        {description}
                    </p>

                    {/* Trust Indicators */}
                    <div className='animate-fade-in-up mb-8 flex flex-wrap justify-center gap-4 [animation-delay:500ms] md:gap-6'>
                        {trustIndicators.map((indicator, idx) => {
                            const IconComponent = iconMap[indicator.icon]
                            return (
                                <div
                                    key={idx}
                                    className='flex items-center gap-2.5'
                                >
                                    <div className='bg-gold-500/20 text-gold-400 flex h-10 w-10 items-center justify-center rounded-full'>
                                        {IconComponent && (
                                            <IconComponent className='h-4 w-4' />
                                        )}
                                    </div>
                                    <div className='text-left'>
                                        <div className='text-base font-bold text-white'>
                                            {indicator.text}
                                        </div>
                                        <div className='text-xs text-stone-400'>
                                            {indicator.label}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {/* CTAs */}
                    <div className='animate-fade-in-up flex flex-col justify-center gap-4 [animation-delay:600ms] sm:flex-row'>
                        <Button
                            asChild
                            size='lg'
                            className='bg-gold-500 hover:bg-gold-600 min-w-[180px] border-none px-6 py-5 text-sm font-bold tracking-wide text-white uppercase shadow-lg shadow-amber-500/20 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/30'
                        >
                            <a href={primaryCta.href}>{primaryCta.text}</a>
                        </Button>

                        {secondaryCta && (
                            <Button
                                asChild
                                size='lg'
                                variant='outline'
                                className='hover:border-gold-500/50 min-w-[140px] border-white/20 bg-white/5 px-6 py-5 text-sm font-bold tracking-wide text-white uppercase backdrop-blur-sm transition-all duration-300 hover:bg-white/10 hover:text-white'
                            >
                                <a href={secondaryCta.href}>
                                    {secondaryCta.text}
                                </a>
                            </Button>
                        )}
                    </div>
                </div>
            </ContentWrapper>
        </SectionContainer>
    )
}
