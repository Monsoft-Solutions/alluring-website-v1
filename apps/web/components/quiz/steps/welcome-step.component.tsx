/**
 * Welcome Step Component
 *
 * Introduction screen for the quiz with elegant animation.
 *
 * @module components/quiz/steps/welcome-step
 */
'use client'

import { cn } from '@workspace/ui/lib/utils'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, Shield, Clock } from 'lucide-react'
import { siteConfig } from '@/lib/data/site-config'
import { QUIZ_QUESTIONS } from '../lib/quiz-questions.data'

export interface WelcomeStepProps {
    /** Handler for starting the quiz */
    readonly onStart: () => void
    /** Additional class names */
    readonly className?: string
}

/**
 * WelcomeStep - Quiz introduction screen
 */
export function WelcomeStep({ onStart, className }: WelcomeStepProps) {
    const content = QUIZ_QUESTIONS.welcome

    const features = [
        {
            icon: Clock,
            text: 'Takes only 2 minutes',
        },
        {
            icon: Shield,
            text: '100% confidential',
        },
        {
            icon: Sparkles,
            text: 'Personalized recommendations',
        },
    ]

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={cn('text-center', className)}
        >
            {/* Decorative element */}
            <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className='mb-8 flex justify-center'
            >
                <div className='relative'>
                    <div className='from-gold-400 to-gold-500 shadow-gold-500/30 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br shadow-lg'>
                        <Sparkles className='h-10 w-10 text-white' />
                    </div>
                    {/* Animated rings */}
                    <div className='bg-gold-400/20 absolute inset-0 animate-ping rounded-full' />
                </div>
            </motion.div>

            {/* Title */}
            <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className='font-serif text-3xl text-stone-900 md:text-4xl lg:text-5xl'
            >
                {content.title}
            </motion.h1>

            {/* Subtitle */}
            <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className='mt-4 text-lg text-stone-600 md:text-xl'
            >
                {content.subtitle}
            </motion.p>

            {/* Features */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className='mt-8 flex flex-wrap justify-center gap-6'
            >
                {features.map((feature, index) => (
                    <div
                        key={index}
                        className='flex items-center gap-2 text-sm text-stone-500'
                    >
                        <feature.icon className='text-gold-500 h-4 w-4' />
                        <span>{feature.text}</span>
                    </div>
                ))}
            </motion.div>

            {/* CTA Button */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className='mt-10'
            >
                <motion.button
                    type='button'
                    onClick={onStart}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                        'group inline-flex items-center gap-3 rounded-full px-8 py-4',
                        'from-gold-500 to-gold-400 bg-gradient-to-r text-stone-900',
                        'shadow-gold-500/30 font-semibold shadow-lg',
                        'hover:shadow-gold-500/40 transition-all duration-300 hover:shadow-xl'
                    )}
                >
                    {content.ctaText}
                    <ArrowRight className='h-5 w-5 transition-transform group-hover:translate-x-1' />
                </motion.button>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className='mt-12 flex flex-col items-center gap-4'
            >
                <p className='text-sm text-stone-500'>
                    Trusted by {siteConfig.trustStats?.patients ?? '5,000+'}{' '}
                    patients in Miami
                </p>
                <div className='flex items-center gap-1'>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                            key={star}
                            className='text-gold-500 h-5 w-5'
                            fill='currentColor'
                            viewBox='0 0 20 20'
                        >
                            <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
                        </svg>
                    ))}
                    <span className='ml-2 text-sm font-medium text-stone-700'>
                        {siteConfig.trustStats?.rating ?? '4.7'}/5 rating
                    </span>
                </div>
            </motion.div>
        </motion.div>
    )
}
