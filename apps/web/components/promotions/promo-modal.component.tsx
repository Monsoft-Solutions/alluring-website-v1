'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { zodResolver } from '@hookform/resolvers/zod'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, Loader2, Sparkles, X, Clock, Gift } from 'lucide-react'
import { useForm } from 'react-hook-form'

import { Button } from '@workspace/ui/components/button'
import { Form } from '@workspace/ui/components/form'

import { FormFeedback } from '@/components/shared/forms/form-feedback.component'
import {
    NameField,
    PhoneField,
} from '@/components/shared/forms/form-fields.component'
import { useContactFormSubmission } from '@/hooks/useContactFormSubmission.hook'
import {
    CONTACT_SOURCES,
    type LeadCaptureInput,
    leadCaptureSchema,
} from '@/lib/types/forms/contact-form.type'

type PromoModalData = {
    id: string
    title: string
    excerpt: string | null
    discount: string | null
    imageUrl: string | null
    imageAlt: string | null
    ctaText: string
    daysRemaining: number | null
    modalDelaySeconds: number
}

type PromoModalProps = {
    promotion: PromoModalData
}

const STORAGE_KEY_PREFIX = 'promo_modal_seen_'

/**
 * PromoModal Component
 *
 * A timed hybrid modal that displays promotion details with an embedded lead capture form.
 * Triggers after a configurable delay (modalDelaySeconds) and tracks dismissal per promotion.
 *
 * Features:
 * - Configurable delay per promotion
 * - SessionStorage tracking (per promotion ID)
 * - Two-column layout: promotion visual + lead form
 * - Framer Motion animations
 * - Connects to existing contact form API
 */
