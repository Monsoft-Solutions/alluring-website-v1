/**
 * ExitIntentPopup Component
 *
 * Lead capture popup that triggers on exit intent (desktop) or scroll depth (mobile).
 * Submits to the unified /api/contact endpoint with EXIT_INTENT source.
 *
 * Features:
 * - Desktop: Triggers when mouse leaves top of viewport
 * - Mobile/Tablet: Triggers at 70% scroll depth
 * - Robust phone validation using shared schema
 * - Session-based dismissal tracking
 */
'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@workspace/ui/components/button'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, CheckCircle2, Loader2, Sparkles, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

import {
    CONTACT_SOURCES,
    type ContactFormResponse,
    type LeadCaptureInput,
    leadCaptureSchema,
} from '@/lib/types/forms/contact-form.type'

type SubmissionState = {
    status: 'idle' | 'success' | 'error'
    message: string
}

export const ExitIntentPopup = () => {
    const [isVisible, setIsVisible] = useState(false)
    const [hasTriggered, setHasTriggered] = useState(false)
    const [submissionState, setSubmissionState] = useState<SubmissionState>({
        status: 'idle',
        message: '',
    })

    const form = useForm<LeadCaptureInput>({
        resolver: zodResolver(leadCaptureSchema),
        defaultValues: {
            name: '',
            phone: '',
        },
    })

    useEffect(() => {
        // Check if previously dismissed in this session
        if (typeof window !== 'undefined') {
            const hasSeen = sessionStorage.getItem('alluring_popup_seen')
            if (hasSeen) {
                setHasTriggered(true)
                return
            }
        }

        const handleExitIntent = (e: MouseEvent) => {
            // Desktop: Trigger when mouse leaves top of viewport
            if (e.clientY <= 0 && window.innerWidth >= 1024 && !hasTriggered) {
                setIsVisible(true)
                setHasTriggered(true)
            }
        }

        const handleScroll = () => {
            // Mobile/Tablet: Trigger at 70% scroll depth
            if (window.innerWidth < 1024 && !hasTriggered) {
                const scrollTop = window.scrollY
                const docHeight = document.documentElement.scrollHeight
                const winHeight = window.innerHeight
                const scrollPercent = (scrollTop + winHeight) / docHeight

                if (scrollPercent > 0.7) {
                    setIsVisible(true)
                    setHasTriggered(true)
                }
            }
        }

        document.addEventListener('mouseleave', handleExitIntent)
        window.addEventListener('scroll', handleScroll)

        return () => {
            document.removeEventListener('mouseleave', handleExitIntent)
            window.removeEventListener('scroll', handleScroll)
        }
    }, [hasTriggered])

    const handleClose = () => {
        setIsVisible(false)
        if (typeof window !== 'undefined') {
            sessionStorage.setItem('alluring_popup_seen', 'true')
        }
    }

    const onSubmit = async (data: LeadCaptureInput) => {
        try {
            setSubmissionState({ status: 'idle', message: '' })

            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...data,
                    source: CONTACT_SOURCES.EXIT_INTENT,
                }),
            })

            const result: ContactFormResponse = await response.json()

            if (response.ok && result.success) {
                setSubmissionState({
                    status: 'success',
                    message:
                        result.message ||
                        "Thank you! We'll call you within 24 hours.",
                })
                form.reset()
                // Auto-close after success
                setTimeout(() => {
                    handleClose()
                }, 3000)
            } else {
                setSubmissionState({
                    status: 'error',
                    message:
                        result.error ||
                        'Something went wrong. Please try again.',
                })
            }
        } catch (error) {
            console.error('Exit intent form submission error:', error)
            setSubmissionState({
                status: 'error',
                message: 'Network error. Please check your connection.',
            })
        }
    }

    const isSubmitting = form.formState.isSubmitting

    return (
        <AnimatePresence>
            {isVisible && (
                <div className='pointer-events-none fixed inset-0 z-100 flex items-end justify-center p-0 md:items-end md:justify-end md:p-6'>
                    {/* Mobile Backdrop - only visible on small screens to focus attention */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className='pointer-events-auto absolute inset-0 bg-black/40 backdrop-blur-sm md:hidden'
                    />

                    <motion.div
                        initial={{ y: '100%', opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: '100%', opacity: 0 }}
                        transition={{
                            type: 'spring',
                            damping: 30,
                            stiffness: 300,
                        }}
                        className='border-gold-500/30 pointer-events-auto relative w-full overflow-hidden rounded-t-2xl border-t bg-stone-900 shadow-2xl md:w-[400px] md:rounded-xl md:border'
                    >
                        {/* Gold Top Line decoration */}
                        <div className='from-gold-600 via-gold-300 to-gold-600 absolute top-0 right-0 left-0 h-1 bg-linear-to-r'></div>

                        <div className='p-6 md:p-8'>
                            <button
                                onClick={handleClose}
                                className='absolute top-4 right-4 rounded-full bg-stone-800/50 p-1 text-stone-500 transition-colors hover:text-white'
                                aria-label='Close popup'
                            >
                                <X size={16} />
                            </button>

                            <div className='mb-3 flex items-center gap-2'>
                                <div className='bg-gold-500/10 rounded-full p-1.5'>
                                    <Sparkles className='text-gold-400 h-3 w-3' />
                                </div>
                                <span className='text-gold-400 text-xs font-bold tracking-widest uppercase'>
                                    Don&apos;t Miss Out
                                </span>
                            </div>

                            <h3 className='mb-2 font-serif text-xl leading-tight text-white md:text-2xl'>
                                Plan Your Transformation
                            </h3>
                            <p className='mb-6 text-sm leading-relaxed text-stone-400 md:text-base'>
                                Slots are filling up fast. Get a priority
                                consultation and a personalized quote sent to
                                your phone.
                            </p>

                            {submissionState.status === 'success' ? (
                                <div className='flex items-center gap-3 rounded-lg border border-green-500/30 bg-green-500/10 p-4 text-green-400'>
                                    <CheckCircle2 className='h-5 w-5 shrink-0' />
                                    <p className='text-sm'>
                                        {submissionState.message}
                                    </p>
                                </div>
                            ) : (
                                <form
                                    onSubmit={form.handleSubmit(onSubmit)}
                                    className='space-y-3'
                                >
                                    <div className='space-y-1'>
                                        <input
                                            type='text'
                                            placeholder='Your Name'
                                            {...form.register('name')}
                                            disabled={isSubmitting}
                                            className='focus:border-gold-400 w-full rounded-sm border border-stone-700 bg-stone-800/50 px-4 py-3 text-base text-white placeholder-stone-500 transition-colors focus:outline-none'
                                        />
                                        {form.formState.errors.name && (
                                            <p className='text-xs text-red-400'>
                                                {
                                                    form.formState.errors.name
                                                        .message
                                                }
                                            </p>
                                        )}
                                    </div>
                                    <div className='space-y-1'>
                                        <input
                                            type='tel'
                                            placeholder='Phone Number'
                                            {...form.register('phone')}
                                            disabled={isSubmitting}
                                            className='focus:border-gold-400 w-full rounded-sm border border-stone-700 bg-stone-800/50 px-4 py-3 text-base text-white placeholder-stone-500 transition-colors focus:outline-none'
                                        />
                                        {form.formState.errors.phone && (
                                            <p className='text-xs text-red-400'>
                                                {
                                                    form.formState.errors.phone
                                                        .message
                                                }
                                            </p>
                                        )}
                                    </div>

                                    {submissionState.status === 'error' && (
                                        <div className='flex items-center gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-red-400'>
                                            <AlertCircle className='h-4 w-4 shrink-0' />
                                            <p className='text-xs'>
                                                {submissionState.message}
                                            </p>
                                        </div>
                                    )}

                                    <Button
                                        type='submit'
                                        variant='gold'
                                        size='md'
                                        disabled={isSubmitting}
                                        className='w-full justify-center py-3! text-sm'
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                                Sending...
                                            </>
                                        ) : (
                                            'Check Availability'
                                        )}
                                    </Button>
                                </form>
                            )}

                            <p className='mt-4 text-center text-xs text-stone-600'>
                                Respecting your privacy. No spam.
                            </p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
