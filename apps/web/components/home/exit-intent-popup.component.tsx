/**
 * ExitIntentPopup Component
 *
 * Lead capture popup that triggers on exit intent OR after 60 seconds.
 * Submits to the unified /api/contact endpoint with EXIT_INTENT source.
 *
 * Features:
 * - Triggers when mouse leaves top of viewport (exit intent)
 * - Triggers automatically after 60 seconds
 * - Robust phone validation using shared schema
 * - Session-based dismissal tracking
 */
'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@workspace/ui/components/button'
import { Form } from '@workspace/ui/components/form'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, Languages, Loader2, Sparkles, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'

import { FormFeedback } from '@/components/shared/forms/form-feedback.component'
import {
    NameField,
    PhoneField,
} from '@/components/shared/forms/form-fields.component'
import {
    FORM_SUBMITTED_KEY,
    useContactFormSubmission,
} from '@/hooks/useContactFormSubmission.hook'
import { useAnalyticsEvent } from '@/lib/analytics/useAnalyticsEvent.hook'
import { useFormSubmittedListener } from '@/lib/events/form-events'
import {
    CONTACT_SOURCES,
    type LeadCaptureInput,
    leadCaptureSchema,
} from '@/lib/types/forms/contact-form.type'

export const ExitIntentPopup = () => {
    const [isVisible, setIsVisible] = useState(false)

    // Initialize hasTriggered by checking sessionStorage
    // This prevents showing popup if user has seen it or submitted any form
    const [hasTriggered, setHasTriggered] = useState(() => {
        if (typeof window === 'undefined') return false
        const hasSeen = sessionStorage.getItem('alluring_popup_seen')
        const hasSubmittedForm = sessionStorage.getItem(FORM_SUBMITTED_KEY)
        return Boolean(hasSeen || hasSubmittedForm)
    })

    // Ref to track current hasTriggered value, avoiding stale closure in timer callback
    const hasTriggeredRef = useRef(hasTriggered)

    // Keep ref in sync with state
    useEffect(() => {
        hasTriggeredRef.current = hasTriggered
    }, [hasTriggered])

    // Listen for form submissions from ANY form in the app
    // This handles the case where user submits a form elsewhere (e.g., PromoModal)
    // and we need to prevent this popup from showing on the thank-you page
    useFormSubmittedListener(
        useCallback(() => {
            setHasTriggered(true)
            hasTriggeredRef.current = true
            setIsVisible(false) // Close if currently open
        }, [])
    )

    const { track } = useAnalyticsEvent()

    const form = useForm<LeadCaptureInput>({
        resolver: zodResolver(leadCaptureSchema),
        defaultValues: {
            name: '',
            phone: '',
            _website: '',
        },
    })

    const handleClose = () => {
        track('exit_intent_dismissed', {
            method: 'close_button',
        })
        setIsVisible(false)
        if (typeof window !== 'undefined') {
            sessionStorage.setItem('alluring_popup_seen', 'true')
        }
    }

    const { submit, state, isSubmitting, isSuccess, isError } =
        useContactFormSubmission({
            source: CONTACT_SOURCES.EXIT_INTENT,
            redirectOnSuccess: '/thank-you',
            onSuccess: () => {
                form.reset()
                handleClose()
            },
        })

    useEffect(() => {
        // Don't attach listeners if already triggered
        if (hasTriggered) return

        const handleExitIntent = (e: MouseEvent) => {
            // Trigger when mouse leaves top of viewport (exit intent)
            // Use ref to get current value and avoid stale closure
            if (e.clientY <= 0 && !hasTriggeredRef.current) {
                track('exit_intent_shown', {
                    trigger_type: 'exit_intent',
                })
                setIsVisible(true)
                setHasTriggered(true)
                hasTriggeredRef.current = true
            }
        }

        // Timer-based trigger: Show after 60 seconds
        // Use ref instead of state to avoid stale closure issue
        const timer = setTimeout(() => {
            if (!hasTriggeredRef.current) {
                track('exit_intent_shown', {
                    trigger_type: 'timer_60s',
                })
                setIsVisible(true)
                setHasTriggered(true)
                hasTriggeredRef.current = true
            }
        }, 60000) // 60 seconds

        document.addEventListener('mouseleave', handleExitIntent)

        return () => {
            document.removeEventListener('mouseleave', handleExitIntent)
            clearTimeout(timer)
        }
    }, [hasTriggered, track])

    const onSubmit = async (data: LeadCaptureInput) => {
        await submit(data)
    }

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

                            {/* Spanish Language Indicator */}
                            <div className='mb-6 flex items-center gap-2 border-y border-white/5 py-3'>
                                <Languages className='text-gold-400 h-4 w-4' />
                                <span className='text-xs font-medium text-stone-300'>
                                    Hablamos Español — Personalized Care in Your
                                    Language
                                </span>
                            </div>

                            {isSuccess ? (
                                <div className='flex items-center gap-3 rounded-lg border border-green-500/30 bg-green-500/10 p-4 text-green-400'>
                                    <CheckCircle2 className='h-5 w-5 shrink-0' />
                                    <p className='text-sm'>{state.message}</p>
                                </div>
                            ) : (
                                <Form {...form}>
                                    <form
                                        onSubmit={form.handleSubmit(onSubmit)}
                                        className='space-y-3'
                                    >
                                        {/* Honeypot field - hidden from real users */}
                                        <div
                                            aria-hidden='true'
                                            style={{
                                                position: 'absolute',
                                                left: '-9999px',
                                                height: 0,
                                                overflow: 'hidden',
                                            }}
                                        >
                                            <label htmlFor='_website_exit'>
                                                Website
                                            </label>
                                            <input
                                                type='text'
                                                id='_website_exit'
                                                tabIndex={-1}
                                                autoComplete='off'
                                                {...form.register('_website')}
                                            />
                                        </div>

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
                                </Form>
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