export function PromoModal({ promotion }: PromoModalProps) {
    const [isVisible, setIsVisible] = useState(false)
    const [hasTriggered, setHasTriggered] = useState(false)

    const form = useForm<LeadCaptureInput>({
        resolver: zodResolver(leadCaptureSchema),
        defaultValues: {
            name: '',
            phone: '',
        },
    })

    const storageKey = `${STORAGE_KEY_PREFIX}${promotion.id}`

    const handleClose = () => {
        setIsVisible(false)
        if (typeof window !== 'undefined') {
            sessionStorage.setItem(storageKey, 'true')
        }
    }

    const { submit, state, isSubmitting, isSuccess, isError } =
        useContactFormSubmission({
            source: CONTACT_SOURCES.PROMO_MODAL,
            redirectOnSuccess: '/thank-you',
            onSuccess: () => {
                form.reset()
                handleClose()
            },
        })

    useEffect(() => {
        // Check if already seen in this session
        if (typeof window !== 'undefined') {
            const hasSeen = sessionStorage.getItem(storageKey)
            if (hasSeen) {
                setHasTriggered(true)
                return
            }
        }

        // Set timer based on promotion's modalDelaySeconds
        const delayMs = (promotion.modalDelaySeconds ?? 60) * 1000

        const timer = setTimeout(() => {
            if (!hasTriggered) {
                setIsVisible(true)
                setHasTriggered(true)
            }
        }, delayMs)

        return () => clearTimeout(timer)
    }, [hasTriggered, promotion.modalDelaySeconds, storageKey])

    const onSubmit = async (data: LeadCaptureInput) => {
        await submit(data)
    }

    return (
        <AnimatePresence>
            {isVisible && (
                <div className='pointer-events-none fixed inset-0 z-[100] flex items-center justify-center p-4'>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className='pointer-events-auto absolute inset-0 bg-black/70 backdrop-blur-sm'
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{
                            type: 'spring',
                            damping: 25,
                            stiffness: 300,
                        }}
                        className='pointer-events-auto relative w-full max-w-4xl overflow-hidden rounded-2xl bg-stone-900 shadow-2xl'
                    >
                        {/* Gold accent line */}
                        <div className='from-gold-600 via-gold-400 to-gold-600 absolute top-0 right-0 left-0 h-1 bg-gradient-to-r' />

                        {/* Close button */}
                        <button
                            onClick={handleClose}
                            className='absolute top-4 right-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-stone-800/80 text-stone-400 backdrop-blur-sm transition-colors hover:bg-stone-700 hover:text-white'
                            aria-label='Close promotion'
                        >
                            <X className='h-5 w-5' />
                        </button>

                        <div className='grid md:grid-cols-2'>
                            {/* Left: Image & Promo Info */}
                            <div className='relative hidden bg-stone-800 md:block'>
                                {promotion.imageUrl ? (
                                    <>
                                        <Image
                                            src={promotion.imageUrl}
                                            alt={
                                                promotion.imageAlt ||
                                                promotion.title
                                            }
                                            fill
                                            className='object-cover'
                                            sizes='50vw'
                                        />
                                        {/* Gradient overlay */}
                                        <div className='absolute inset-0 bg-gradient-to-r from-transparent via-stone-900/30 to-stone-900/80' />
                                    </>
                                ) : (
                                    <div className='flex h-full min-h-[400px] items-center justify-center'>
                                        <Gift className='text-gold-500/30 h-32 w-32' />
                                    </div>
                                )}

                                {/* Floating discount badge */}
                                {promotion.discount && (
                                    <div className='absolute right-6 bottom-6 left-6'>
                                        <div className='border-gold-500/30 inline-block rounded-xl border bg-stone-900/90 px-6 py-4 backdrop-blur-sm'>
                                            <span className='from-gold-400 to-gold-600 block bg-gradient-to-r bg-clip-text font-serif text-3xl font-bold text-transparent'>
                                                {promotion.discount}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Right: Form */}
                            <div className='p-8 md:p-10'>
                                {/* Mobile-only discount badge */}
                                {promotion.discount && (
                                    <div className='mb-4 md:hidden'>
                                        <span className='from-gold-400 to-gold-600 bg-gradient-to-r bg-clip-text font-serif text-2xl font-bold text-transparent'>
                                            {promotion.discount}
                                        </span>
                                    </div>
                                )}

                                {/* Badge */}
                                <div className='mb-4 inline-flex items-center gap-2'>
                                    <div className='bg-gold-500/10 rounded-full p-1.5'>
                                        <Sparkles className='text-gold-400 h-3 w-3' />
                                    </div>
                                    <span className='text-gold-400 text-xs font-bold tracking-widest uppercase'>
                                        Exclusive Offer
                                    </span>
                                </div>

                                {/* Title */}
                                <h3 className='mb-3 font-serif text-2xl leading-tight text-white md:text-3xl'>
                                    {promotion.title}
                                </h3>

                                {/* Description */}
                                {promotion.excerpt && (
                                    <p className='mb-6 text-sm leading-relaxed text-stone-400'>
                                        {promotion.excerpt}
                                    </p>
                                )}

                                {/* Countdown */}
                                {promotion.daysRemaining !== null &&
                                    promotion.daysRemaining > 0 && (
                                        <div className='mb-6 inline-flex items-center gap-2 rounded-lg border border-stone-700/50 bg-stone-800/50 px-4 py-2'>
                                            <Clock className='text-gold-400 h-4 w-4' />
                                            <span className='text-sm text-stone-300'>
                                                <span className='text-gold-400 font-bold'>
                                                    {promotion.daysRemaining}{' '}
                                                    days
                                                </span>{' '}
                                                left to claim
                                            </span>
                                        </div>
                                    )}

                                {/* Form */}
                                {isSuccess ? (
                                    <div className='flex flex-col items-center gap-4 rounded-xl border border-green-500/30 bg-green-500/10 p-6 text-center'>
                                        <CheckCircle2 className='h-12 w-12 text-green-400' />
                                        <div>
                                            <p className='mb-1 font-semibold text-green-400'>
                                                You&apos;re All Set!
                                            </p>
                                            <p className='text-sm text-stone-400'>
                                                {state.message}
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <Form {...form}>
                                        <form
                                            onSubmit={form.handleSubmit(
                                                onSubmit
                                            )}
                                            className='space-y-4'
                                        >
                                            <p className='mb-2 text-sm text-stone-400'>
                                                Claim your exclusive offer.
                                                We&apos;ll contact you to
                                                schedule your consultation.
                                            </p>

                                            <NameField
                                                control={form.control}
                                                name='name'
                                                label=''
                                                placeholder='Your Name'
                                                disabled={isSubmitting}
                                                variant='dark'
                                                required={false}
                                            />
                                            <PhoneField
                                                control={form.control}
                                                name='phone'
                                                label=''
                                                placeholder='Phone Number'
                                                disabled={isSubmitting}
                                                variant='dark'
                                                required
                                            />

                                            {isError && (
                                                <FormFeedback
                                                    status='error'
                                                    message={state.message}
                                                    variant='dark'
                                                />
                                            )}

                                            <Button
                                                type='submit'
                                                variant='gold'
                                                size='lg'
                                                disabled={isSubmitting}
                                                className='w-full justify-center'
                                            >
                                                {isSubmitting ? (
                                                    <>
                                                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                                        Claiming...
                                                    </>
                                                ) : (
                                                    promotion.ctaText ||
                                                    'Claim This Offer'
                                                )}
                                            </Button>
                                        </form>
                                    </Form>
                                )}

                                <p className='mt-4 text-center text-xs text-stone-600'>
                                    We respect your privacy. No spam, ever.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
