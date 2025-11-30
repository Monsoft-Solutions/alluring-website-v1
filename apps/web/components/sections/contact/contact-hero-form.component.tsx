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

import { zodResolver } from '@hookform/resolvers/zod'
import { Form } from '@workspace/ui/components/form'
import { motion } from 'framer-motion'
import { Award, CheckCircle2, Clock, ShieldCheck } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import {
    EmailField,
    FormFeedback,
    MessageField,
    NameField,
    PhoneField,
    SelectField,
    SubmitButton,
} from '@/components/shared/forms'
import { useContactFormSubmission } from '@/hooks/useContactFormSubmission.hook'
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

export type ContactHeroFormProps = {
    readonly id?: string
}

export function ContactHeroForm({ id = 'contact-hero' }: ContactHeroFormProps) {
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

    const { submit, state, isSubmitting, isSuccess, isError } =
        useContactFormSubmission({
            source: CONTACT_SOURCES.CONTACT_HERO,
            enableAnalytics: true,
            analyticsFormName: 'contact_hero_form',
            onSuccess: () => form.reset(),
        })

    const onSubmit = async (data: ContactHeroFormInput) => {
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
        <section
            id={id}
            className='relative min-h-screen w-full overflow-hidden bg-stone-900'
        >
            {/* Background Layers */}
            <div className='pointer-events-none absolute inset-0'>
                {/* Gradient Overlay */}
                <div className='absolute inset-0 bg-linear-to-br from-stone-900 via-stone-800 to-stone-900' />

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
                            board-certified surgeons. We&apos;ll discuss your
                            goals, answer every question, and create a
                            personalized plan for your aesthetic journey.
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

                            {isSuccess ? (
                                <div className='rounded-xl border border-green-500/30 bg-green-500/10 p-8 text-center'>
                                    <div className='mb-4 flex justify-center'>
                                        <div className='flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20'>
                                            <CheckCircle2 className='h-8 w-8 text-green-400' />
                                        </div>
                                    </div>
                                    <h3 className='mb-2 text-xl font-semibold text-white'>
                                        Thank You!
                                    </h3>
                                    <p className='text-stone-300'>
                                        {state.message}
                                    </p>
                                </div>
                            ) : (
                                <Form {...form}>
                                    <form
                                        onSubmit={form.handleSubmit(onSubmit)}
                                        className='space-y-6'
                                    >
                                        {/* Name & Email Row */}
                                        <div className='grid gap-6 md:grid-cols-2'>
                                            <NameField
                                                control={form.control}
                                                name='name'
                                                label='Full Name'
                                                placeholder='Your name'
                                                disabled={isSubmitting}
                                                variant='dark'
                                                required
                                            />
                                            <EmailField
                                                control={form.control}
                                                name='email'
                                                label='Email'
                                                placeholder='your@email.com'
                                                disabled={isSubmitting}
                                                variant='dark'
                                                required
                                            />
                                        </div>

                                        {/* Phone */}
                                        <PhoneField
                                            control={form.control}
                                            name='phone'
                                            label='Phone Number'
                                            placeholder='(555) 555-5555'
                                            disabled={isSubmitting}
                                            variant='dark'
                                            required
                                        />

                                        {/* Procedure Selector */}
                                        <SelectField
                                            control={form.control}
                                            name='procedure'
                                            label='Procedure of Interest'
                                            disabled={isSubmitting}
                                            variant='dark'
                                            options={PROCEDURE_OPTIONS}
                                        />

                                        {/* Message */}
                                        <MessageField
                                            control={form.control}
                                            name='message'
                                            label='Tell Us About Your Goals'
                                            placeholder="Share any details about what you're hoping to achieve..."
                                            disabled={isSubmitting}
                                            variant='dark'
                                            required={false}
                                            rows={3}
                                        />

                                        {/* Error feedback */}
                                        {isError && (
                                            <FormFeedback
                                                status='error'
                                                message={state.message}
                                                variant='dark'
                                            />
                                        )}

                                        {/* Submit Button */}
                                        <div className='pt-4'>
                                            <SubmitButton
                                                isSubmitting={isSubmitting}
                                                size='lg'
                                                variant='gold'
                                                fullWidth
                                                showSendIcon
                                                showSparkles
                                            >
                                                Request My Consultation
                                            </SubmitButton>
                                        </div>

                                        {/* Privacy Note */}
                                        <p className='text-center text-xs text-stone-500'>
                                            Your information is private and
                                            secure.
                                            <br />
                                            By submitting, you agree to receive
                                            communication from{' '}
                                            {siteConfig.business.name}.
                                        </p>
                                    </form>
                                </Form>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
