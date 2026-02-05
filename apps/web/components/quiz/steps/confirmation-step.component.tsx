/**
 * Confirmation Step Component
 *
 * Final step showing thank you message and next steps.
 * Replaces the redundant booking step with clear expectations.
 *
 * @module components/quiz/steps/confirmation-step
 */
'use client'

import { cn } from '@workspace/ui/lib/utils'
import { motion } from 'framer-motion'
import {
    ArrowRight,
    CheckCircle2,
    Clock,
    Instagram,
    Mail,
    MapPin,
    Phone,
    Sparkles,
} from 'lucide-react'
import Link from 'next/link'
import { siteConfig, getPhoneLink } from '@/lib/data/site-config'
import type { ProcedureId, ProcedureRecommendation } from '../lib/quiz-types'
import { QUIZ_QUESTIONS } from '../lib/quiz-questions.data'
import { getProcedureDetails } from '../lib/quiz-pricing.data'

export interface ConfirmationStepProps {
    /** Selected procedures */
    readonly selectedProcedures: readonly ProcedureId[]
    /** User's first name */
    readonly firstName?: string
    /** Primary recommendation for "learn more" link */
    readonly primaryRecommendation?: ProcedureRecommendation
    /** Additional class names */
    readonly className?: string
}

/**
 * ConfirmationStep - Thank you confirmation with next steps
 */
