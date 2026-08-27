/**
 * PromoModalDialog Component
 *
 * The modal itself: promotion visual plus an embedded lead capture form,
 * submitted to /api/contact with the PROMO_MODAL source.
 *
 * Split out of `promo-modal.component.tsx` so it can be fetched on demand.
 * The modal is mounted from the root layout and opens after a configurable
 * delay (120s for the current promotion), yet its imports — react-hook-form,
 * zod, @hookform/resolvers, Radix Form — sat in the shared chunk of every
 * route from the first byte. The trigger shim imports this file lazily, so
 * the form stack is fetched when the modal actually opens (issue #199).
 *
 * Entry animation is `tw-animate-css` rather than Framer: this component only
 * mounts when it is about to be shown, so a mount-time animation is exactly
 * the reveal Framer's `initial`/`animate` provided.
 */
'use client'

import Image from 'next/image'
import { zodResolver } from '@hookform/resolvers/zod'
import {
    CheckCircle2,
    Loader2,
    Sparkles,
    X,
    Clock,
    Gift,
    Languages,
} from 'lucide-react'
import { useForm } from 'react-hook-form'

import { Button } from '@workspace/ui/components/button'
import { Form } from '@workspace/ui/components/form'

import { FormFeedback } from '@/components/shared/forms/form-feedback.component'
import {
    NameField,
    PhoneField,
} from '@/components/shared/forms/form-fields.component'
import { PromotionMarkdownClient } from '@/components/promotions/promotion-markdown.component'
import { useContactFormSubmission } from '@/hooks/useContactFormSubmission.hook'
import {
    CONTACT_SOURCES,
    type LeadCaptureInput,
    leadCaptureSchema,
} from '@/lib/types/forms/contact-form.type'
import type { PromoModalData } from './promo-modal.type'

export type PromoModalDialogProps = {
    promotion: PromoModalData
    /** Dismiss the modal. Also runs after a successful submission. */
    onClose: () => void
}

export function PromoModalDialog({
    promotion,
    onClose,
}: PromoModalDialogProps) {
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
            source: CONTACT_SOURCES.PROMO_MODAL,
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
        <div className='pointer-events-none fixed inset-0 z-[100] flex items-center justify-center p-4'>
            {/* Backdrop */}
            <div
                onClick={onClose}
                className='animate-in fade-in pointer-events-auto absolute inset-0 bg-black/70 backdrop-blur-sm duration-200'
            />

            {/* Modal */}
            <div className='animate-in fade-in zoom-in-95 pointer-events-auto relative w-full max-w-4xl overflow-hidden rounded-2xl bg-stone-900 shadow-2xl duration-300'>
                {/* Gold accent line */}
                <div className='from-gold-600 via-gold-400 to-gold-600 absolute top-0 right-0 left-0 h-1 bg-gradient-to-r' />

                {/* Close button */}
                <button
                    onClick={onClose}
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
                                    alt={promotion.imageAlt || promotion.title}
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
                            <PromotionMarkdownClient
                                content={promotion.excerpt}
                                className='mb-6 text-sm leading-relaxed text-stone-400'
                            />
                        )}

                        {/* Countdown */}
                        {promotion.daysRemaining !== null &&
                            promotion.daysRemaining > 0 && (
                                <div className='mb-6 inline-flex items-center gap-2 rounded-lg border border-stone-700/50 bg-stone-800/50 px-4 py-2'>
                                    <Clock className='text-gold-400 h-4 w-4' />
                                    <span className='text-sm text-stone-300'>
                                        <span className='text-gold-400 font-bold'>
                                            {promotion.daysRemaining} days
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
                                    onSubmit={form.handleSubmit(onSubmit)}
                                    className='space-y-4'
                                >
                                    {/* Honeypot field - hidden from real users, bots will fill it */}
                                    <div
                                        aria-hidden='true'
                                        style={{
                                            position: 'absolute',
                                            left: '-9999px',
                                            height: 0,
                                            overflow: 'hidden',
                                        }}
                                    >
                                        <label htmlFor='_website_promo'>
                                            Website
                                        </label>
                                        <input
                                            type='text'
                                            id='_website_promo'
                                            tabIndex={-1}
                                            autoComplete='off'
                                            {...form.register('_website')}
                                        />
                                    </div>

                                    <p className='mb-2 text-sm text-stone-400'>
                                        Claim your exclusive offer. We&apos;ll
                                        contact you to schedule your
                                        consultation.
                                    </p>

                                    <div className='bg-gold-500/5 mb-4 flex items-center gap-2 rounded-lg border border-white/5 px-3 py-2'>
                                        <Languages className='text-gold-400 h-4 w-4' />
                                        <span className='text-xs font-medium text-stone-300'>
                                            Hablamos Español
                                        </span>
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
            </div>
        </div>
    )
}
