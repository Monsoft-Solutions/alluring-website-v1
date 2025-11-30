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
import { CheckCircle2, Sparkles } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Form } from '@workspace/ui/components/form'

import {
    EmailField,
    FormFeedback,
    NameField,
    PhoneField,
    SelectField,
    SubmitButton,
} from '@/components/shared/forms'
import { useContactFormSubmission } from '@/hooks/useContactFormSubmission.hook'
import {
    CONTACT_SOURCES,
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

export const LeadForm = () => {
    const form = useForm<LeadFormInput>({
        resolver: zodResolver(leadFormSchema),
        defaultValues: {
            name: '',
            phone: '',
            email: '',
            procedure: '',
        },
    })

    const { submit, state, isSubmitting, isSuccess, isError } =
        useContactFormSubmission({
            source: CONTACT_SOURCES.LEAD_FORM,
            onSuccess: () => form.reset(),
        })

    const onSubmit = async (data: LeadFormInput) => {
        const procedureLabel = PROCEDURE_OPTIONS.find(
            (p) => p.value === data.procedure
        )?.label
        await submit({
            ...data,
            subject: data.procedure
                ? `Consultation Request: ${procedureLabel || data.procedure}`
                : 'Consultation Request',
        })
    }

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

                    {isSuccess ? (
                        <div className='mx-auto max-w-md rounded-xl border border-green-500/30 bg-green-500/10 p-8 text-center'>
                            <div className='mb-4 flex justify-center'>
                                <div className='flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20'>
                                    <CheckCircle2 className='h-8 w-8 text-green-400' />
                                </div>
                            </div>
                            <h3 className='mb-2 text-xl font-semibold text-white'>
                                Thank You!
                            </h3>
                            <p className='text-stone-300'>{state.message}</p>
                        </div>
                    ) : (
                        <Form {...form}>
                            <form
                                className='space-y-8'
                                onSubmit={form.handleSubmit(onSubmit)}
                            >
                                <div className='grid gap-8 md:grid-cols-2'>
                                    <NameField
                                        control={form.control}
                                        name='name'
                                        label='Full Name'
                                        placeholder='Jane Doe'
                                        disabled={isSubmitting}
                                        variant='dark'
                                        required
                                    />
                                    <PhoneField
                                        control={form.control}
                                        name='phone'
                                        label='Phone'
                                        placeholder='(555) 555-5555'
                                        disabled={isSubmitting}
                                        variant='dark'
                                        required
                                    />
                                </div>

                                <EmailField
                                    control={form.control}
                                    name='email'
                                    label='Email'
                                    placeholder='jane@example.com'
                                    disabled={isSubmitting}
                                    variant='dark'
                                    required={false}
                                />

                                <SelectField
                                    control={form.control}
                                    name='procedure'
                                    label='Interested In'
                                    disabled={isSubmitting}
                                    variant='dark'
                                    options={PROCEDURE_OPTIONS}
                                />

                                {isError && (
                                    <FormFeedback
                                        status='error'
                                        message={state.message}
                                        variant='dark'
                                    />
                                )}

                                <div className='pt-8 text-center'>
                                    <SubmitButton
                                        isSubmitting={isSubmitting}
                                        size='lg'
                                        variant='gold'
                                        showSparkles
                                        className='w-full min-w-[200px] md:w-auto'
                                    >
                                        Submit Request
                                    </SubmitButton>
                                    <p className='mt-4 text-sm text-stone-500'>
                                        Private & Confidential. No spam.
                                    </p>
                                </div>
                            </form>
                        </Form>
                    )}
                </div>
            </div>
        </section>
    )
}
