/**
 * ContactHeroForm Component
 *
 * An immersive hero section with an integrated contact form.
 * Designed as the primary conversion element for the contact page.
 *
 * Features:
 * - Full viewport hero with elegant background treatment
 * - Procedure of interest dropdown
 * - Trust badges below the form
 * - Responsive design with mobile-first approach
 * - Form validation with react-hook-form and zod
 */
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import {
    Loader2,
    Send,
    ShieldCheck,
    Award,
    Clock,
    Sparkles,
    CheckCircle2,
    AlertCircle,
} from 'lucide-react'
import { Button } from '@workspace/ui/components/button'

import { useAnalyticsEvent } from '@/lib/analytics/useAnalyticsEvent.hook'
import { siteConfig } from '@/lib/data/site-config'
import {
    CONTACT_SOURCES,
    nameSchema,
    requiredEmailSchema,
    requiredPhoneSchema,
} from '@/lib/types/forms/contact-form.type'

/**
 * Procedure options for the dropdown
 */
const PROCEDURE_OPTIONS = [
    { value: '', label: 'Select a procedure of interest' },
    { value: 'bbl', label: 'Brazilian Butt Lift (BBL)' },
    { value: 'mommy-makeover', label: 'Mommy Makeover' },
    { value: 'breast-augmentation', label: 'Breast Augmentation' },
    { value: 'breast-lift', label: 'Breast Lift' },
    { value: 'breast-reduction', label: 'Breast Reduction' },
    { value: 'tummy-tuck', label: 'Tummy Tuck' },
    { value: 'liposuction', label: 'Liposuction / Lipo 360' },
    { value: 'facelift', label: 'Facelift' },
    { value: 'rhinoplasty', label: 'Rhinoplasty (Nose Job)' },
    { value: 'blepharoplasty', label: 'Eyelid Surgery (Blepharoplasty)' },
    { value: 'multiple', label: 'Multiple Procedures' },
    { value: 'other', label: 'Other / Not Sure Yet' },
] as const

/**
 * Contact hero form validation schema
 * Uses shared validation schemas for robust email and phone validation
 */
const contactHeroFormSchema = z.object({
    name: nameSchema,
    email: requiredEmailSchema,
    phone: requiredPhoneSchema,
    procedure: z.string().optional(),
    message: z.string().trim().optional(),
})

type ContactHeroFormInput = z.infer<typeof contactHeroFormSchema>

type SubmissionState = {
    status: 'idle' | 'success' | 'error'
    message: string
}

export type ContactHeroFormProps = {
    readonly id?: string
}

