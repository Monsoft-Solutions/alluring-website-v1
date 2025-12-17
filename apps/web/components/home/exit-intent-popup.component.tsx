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
import { Form } from '@workspace/ui/components/form'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, Loader2, Sparkles, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

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
import { useAnalyticsEvent } from '@/lib/analytics/useAnalyticsEvent.hook'

export const ExitIntentPopup = () => {
    const [isVisible, setIsVisible] = useState(false)
    const [hasTriggered, setHasTriggered] = useState(false)
    const { track } = useAnalyticsEvent()

    const form = useForm<LeadCaptureInput>({
        resolver: zodResolver(leadCaptureSchema),
        defaultValues: {
            name: '',
            phone: '',
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
                track('exit_intent_shown', {
                    trigger_type: 'desktop_mouse_leave',
                })
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
                    track('exit_intent_shown', {
                        trigger_type: 'mobile_scroll',
                    })
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
