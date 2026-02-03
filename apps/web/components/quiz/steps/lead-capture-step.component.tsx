/**
 * Lead Capture Step Component
 *
 * Form step to capture user contact information before showing results.
 *
 * @module components/quiz/steps/lead-capture-step
 */
'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Form } from '@workspace/ui/components/form'
import { cn } from '@workspace/ui/lib/utils'
import { motion } from 'framer-motion'
import { Loader2, Lock, Shield, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import {
    CheckboxField,
    EmailField,
    FirstNameField,
    LastNameField,
    PhoneField,
} from '@/components/shared/forms/form-fields.component'
import { FormFeedback } from '@/components/shared/forms/form-feedback.component'
import { siteConfig } from '@/lib/data/site-config'
import {
    requiredEmailSchema,
    requiredPhoneSchema,
} from '@/lib/types/forms/contact-form.type'
import type { QuizLeadData } from '../lib/quiz-types'
import { QUIZ_QUESTIONS } from '../lib/quiz-questions.data'

// Schema for quiz lead capture
const quizLeadSchema = z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: requiredEmailSchema,
    phone: requiredPhoneSchema,
    consentGiven: z.boolean().refine((val) => val === true, {
        message: 'You must agree to the terms to continue.',
    }),
})

type QuizLeadFormInput = z.input<typeof quizLeadSchema>

export interface LeadCaptureStepProps {
    /** Handler for form submission */
    readonly onSubmit: (data: QuizLeadData) => void
    /** Whether the form is submitting */
    readonly isSubmitting?: boolean
    /** Error message to display */
    readonly error?: string
    /** Additional class names */
    readonly className?: string
}

/**
 * LeadCaptureStep - Contact info form before results
 */
export function LeadCaptureStep({
    onSubmit,
    isSubmitting = false,
    error,
    className,
}: LeadCaptureStepProps) {
    const content = QUIZ_QUESTIONS.leadCapture

    const form = useForm<QuizLeadFormInput>({
        resolver: zodResolver(quizLeadSchema),
        defaultValues: {
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            consentGiven: false,
        },
    })

    const handleSubmit = (data: QuizLeadFormInput) => {
        onSubmit({
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: data.phone,
        })
    }

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className={cn('space-y-8', className)}
        >
            {/* Header */}
            <div className='text-center'>
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className='from-gold-400 to-gold-500 mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br'
                >
                    <Sparkles className='h-8 w-8 text-white' />
                </motion.div>
                <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className='font-serif text-2xl text-stone-900 md:text-3xl'
                >
                    {content.title}
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className='mt-2 text-stone-600'
                >
                    {content.subtitle}
                </motion.p>
            </div>

            {/* Form */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className='mx-auto max-w-md rounded-2xl bg-white p-6 shadow-lg shadow-stone-200/50'
            >
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(handleSubmit)}
                        className='space-y-5'
                    >
                        {/* Name fields */}
                        <div className='grid gap-4 sm:grid-cols-2'>
                            <FirstNameField
                                control={form.control}
                                name='firstName'
                                label='First Name'
                                placeholder='First name'
                                disabled={isSubmitting}
                                variant='light'
                                required
                            />
                            <LastNameField
                                control={form.control}
                                name='lastName'
                                label='Last Name'
                                placeholder='Last name'
                                disabled={isSubmitting}
                                variant='light'
                                required
                            />
                        </div>

                        {/* Email */}
                        <EmailField
                            control={form.control}
                            name='email'
                            label='Email'
                            placeholder='your@email.com'
                            disabled={isSubmitting}
                            variant='light'
                            required
                        />

                        {/* Phone */}
                        <PhoneField
                            control={form.control}
                            name='phone'
                            label='Phone Number'
                            placeholder='(555) 555-5555'
                            disabled={isSubmitting}
                            variant='light'
                            required
                        />

                        {/* Consent */}
                        <CheckboxField
                            control={form.control}
                            name='consentGiven'
                            disabled={isSubmitting}
                            variant='light'
                            required
                        >
                            I have read and understood the{' '}
                            <Link
                                href='/privacy'
                                className='text-gold-600 hover:text-gold-500 underline'
                                target='_blank'
                            >
                                Privacy Policy
                            </Link>{' '}
                            and{' '}
                            <Link
                                href='/terms'
                                className='text-gold-600 hover:text-gold-500 underline'
                                target='_blank'
                            >
                                Terms
                            </Link>
                            . By submitting, I consent to receive informational
                            messages from {siteConfig.business.name}.
                        </CheckboxField>

                        {/* Error */}
                        {error && (
                            <FormFeedback
                                status='error'
                                message={error}
                                variant='light'
                            />
                        )}

                        {/* Submit button */}
                        <motion.button
                            type='submit'
                            disabled={isSubmitting}
                            whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                            whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                            className={cn(
                                'w-full rounded-xl px-6 py-4',
                                'from-gold-500 to-gold-400 bg-gradient-to-r',
                                'font-semibold text-stone-900',
                                'shadow-gold-500/30 shadow-lg',
                                'transition-all duration-300',
                                'hover:shadow-gold-500/40 hover:shadow-xl',
                                'disabled:cursor-not-allowed disabled:opacity-70'
                            )}
                        >
                            {isSubmitting ? (
                                <span className='flex items-center justify-center gap-2'>
                                    <Loader2 className='h-5 w-5 animate-spin' />
                                    Preparing Your Results...
                                </span>
                            ) : (
                                'See My Personalized Recommendations'
                            )}
                        </motion.button>
                    </form>
                </Form>

                {/* Trust indicators */}
                <div className='mt-6 flex items-center justify-center gap-4 text-xs text-stone-500'>
                    <span className='flex items-center gap-1'>
                        <Lock className='h-3 w-3' />
                        Secure
                    </span>
                    <span className='flex items-center gap-1'>
                        <Shield className='h-3 w-3' />
                        Private
                    </span>
                </div>
            </motion.div>

            {/* Reassurance */}
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className='text-center text-sm text-stone-500'
            >
                Your information is used only to provide personalized
                recommendations. We never share or sell your data.
            </motion.p>
        </motion.div>
    )
}
