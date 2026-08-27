/**
 * ExitIntentDialog Component
 *
 * The panel itself: lead capture form, submitted to /api/contact with the
 * EXIT_INTENT source.
 *
 * Split out of `exit-intent-popup.component.tsx` so it can be loaded on
 * demand. The popup lives in the root layout, so anything it imports
 * statically — react-hook-form, zod, @hookform/resolvers, Radix Form — sits
 * in the shared chunk of every route on the site, for a panel most visitors
 * never see. The trigger shim now imports this file lazily, so the form stack
 * is fetched at the moment the popup actually opens (issue #199).
 *
 * Entry animation is CSS rather than Framer: the component only mounts when
 * it is about to be shown, so a mount-time keyframe is exactly the reveal
 * Framer's `initial`/`animate` was providing.
 */
'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@workspace/ui/components/button'
import { Form } from '@workspace/ui/components/form'
import { CheckCircle2, Languages, Loader2, Sparkles, X } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'

import { FormFeedback } from '@/components/shared/forms/form-feedback.component'
import {
    NameField,
    PhoneField,
} from '@/components/shared/forms/form-fields.component'
import { useContactFormSubmission } from '@/hooks/useContactFormSubmission.hook'
import { useAnalyticsEvent } from '@/lib/analytics/useAnalyticsEvent.hook'
import {
    CONTACT_SOURCES,
    type LeadCaptureInput,
    leadCaptureSchema,
} from '@/lib/types/forms/contact-form.type'

export type ExitIntentDialogProps = {
    /** Which trigger opened the popup, for the impression event. */
    triggerType: 'exit_intent' | 'timer_60s'
    /** Dismiss the popup. Also runs after a successful submission. */
    onClose: () => void
}

export const ExitIntentDialog = ({
    triggerType,
    onClose,
}: ExitIntentDialogProps) => {
    const { track } = useAnalyticsEvent()

    // `exit_intent_shown` fires here rather than in the trigger shim: this
    // component only mounts once its chunk has arrived, so the event now marks
    // a panel the visitor could actually see. Tracking it at trigger time
    // counted an impression while the fetch was still in flight — and on the
    // exit-intent path the trigger *is* the visitor leaving, so a slow
    // connection reliably logged popups nobody saw.
    const hasTracked = useRef(false)
    useEffect(() => {
        if (hasTracked.current) return
        hasTracked.current = true
        track('exit_intent_shown', { trigger_type: triggerType })
    }, [track, triggerType])

    const form = useForm<LeadCaptureInput>({
        resolver: zodResolver(leadCaptureSchema),
        defaultValues: {
            name: '',
            phone: '',
            _website: '',
        },
    })

    const { submit, state, isSubmitting, isSuccess, isError } =
        useContactFormSubmission({
            source: CONTACT_SOURCES.EXIT_INTENT,
            redirectOnSuccess: '/thank-you',
            onSuccess: () => {
                form.reset()
                onClose()
            },
        })

    const onSubmit = async (data: LeadCaptureInput) => {
        await submit(data)
    }

    return (
        <div className='pointer-events-none fixed inset-0 z-100 flex items-end justify-center p-0 md:items-end md:justify-end md:p-6'>
            {/* Mobile Backdrop - only visible on small screens to focus attention */}
            <div
                onClick={onClose}
                className='animate-in fade-in pointer-events-auto absolute inset-0 bg-black/40 backdrop-blur-sm duration-200 md:hidden'
            />

            <div className='border-gold-500/30 animate-in fade-in slide-in-from-bottom-8 pointer-events-auto relative w-full overflow-hidden rounded-t-2xl border-t bg-stone-900 shadow-2xl duration-300 md:w-[400px] md:rounded-xl md:border'>
                {/* Gold Top Line decoration */}
                <div className='from-gold-600 via-gold-300 to-gold-600 absolute top-0 right-0 left-0 h-1 bg-linear-to-r'></div>

                <div className='p-6 md:p-8'>
                    <button
                        onClick={onClose}
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
                        Slots are filling up fast. Get a priority consultation
                        and a personalized quote sent to your phone.
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
            </div>
        </div>
    )
}
