/**
 * LeadForm Component
 *
 * Consultation request form for the home page.
 * Submits to the unified /api/contact endpoint with LEAD_FORM source.
 *
 * Features:
 * - Full consultation form with procedure selection
 * - Robust phone and email validation using shared schemas
 * - Elegant dark theme with gold accents
 */
'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@workspace/ui/components/button'
import { AlertCircle, CheckCircle2, Loader2, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import {
    CONTACT_SOURCES,
    type ContactFormResponse,
    emailSchema,
    nameSchema,
    requiredPhoneSchema,
} from '@/lib/types/forms/contact-form.type'

/**
 * Procedure options for the dropdown
 */
const PROCEDURE_OPTIONS = [
    { value: '', label: 'Select a procedure' },
    { value: 'bbl', label: 'Brazilian Butt Lift (BBL)' },
    { value: 'mommy-makeover', label: 'Mommy Makeover' },
    { value: 'breast-augmentation', label: 'Breast Augmentation' },
    { value: 'facial-rejuvenation', label: 'Facial Rejuvenation' },
    { value: 'tummy-tuck', label: 'Tummy Tuck' },
    { value: 'liposuction', label: 'Liposuction / Lipo 360' },
    { value: 'other', label: 'Other / Not Sure Yet' },
] as const

/**
 * Lead form validation schema
 * Phone is required, email is optional
 */
const leadFormSchema = z.object({
    name: nameSchema,
    phone: requiredPhoneSchema,
    email: emailSchema,
    procedure: z.string().optional(),
})

type LeadFormInput = z.input<typeof leadFormSchema>

type SubmissionState = {
    status: 'idle' | 'success' | 'error'
    message: string
}

export const LeadForm = () => {
    const [submissionState, setSubmissionState] = useState<SubmissionState>({
        status: 'idle',
        message: '',
    })

    const form = useForm<LeadFormInput>({
        resolver: zodResolver(leadFormSchema),
        defaultValues: {
            name: '',
            phone: '',
            email: '',
            procedure: '',
        },
    })

    const onSubmit = async (data: LeadFormInput) => {
        try {
            setSubmissionState({ status: 'idle', message: '' })

            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...data,
                    subject: data.procedure
                        ? `Consultation Request: ${PROCEDURE_OPTIONS.find((p) => p.value === data.procedure)?.label || data.procedure}`
                        : 'Consultation Request',
                    source: CONTACT_SOURCES.LEAD_FORM,
                }),
            })

            const result: ContactFormResponse = await response.json()

            if (response.ok && result.success) {
                setSubmissionState({
                    status: 'success',
                    message:
                        result.message ||
                        'Thank you! Our concierge will contact you within 24 hours.',
                })
                form.reset()
            } else {
                setSubmissionState({
                    status: 'error',
                    message:
                        result.error ||
                        'Something went wrong. Please try again.',
                })
            }
        } catch (error) {
            console.error('Lead form submission error:', error)
            setSubmissionState({
                status: 'error',
                message: 'Network error. Please check your connection.',
            })
        }
    }

    const isSubmitting = form.formState.isSubmitting

    return (
        <section className='relative overflow-hidden bg-stone-900 py-24'>
            {/* Background Art */}
            <div className='pointer-events-none absolute inset-0 overflow-hidden'>
                <div className='bg-gold-600/10 absolute -top-[20%] -right-[10%] h-[600px] w-[600px] rounded-full blur-3xl'></div>
                <div className='absolute -bottom-[20%] -left-[10%] h-[500px] w-[500px] rounded-full bg-stone-700/20 blur-3xl'></div>
            </div>

            <div className='relative z-10 container mx-auto px-6 md:px-12'>
                <div className='mx-auto max-w-4xl rounded-sm border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-lg md:p-16'>
                    <div className='mb-12 text-center'>
                        <h2 className='mb-4 font-serif text-3xl text-white md:text-5xl'>
                            Request Your Consultation
                        </h2>
                        <p className='text-lg text-stone-400'>
                            Tell us a bit about your goals. Our concierge will
                            reach out to discuss availability.
                        </p>
                    </div>

                    {submissionState.status === 'success' ? (
                        <div className='mx-auto max-w-md rounded-xl border border-green-500/30 bg-green-500/10 p-8 text-center'>
                            <div className='mb-4 flex justify-center'>
                                <div className='flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20'>
                                    <CheckCircle2 className='h-8 w-8 text-green-400' />
                                </div>
                            </div>
                            <h3 className='mb-2 text-xl font-semibold text-white'>
                                Thank You!
                            </h3>
                            <p className='text-stone-300'>
                                {submissionState.message}
                            </p>
                        </div>
                    ) : (
                        <form
                            className='space-y-8'
                            onSubmit={form.handleSubmit(onSubmit)}
                        >
                            <div className='grid gap-8 md:grid-cols-2'>
                                <div className='group space-y-2'>
                                    <label
                                        htmlFor='name'
                                        className='text-gold-500 text-xs font-bold tracking-widest uppercase transition-colors group-focus-within:text-white'
                                    >
                                        Full Name *
                                    </label>
                                    <input
                                        id='name'
                                        type='text'
                                        {...form.register('name')}
                                        disabled={isSubmitting}
                                        className='focus:border-gold-400 w-full border-b border-stone-700 bg-transparent py-3 text-white placeholder-stone-600 transition-colors focus:outline-none'
                                        placeholder='Jane Doe'
                                    />
                                    {form.formState.errors.name && (
                                        <p className='text-xs text-red-400'>
                                            {form.formState.errors.name.message}
                                        </p>
                                    )}
                                </div>
                                <div className='group space-y-2'>
                                    <label
                                        htmlFor='phone'
                                        className='text-gold-500 text-xs font-bold tracking-widest uppercase transition-colors group-focus-within:text-white'
                                    >
                                        Phone *
                                    </label>
                                    <input
                                        id='phone'
                                        type='tel'
                                        {...form.register('phone')}
                                        disabled={isSubmitting}
                                        className='focus:border-gold-400 w-full border-b border-stone-700 bg-transparent py-3 text-white placeholder-stone-600 transition-colors focus:outline-none'
                                        placeholder='(555) 555-5555'
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
                            </div>

                            <div className='group space-y-2'>
                                <label
                                    htmlFor='email'
                                    className='text-gold-500 text-xs font-bold tracking-widest uppercase transition-colors group-focus-within:text-white'
                                >
                                    Email{' '}
                                    <span className='font-normal text-stone-500'>
                                        (Optional)
                                    </span>
                                </label>
                                <input
                                    id='email'
                                    type='email'
                                    {...form.register('email')}
                                    disabled={isSubmitting}
                                    className='focus:border-gold-400 w-full border-b border-stone-700 bg-transparent py-3 text-white placeholder-stone-600 transition-colors focus:outline-none'
                                    placeholder='jane@example.com'
                                />
                                {form.formState.errors.email && (
                                    <p className='text-xs text-red-400'>
                                        {form.formState.errors.email.message}
                                    </p>
                                )}
                            </div>

                            <div className='group space-y-2'>
                                <label
                                    htmlFor='procedure'
                                    className='text-gold-500 text-xs font-bold tracking-widest uppercase transition-colors group-focus-within:text-white'
                                >
                                    Interested In
                                </label>
                                <select
                                    id='procedure'
                                    {...form.register('procedure')}
                                    disabled={isSubmitting}
                                    className='focus:border-gold-400 w-full border-b border-stone-700 bg-transparent py-3 text-white transition-colors focus:outline-none'
                                >
                                    {PROCEDURE_OPTIONS.map((option) => (
                                        <option
                                            key={option.value}
                                            value={option.value}
                                            className='bg-stone-900 text-white'
                                        >
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {submissionState.status === 'error' && (
                                <div className='flex items-center gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-400'>
                                    <AlertCircle className='h-5 w-5 shrink-0' />
                                    <p className='text-sm'>
                                        {submissionState.message}
                                    </p>
                                </div>
                            )}

                            <div className='pt-8 text-center'>
                                <Button
                                    type='submit'
                                    className='w-full min-w-[200px] md:w-auto'
                                    size='lg'
                                    variant='gold'
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className='mr-2 h-5 w-5 animate-spin' />
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            Submit Request
                                            <Sparkles className='ml-2 h-4 w-4 opacity-60' />
                                        </>
                                    )}
                                </Button>
                                <p className='mt-4 text-sm text-stone-500'>
                                    Private & Confidential. No spam.
                                </p>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </section>
    )
}
