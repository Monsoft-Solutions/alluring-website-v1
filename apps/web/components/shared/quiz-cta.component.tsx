/**
 * QuizCTA Component
 *
 * Reusable call-to-action that drives users to the procedure quiz.
 * Server component — zero JS overhead.
 *
 * @module components/shared/quiz-cta
 */
import { cn } from '@workspace/ui/lib/utils'
import Link from 'next/link'
import { ContainerLayout } from '@/components/container-layout.component'

type QuizCTAVariant = 'inline' | 'banner'

interface QuizCTAProps {
    /** Display variant */
    readonly variant?: QuizCTAVariant
    /** Override heading text */
    readonly heading?: string
    /** Override description text */
    readonly description?: string
    /** Override button text */
    readonly buttonText?: string
    /** Tracking ref appended as ?ref= query param */
    readonly trackingRef?: string
    /** Additional class names */
    readonly className?: string
}

const defaults = {
    heading: 'Not Sure Which Procedure Is Right for You?',
    description:
        'Take our free 2-minute quiz to get personalized recommendations based on your goals, lifestyle, and budget.',
    buttonText: 'Take the Quiz',
} as const

export function QuizCTA({
    variant = 'inline',
    heading = defaults.heading,
    description = defaults.description,
    buttonText = defaults.buttonText,
    trackingRef,
    className,
}: QuizCTAProps) {
    const href = trackingRef ? `/quiz?ref=${trackingRef}` : '/quiz'

    if (variant === 'banner') {
        return (
            <section
                className={cn('bg-stone-50 py-16 lg:py-20', className)}
                aria-label='Procedure quiz'
            >
                <ContainerLayout>
                    <div className='mx-auto max-w-3xl text-center'>
                        <h2 className='mb-4 font-serif text-3xl font-medium text-stone-900 sm:text-4xl'>
                            {heading}
                        </h2>
                        <p className='mx-auto mb-8 max-w-xl text-lg leading-relaxed text-stone-600'>
                            {description}
                        </p>
                        <Link
                            href={href}
                            className='bg-gold-500 hover:bg-gold-600 hover:shadow-gold-500/20 inline-flex items-center gap-2 rounded-xl px-8 py-4 text-sm font-bold text-white transition-all hover:shadow-lg'
                        >
                            {buttonText}
                            <svg
                                className='h-4 w-4'
                                fill='none'
                                viewBox='0 0 24 24'
                                stroke='currentColor'
                                strokeWidth={2}
                            >
                                <path
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    d='M17 8l4 4m0 0l-4 4m4-4H3'
                                />
                            </svg>
                        </Link>
                    </div>
                </ContainerLayout>
            </section>
        )
    }

    // Inline variant — glassmorphism card
    return (
        <div
            className={cn(
                'rounded-2xl border border-stone-200 bg-white/80 p-8 backdrop-blur-xl sm:p-10',
                className
            )}
            role='complementary'
            aria-label='Procedure quiz'
        >
            <h3 className='mb-3 font-serif text-2xl font-medium text-stone-900'>
                {heading}
            </h3>
            <p className='mb-6 leading-relaxed text-stone-600'>{description}</p>
            <Link
                href={href}
                className='bg-gold-500 hover:bg-gold-600 hover:shadow-gold-500/20 inline-flex items-center gap-2 rounded-xl px-6 py-3.5 text-sm font-bold text-white transition-all hover:shadow-lg'
            >
                {buttonText}
                <svg
                    className='h-4 w-4'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                    strokeWidth={2}
                >
                    <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        d='M17 8l4 4m0 0l-4 4m4-4H3'
                    />
                </svg>
            </Link>
        </div>
    )
}