export function ConfirmationStep({
    selectedProcedures,
    firstName,
    primaryRecommendation,
    className,
}: ConfirmationStepProps) {
    const content = QUIZ_QUESTIONS.confirmation

    const selectedDetails = selectedProcedures
        .map((id) => getProcedureDetails(id))
        .filter(Boolean)

    // Get primary procedure details for "learn more" link
    const primaryProcedure = primaryRecommendation
        ? getProcedureDetails(primaryRecommendation.procedureId)
        : selectedDetails[0]

    const benefits = [
        'Complimentary, no-obligation consultation',
        'Meet with our double board-certified surgeon',
        'Get personalized pricing and financing options',
        'See before & after photos of similar patients',
        'Tour our state-of-the-art facility',
    ]

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={cn('space-y-8', className)}
        >
            {/* Success Header */}
            <div className='text-center'>
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className='mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg shadow-green-500/30'
                >
                    <CheckCircle2 className='h-8 w-8 text-white' />
                </motion.div>
                <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className='font-serif text-2xl text-stone-900 md:text-3xl'
                >
                    {firstName ? `Thank You, ${firstName}!` : content.title}
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className='mt-2 text-stone-600'
                >
                    {content.subtitle}
                </motion.p>
            </div>

            {/* What Happens Next */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className='border-gold-200 from-gold-50 mx-auto max-w-lg rounded-2xl border bg-gradient-to-br to-amber-50 p-6'
            >
                <div className='mb-4 flex items-center gap-2'>
                    <Clock className='text-gold-600 h-5 w-5' />
                    <p className='font-semibold text-stone-800'>
                        What Happens Next
                    </p>
                </div>
                <ol className='space-y-3'>
                    {content.nextSteps.map((step, index) => (
                        <motion.li
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 + index * 0.1 }}
                            className='flex items-start gap-3'
                        >
                            <span className='bg-gold-500 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white'>
                                {index + 1}
                            </span>
                            <span className='text-sm text-stone-700'>
                                {step}
                            </span>
                        </motion.li>
                    ))}
                </ol>
            </motion.div>

            {/* Package Summary */}
            {selectedProcedures.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className='mx-auto max-w-lg rounded-2xl bg-gradient-to-br from-stone-900 to-stone-800 p-6 text-white shadow-xl'
                >
                    <p className='text-gold-400 text-xs font-semibold tracking-wider uppercase'>
                        Your Personalized Package
                    </p>

                    {/* Selected procedures */}
                    <ul className='mt-4 space-y-2'>
                        {selectedDetails.map((procedure) => (
                            <li
                                key={procedure!.id}
                                className='flex items-center gap-2 text-sm'
                            >
                                <CheckCircle2 className='text-gold-400 h-4 w-4' />
                                {procedure!.title}
                            </li>
                        ))}
                    </ul>

                    {/* Payment options */}
                    <div className='mt-4 border-t border-stone-700 pt-4'>
                        <div className='flex justify-between text-sm'>
                            <span className='text-stone-400'>
                                Payment Options
                            </span>
                            <span className='text-gold-400 font-semibold'>
                                Financing & upfront payment available
                            </span>
                        </div>
                        <p className='mt-2 text-xs text-stone-400'>
                            Discuss pricing details during your free
                            consultation
                        </p>
                    </div>
                </motion.div>
            )}

            {/* What to Expect */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className='mx-auto max-w-lg'
            >
                <p className='mb-4 text-center text-sm font-medium text-stone-600'>
                    What to expect at your consultation:
                </p>
                <ul className='space-y-3'>
                    {benefits.map((benefit, index) => (
                        <motion.li
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.9 + index * 0.05 }}
                            className='flex items-start gap-3 text-sm text-stone-700'
                        >
                            <CheckCircle2 className='text-gold-500 mt-0.5 h-4 w-4 shrink-0' />
                            {benefit}
                        </motion.li>
                    ))}
                </ul>
            </motion.div>

            {/* Learn More About Your Procedure */}
            {primaryProcedure && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.1 }}
                    className='mx-auto max-w-lg'
                >
                    <Link
                        href={`/procedures/${primaryProcedure.slug}`}
                        className={cn(
                            'flex items-center justify-between rounded-xl px-6 py-4',
                            'border border-stone-200 bg-white',
                            'hover:border-gold-300 hover:bg-gold-50 transition-all duration-300'
                        )}
                    >
                        <div className='flex items-center gap-3'>
                            <Sparkles className='text-gold-500 h-5 w-5' />
                            <div>
                                <p className='text-sm font-medium text-stone-800'>
                                    While you wait, learn more about
                                </p>
                                <p className='text-gold-600 text-sm'>
                                    {primaryProcedure.title}
                                </p>
                            </div>
                        </div>
                        <ArrowRight className='h-5 w-5 text-stone-400' />
                    </Link>
                </motion.div>
            )}

            {/* Optional Self-Booking (Secondary) */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className='mx-auto max-w-lg text-center'
            >
                <p className='mb-3 text-sm text-stone-500'>
                    Prefer to schedule yourself?
                </p>
                <div className='flex flex-col gap-3 sm:flex-row sm:justify-center'>
                    <Link
                        href='/free-consultation'
                        className={cn(
                            'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2',
                            'border border-stone-200 bg-white text-sm font-medium text-stone-600',
                            'transition-all duration-200 hover:border-stone-300 hover:bg-stone-50'
                        )}
                    >
                        <Mail className='h-4 w-4' />
                        Book Online
                    </Link>
                    <a
                        href={getPhoneLink()}
                        className={cn(
                            'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2',
                            'border border-stone-200 bg-white text-sm font-medium text-stone-600',
                            'transition-all duration-200 hover:border-stone-300 hover:bg-stone-50'
                        )}
                    >
                        <Phone className='h-4 w-4' />
                        {siteConfig.contact.phone}
                    </a>
                </div>
            </motion.div>

            {/* Trust Badges */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.3 }}
                className='flex flex-wrap items-center justify-center gap-6 pt-4'
            >
                <div className='text-center'>
                    <p className='text-2xl font-bold text-stone-800'>
                        {siteConfig.trustStats?.patients ?? '5,000+'}
                    </p>
                    <p className='text-xs text-stone-500'>Happy Patients</p>
                </div>
                <div className='h-8 w-px bg-stone-200' />
                <div className='text-center'>
                    <p className='text-2xl font-bold text-stone-800'>
                        {siteConfig.trustStats?.years ?? '15+'}
                    </p>
                    <p className='text-xs text-stone-500'>Years Experience</p>
                </div>
                <div className='h-8 w-px bg-stone-200' />
                <div className='text-center'>
                    <p className='text-2xl font-bold text-stone-800'>
                        {siteConfig.trustStats?.rating ?? '4.9'}
                    </p>
                    <p className='text-xs text-stone-500'>Star Rating</p>
                </div>
            </motion.div>

            {/* Follow Us */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.4 }}
                className='flex flex-col items-center gap-3 pt-2'
            >
                <p className='text-sm text-stone-500'>
                    Follow us for real patient stories
                </p>
                <div className='flex gap-3'>
                    {siteConfig.social.find(
                        (s) => s.platform === 'instagram'
                    ) && (
                        <a
                            href={
                                siteConfig.social.find(
                                    (s) => s.platform === 'instagram'
                                )?.url
                            }
                            target='_blank'
                            rel='noopener noreferrer'
                            className={cn(
                                'flex h-10 w-10 items-center justify-center rounded-full',
                                'bg-gradient-to-br from-pink-500 to-orange-400 text-white',
                                'transition-transform duration-200 hover:scale-110'
                            )}
                            aria-label='Follow us on Instagram'
                        >
                            <Instagram className='h-5 w-5' />
                        </a>
                    )}
                </div>
            </motion.div>

            {/* Location */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                className='flex flex-col items-center gap-2 text-center text-sm text-stone-500'
            >
                <div className='flex items-center gap-2'>
                    <MapPin className='h-4 w-4' />
                    <span>{siteConfig.contact.address}</span>
                </div>
            </motion.div>
        </motion.div>
    )
}