export function ContactHeroForm({ id = 'contact-hero' }: ContactHeroFormProps) {
    const [submissionState, setSubmissionState] = useState<SubmissionState>({
        status: 'idle',
        message: '',
    })

    const { trackFormSubmit, track } = useAnalyticsEvent()

    const form = useForm<ContactHeroFormInput>({
        resolver: zodResolver(contactHeroFormSchema),
        defaultValues: {
            name: '',
            email: '',
            phone: '',
            procedure: '',
            message: '',
        },
    })

    const onSubmit = async (data: ContactHeroFormInput) => {
        try {
            setSubmissionState({ status: 'idle', message: '' })

            track('form_start', {
                form_name: 'contact_hero_form',
                procedure: data.procedure || 'not_specified',
            })

            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...data,
                    subject: data.procedure
                        ? `Consultation Request: ${PROCEDURE_OPTIONS.find((p) => p.value === data.procedure)?.label || data.procedure}`
                        : 'Consultation Request',
                    source: CONTACT_SOURCES.CONTACT_HERO,
                }),
            })

            const result = await response.json()

            if (response.ok && result.success) {
                setSubmissionState({
                    status: 'success',
                    message:
                        'Thank you! Our concierge will contact you within 24 hours to schedule your consultation.',
                })
                trackFormSubmit('contact_hero_form', {
                    status: 'success',
                    procedure: data.procedure || 'not_specified',
                })
                form.reset()
            } else {
                setSubmissionState({
                    status: 'error',
                    message:
                        result.error ||
                        'Something went wrong. Please try again.',
                })
                track('form_error', {
                    form_name: 'contact_hero_form',
                    error_type: 'api_error',
                })
            }
        } catch {
            setSubmissionState({
                status: 'error',
                message:
                    'Network error. Please check your connection and try again.',
            })
            track('form_error', {
                form_name: 'contact_hero_form',
                error_type: 'network_error',
            })
        }
    }

    const isSubmitting = form.formState.isSubmitting

    return (
        <section
            id={id}
            className='relative min-h-screen w-full overflow-hidden bg-stone-900'
        >
            {/* Background Layers */}
            <div className='pointer-events-none absolute inset-0'>
                {/* Gradient Overlay */}
                <div className='absolute inset-0 bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900' />

                {/* Decorative Blurs */}
                <div className='bg-gold-600/10 absolute -top-[20%] -right-[15%] h-[800px] w-[800px] rounded-full blur-3xl' />
                <div className='absolute -bottom-[30%] -left-[15%] h-[600px] w-[600px] rounded-full bg-stone-700/30 blur-3xl' />
                <div className='bg-gold-500/5 absolute top-[40%] left-[20%] h-[400px] w-[400px] rounded-full blur-3xl' />

                {/* Subtle Pattern */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diamond-upholstery.png')] opacity-[0.02]" />
            </div>

            {/* Content Container */}
            <div className='relative z-10 container mx-auto px-6 py-20 md:px-12 lg:py-32'>
                <div className='grid items-center gap-12 lg:grid-cols-2 lg:gap-20'>
                    {/* Left Column - Copy */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className='text-center lg:text-left'
                    >
                        <div className='mb-6 inline-flex items-center gap-2'>
                            <span className='bg-gold-400 h-[1px] w-8' />
                            <span className='text-gold-400 text-sm font-bold tracking-[0.2em] uppercase'>
                                Start Your Journey
                            </span>
                        </div>

                        <h1 className='mb-6 font-serif text-4xl leading-[1.1] text-white md:text-5xl lg:text-6xl'>
                            Your Transformation{' '}
                            <br className='hidden lg:block' />
                            <span className='text-gold-400 italic'>
                                Begins Here
                            </span>
                        </h1>

                        <p className='mx-auto mb-10 max-w-xl text-xl leading-relaxed font-light text-stone-300 lg:mx-0'>
                            Schedule your private consultation with our
                            board-certified surgeons. We'll discuss your goals,
                            answer every question, and create a personalized
                            plan for your aesthetic journey.
                        </p>

                        {/* Trust Indicators */}
                        <div className='flex flex-wrap justify-center gap-6 lg:justify-start'>
                            <div className='flex items-center gap-2 text-stone-400'>
                                <ShieldCheck className='text-gold-400 h-5 w-5' />
                                <span className='text-sm font-medium'>
                                    {siteConfig.trustStats?.accreditation ??
                                        'AAAASF'}{' '}
                                    Accredited
                                </span>
                            </div>
                            <div className='flex items-center gap-2 text-stone-400'>
                                <Award className='text-gold-400 h-5 w-5' />
                                <span className='text-sm font-medium'>
                                    Board-Certified
                                </span>
                            </div>
                            <div className='flex items-center gap-2 text-stone-400'>
                                <Clock className='text-gold-400 h-5 w-5' />
                                <span className='text-sm font-medium'>
                                    24hr Response
                                </span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Column - Form */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                            duration: 0.8,
                            delay: 0.2,
                            ease: 'easeOut',
                        }}
                    >
                        <div className='border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl md:p-10'>
                            {/* Form Header */}
                            <div className='mb-8 text-center'>
                                <h2 className='mb-2 font-serif text-2xl text-white md:text-3xl'>
                                    Request Your Consultation
                                </h2>
                                <p className='text-stone-400'>
                                    Complimentary • Confidential • No Obligation
                                </p>
                            </div>

                            <form
                                onSubmit={form.handleSubmit(onSubmit)}
                                className='space-y-6'
                            >
                                {/* Name & Email Row */}
                                <div className='grid gap-6 md:grid-cols-2'>
                                    <div className='group space-y-2'>
                                        <label
                                            htmlFor='name'
                                            className='text-gold-400 text-xs font-bold tracking-widest uppercase transition-colors group-focus-within:text-white'
                                        >
                                            Full Name *
                                        </label>
                                        <input
                                            id='name'
                                            type='text'
                                            {...form.register('name')}
                                            disabled={isSubmitting}
                                            className='focus:border-gold-400 w-full border-b border-stone-700 bg-transparent py-3 text-white placeholder-stone-600 transition-colors focus:outline-none'
                                            placeholder='Your name'
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

                                    <div className='group space-y-2'>
                                        <label
                                            htmlFor='email'
                                            className='text-gold-400 text-xs font-bold tracking-widest uppercase transition-colors group-focus-within:text-white'
                                        >
                                            Email *
                                        </label>
                                        <input
                                            id='email'
                                            type='email'
                                            {...form.register('email')}
                                            disabled={isSubmitting}
                                            className='focus:border-gold-400 w-full border-b border-stone-700 bg-transparent py-3 text-white placeholder-stone-600 transition-colors focus:outline-none'
                                            placeholder='your@email.com'
                                        />
                                        {form.formState.errors.email && (
                                            <p className='text-xs text-red-400'>
                                                {
                                                    form.formState.errors.email
                                                        .message
                                                }
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Phone */}
                                <div className='group space-y-2'>
                                    <label
                                        htmlFor='phone'
                                        className='text-gold-400 text-xs font-bold tracking-widest uppercase transition-colors group-focus-within:text-white'
                                    >
                                        Phone Number *
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

                                {/* Procedure Selector */}
                                <div className='group space-y-2'>
                                    <label
                                        htmlFor='procedure'
                                        className='text-gold-400 text-xs font-bold tracking-widest uppercase transition-colors group-focus-within:text-white'
                                    >
                                        Procedure of Interest
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

                                {/* Message */}
                                <div className='group space-y-2'>
                                    <label
                                        htmlFor='message'
                                        className='text-gold-400 text-xs font-bold tracking-widest uppercase transition-colors group-focus-within:text-white'
                                    >
                                        Tell Us About Your Goals{' '}
                                        <span className='font-normal text-stone-500'>
                                            (Optional)
                                        </span>
                                    </label>
                                    <textarea
                                        id='message'
                                        {...form.register('message')}
                                        disabled={isSubmitting}
                                        rows={3}
                                        className='focus:border-gold-400 w-full resize-none border-b border-stone-700 bg-transparent py-3 text-white placeholder-stone-600 transition-colors focus:outline-none'
                                        placeholder="Share any details about what you're hoping to achieve..."
                                    />
                                </div>

                                {/* Submission State Messages */}
                                {submissionState.status === 'success' && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className='flex items-start gap-3 border border-green-500/30 bg-green-500/10 p-4'
                                    >
                                        <CheckCircle2 className='mt-0.5 h-5 w-5 flex-shrink-0 text-green-400' />
                                        <p className='text-sm text-green-300'>
                                            {submissionState.message}
                                        </p>
                                    </motion.div>
                                )}

                                {submissionState.status === 'error' && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className='flex items-start gap-3 border border-red-500/30 bg-red-500/10 p-4'
                                    >
                                        <AlertCircle className='mt-0.5 h-5 w-5 flex-shrink-0 text-red-400' />
                                        <p className='text-sm text-red-300'>
                                            {submissionState.message}
                                        </p>
                                    </motion.div>
                                )}

                                {/* Submit Button */}
                                <div className='pt-4'>
                                    <Button
                                        type='submit'
                                        size='lg'
                                        variant='gold'
                                        disabled={isSubmitting}
                                        className='group w-full'
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className='mr-2 h-5 w-5 animate-spin' />
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                <Send className='mr-2 h-5 w-5 transition-transform duration-200 group-hover:translate-x-0.5' />
                                                Request My Consultation
                                                <Sparkles className='ml-2 h-4 w-4 opacity-60' />
                                            </>
                                        )}
                                    </Button>
                                </div>

                                {/* Privacy Note */}
                                <p className='text-center text-xs text-stone-500'>
                                    Your information is private and secure.
                                    <br />
                                    By submitting, you agree to receive
                                    communication from{' '}
                                    {siteConfig.business.name}.
                                </p>
                            </form>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
