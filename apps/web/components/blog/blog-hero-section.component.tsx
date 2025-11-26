/**
 * BlogHeroSection Component
 *
 * Luxury hero section for the blog landing page.
 * Features dark stone-900 background with gold accents,
 * serif typography, and category navigation pills.
 *
 * SSR-compatible: Uses CSS animations instead of Framer Motion.
 */
import { BookOpen } from 'lucide-react'
import Image from 'next/image'

import { cn } from '@workspace/ui/lib/utils'

import { ContentWrapper } from '@/components/shared/content-wrapper.component'

type BlogHeroSectionProps = {
    badge: string
    headline: string
    subheadline?: string
    description: string
    backgroundImage?: string
    className?: string
}

export function BlogHeroSection({
    badge,
    headline,
    subheadline,
    description,
    backgroundImage,
    className,
}: BlogHeroSectionProps) {
    return (
        <section
            className={cn(
                'relative min-h-[70vh] overflow-hidden bg-stone-900 lg:min-h-[80vh]',
                className
            )}
        >
            {/* Background Image with Overlay */}
            {backgroundImage && (
                <div className='absolute inset-0 z-0'>
                    <Image
                        src={backgroundImage}
                        alt='Blog hero background'
                        fill
                        priority
                        className='object-cover'
                        sizes='100vw'
                    />
                    {/* Gradient overlays for depth */}
                    <div className='absolute inset-0 bg-linear-to-r from-stone-900/95 via-stone-900/80 to-stone-900/60' />
                    <div className='absolute inset-0 bg-linear-to-t from-stone-900/90 via-transparent to-stone-900/40' />
                </div>
            )}

            {/* Decorative gold blur elements */}
            <div className='bg-gold-500/10 pointer-events-none absolute top-1/4 left-0 h-[400px] w-[400px] -translate-x-1/2 rounded-full blur-[120px]' />
            <div className='bg-gold-400/5 pointer-events-none absolute right-0 bottom-1/4 h-[300px] w-[300px] translate-x-1/3 rounded-full blur-[100px]' />

            {/* Content */}
            <div className='relative z-10 flex min-h-[70vh] items-center lg:min-h-[80vh]'>
                <ContentWrapper
                    size='lg'
                    paddingX='px-6 md:px-12'
                    className='py-20 pt-32 lg:pt-40'
                >
                    <div className='animate-fade-in-up max-w-3xl'>
                        {/* Badge */}
                        <div className='animate-fade-in-up mb-6'>
                            <span className='border-gold-500/40 bg-gold-500/10 text-gold-400 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium tracking-wide'>
                                <BookOpen className='h-4 w-4' />
                                {badge}
                            </span>
                        </div>

                        {/* Headline */}
                        <h1 className='animate-fade-in-up mb-4 font-serif text-4xl leading-[1.1] text-white [animation-delay:100ms] md:text-5xl lg:text-6xl xl:text-7xl'>
                            {headline}
                        </h1>

                        {/* Subheadline */}
                        {subheadline && (
                            <p className='text-gold-400 animate-fade-in-up mb-6 font-serif text-xl font-light italic [animation-delay:200ms] md:text-2xl'>
                                {subheadline}
                            </p>
                        )}

                        {/* Gold accent line */}
                        <div className='bg-gold-500 animate-fade-in-up mb-8 h-1 w-24 shadow-[0_0_20px_rgba(234,179,8,0.4)] [animation-delay:300ms]' />

                        {/* Description */}
                        <p className='animate-fade-in-up max-w-2xl text-base leading-relaxed font-light text-stone-300 [animation-delay:400ms] md:text-lg'>
                            {description}
                        </p>
                    </div>
                </ContentWrapper>
            </div>

            {/* Bottom gradient fade */}
            <div className='absolute right-0 bottom-0 left-0 h-32 bg-linear-to-t from-stone-50 to-transparent' />
        </section>
    )
}
