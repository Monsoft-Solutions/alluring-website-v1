/**
 * ConsultationForm Component
 *
 * A reusable consultation request form with comprehensive lead capture.
 * Dark theme optimized for use in hero sections and prominent page areas.
 *
 * Features:
 * - First name and last name fields (split)
 * - Email and phone (both required)
 * - Procedure of interest dropdown
 * - Preferred contact time dropdown
 * - Consent checkbox with Privacy Policy and Terms links
 * - Customizable title and subtitle
 * - Built-in success state display
 * - Form validation with react-hook-form and zod
 *
 * @module components/shared/forms/consultation-form
 */
'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Form } from '@workspace/ui/components/form'
import { CheckCircle2, Stethoscope } from 'lucide-react'
import Link from 'next/link'
import { type Resolver, useForm } from 'react-hook-form'

import { FormFeedback } from '@/components/shared/forms/form-feedback.component'
import {
    CheckboxField,
    EmailField,
    FirstNameField,
    LastNameField,
    PhoneField,
    SelectField,
} from '@/components/shared/forms/form-fields.component'
import { SubmitButton } from '@/components/shared/forms/submit-button.component'
import { useContactFormSubmission } from '@/hooks/useContactFormSubmission.hook'
import { siteConfig } from '@/lib/data/site-config'
import {
    type ConsultationFormInput,
    type ContactSource,
    consultationFormCompactSchema,
    consultationFormSchema,
    PREFERRED_CONTACT_TIME_OPTIONS,
    PROCEDURE_OPTIONS,
} from '@/lib/types/forms/contact-form.type'

/**
 * Props for the ConsultationForm component
 */
export type ConsultationFormProps = {
    /** Form title - displayed above the form */
    readonly title?: string
    /** Form subtitle - displayed below the title */
    readonly subtitle?: string
    /** Source identifier for analytics and API routing */
    readonly source: ContactSource
    /** Custom form name for analytics tracking */
    readonly analyticsFormName?: string
    /** Callback fired on successful form submission */
    readonly onSuccess?: () => void
    /** Enable analytics tracking for form events */
    readonly enableAnalytics?: boolean
    /** Additional class names for the form container */
    readonly className?: string
    /** Optional path to redirect to on successful submission (e.g., '/thank-you') */
    readonly redirectOnSuccess?: string
    /** Whether to show the preferred contact time field (default: true) */
    readonly showPreferredContactTime?: boolean
    /** Default procedure value for pre-populating the procedure dropdown */
    readonly defaultProcedure?: string
    /**
     * Mobile-first compact variant. When true:
     * - Hides Last Name, Email, and Preferred Contact Time fields
     * - Only First Name + Phone + Procedure (optional) + Consent are visible
     * - Uses the relaxed `consultationFormCompactSchema`
     * - Replaces the default submit copy unless `submitText` is set
     */
    readonly compact?: boolean
    /** Custom submit button label (overrides default) */
    readonly submitText?: string
    /** Custom privacy/footer note below the submit button */
    readonly footerNote?: string
    /**
     * When the compact variant is used and a `defaultProcedure` is set, the
     * form normally renders a small "Quote for: X" badge above the title.
     * Set to false when the parent layout already labels the procedure
     * (e.g. the editorial hero card) so we don't double up.
     */
    readonly showProcedureBadge?: boolean
}

/**
 * ConsultationForm - Reusable consultation request form
 *
 * A comprehensive lead capture form with all fields needed for
 * consultation requests. Designed for dark backgrounds.
 *
 * @example
 * ```tsx
 * <ConsultationForm
 *   title="Request Your Consultation"
 *   subtitle="Complimentary • Confidential • No Obligation"
 *   source={CONTACT_SOURCES.CONTACT_HERO}
 *   enableAnalytics
 * />
 * ```
 */
export function ConsultationForm({
    title = 'Request Your Consultation',
    subtitle = 'Complimentary • Confidential • No Obligation',
    source,
    analyticsFormName,
    onSuccess,
    enableAnalytics = false,
    className,
    redirectOnSuccess,
    showPreferredContactTime = true,
    defaultProcedure,
    compact = false,
    submitText,
    footerNote,
    showProcedureBadge = true,
}: ConsultationFormProps) {
    // Compact (paid-LP) variant pre-checks consent — visitors can still
    // uncheck the 1-line disclosure below the submit button. The legal
    // trail is preserved (consentGiven is part of the submission), but
    // the friction of an explicit unchecked checkbox above the submit
    // button is removed.
    const form = useForm<ConsultationFormInput>({
        resolver: zodResolver(
            compact ? consultationFormCompactSchema : consultationFormSchema
        ) as Resolver<ConsultationFormInput>,
        defaultValues: {
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            procedure: defaultProcedure ?? '',
            preferredContactTime: '',
            consentGiven: compact,
            _website: '',
        },
    })

    // When a procedure is pre-filled on the compact (landing) variant,
    // the select is redundant friction — surface the value as a small
    // badge above the form and skip the dropdown entirely. The parent
    // layout can suppress the visible badge via `showProcedureBadge` if
    // it already labels the procedure.
    const compactProcedureLabel =
        compact && defaultProcedure
            ? (PROCEDURE_OPTIONS.find((p) => p.value === defaultProcedure)
                  ?.label ?? null)
            : null
    const compactProcedureBadge = showProcedureBadge
        ? compactProcedureLabel
        : null

    const { submit, state, isSubmitting, isSuccess, isError } =
        useContactFormSubmission({
            source,
            enableAnalytics,
            analyticsFormName: analyticsFormName ?? source,
            redirectOnSuccess,
            onSuccess: () => {
                form.reset()
                onSuccess?.()
            },
        })

    const handleSubmit = async (data: ConsultationFormInput) => {
        // Find the procedure label for the subject line
        const procedureLabel = PROCEDURE_OPTIONS.find(
            (p) => p.value === data.procedure
        )?.label

        // Combine firstName and lastName for the name field (backward compatibility)
        const fullName = `${data.firstName} ${data.lastName}`.trim()

        await submit({
            ...data,
            name: fullName,
            subject: data.procedure
                ? `Consultation Request: ${procedureLabel || data.procedure}`
                : 'Consultation Request',
        })
    }

    return (
        <div className={className}>
            {compactProcedureBadge && (
                <div className='mb-4 flex justify-center'>
                    <span className='border-gold-500/20 bg-gold-500/10 text-gold-200 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-medium tracking-wide uppercase'>
                        <Stethoscope className='text-gold-300 h-3 w-3' />
                        Quote for: {compactProcedureBadge}
                    </span>
                </div>
            )}
            {/* Form Header */}
            {(title || subtitle) && (
                <div className='mb-8 text-center'>
                    {title && (
                        <h2 className='mb-2 font-serif text-2xl text-white md:text-3xl'>
                            {title}
                        </h2>
                    )}
                    {subtitle && <p className='text-stone-400'>{subtitle}</p>}
                </div>
            )}

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
                    <p className='text-stone-300'>{state.message}</p>
                </div>
            ) : (
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(handleSubmit)}
                        className='space-y-6'
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
                            <label htmlFor='_website'>Website</label>
                            <input
                                type='text'
                                id='_website'
                                tabIndex={-1}
                                autoComplete='off'
                                {...form.register('_website')}
                            />
                        </div>

                        {/* Name row — last name hidden in compact mode */}
                        {compact ? (
                            <FirstNameField
                                control={form.control}
                                name='firstName'
                                label='First Name'
                                placeholder='First name'
                                disabled={isSubmitting}
                                variant='dark'
                                required
                            />
                        ) : (
                            <div className='grid gap-6 md:grid-cols-2'>
                                <FirstNameField
                                    control={form.control}
                                    name='firstName'
                                    label='First Name'
                                    placeholder='First name'
                                    disabled={isSubmitting}
                                    variant='dark'
                                    required
                                />
                                <LastNameField
                                    control={form.control}
                                    name='lastName'
                                    label='Last Name'
                                    placeholder='Last name'
                                    disabled={isSubmitting}
                                    variant='dark'
                                    required
                                />
                            </div>
                        )}

                        {/* Phone always shown; email hidden in compact mode */}
                        {compact ? (
                            <PhoneField
                                control={form.control}
                                name='phone'
                                label='Phone Number'
                                placeholder='(555) 555-5555'
                                disabled={isSubmitting}
                                variant='dark'
                                required
                            />
                        ) : (
                            <div className='grid gap-6 md:grid-cols-2'>
                                <EmailField
                                    control={form.control}
                                    name='email'
                                    label='Email'
                                    placeholder='your@email.com'
                                    disabled={isSubmitting}
                                    variant='dark'
                                    required
                                />
                                <PhoneField
                                    control={form.control}
                                    name='phone'
                                    label='Phone Number'
                                    placeholder='(555) 555-5555'
                                    disabled={isSubmitting}
                                    variant='dark'
                                    required
                                />
                            </div>
                        )}

                        {/* Procedure Selector — hidden in compact mode
                            when a default is already supplied (the value
                            still ships with the submission via the
                            form's defaultValues). */}
                        {!compactProcedureLabel && (
                            <SelectField
                                control={form.control}
                                name='procedure'
                                label='Procedure of Interest'
                                disabled={isSubmitting}
                                variant='dark'
                                options={PROCEDURE_OPTIONS}
                            />
                        )}

                        {/* Preferred Contact Time - hidden in compact mode */}
                        {!compact && showPreferredContactTime && (
                            <SelectField
                                control={form.control}
                                name='preferredContactTime'
                                label='Preferred Time of Contact'
                                disabled={isSubmitting}
                                variant='dark'
                                options={PREFERRED_CONTACT_TIME_OPTIONS}
                            />
                        )}

                        {/* Consent Checkbox — full block in regular mode;
                            in compact mode it's rendered as a single-line
                            disclosure beneath the submit button below. */}
                        {!compact && (
                            <CheckboxField
                                control={form.control}
                                name='consentGiven'
                                disabled={isSubmitting}
                                variant='dark'
                                required
                            >
                                I have read and understood the{' '}
                                <Link
                                    href='/privacy'
                                    className='text-gold-400 hover:text-gold-300 underline'
                                >
                                    Privacy Policy
                                </Link>{' '}
                                and{' '}
                                <Link
                                    href='/terms'
                                    className='text-gold-400 hover:text-gold-300 underline'
                                >
                                    Terms
                                </Link>
                                . By submitting my mobile number and email, I
                                expressly consent to receive informational and
                                promotional messages from{' '}
                                {siteConfig.business.name} through SMS, email,
                                and phone calls. Msg & data rates may apply. Msg
                                frequency varies.
                            </CheckboxField>
                        )}

                        {/* Error feedback */}
                        {isError && (
                            <FormFeedback
                                status='error'
                                message={state.message}
                                variant='dark'
                            />
                        )}

                        {/* Submit Button */}
                        <div className={compact ? '' : 'pt-4'}>
                            <SubmitButton
                                isSubmitting={isSubmitting}
                                size='lg'
                                variant='gold'
                                fullWidth
                                showSendIcon
                                showSparkles
                            >
                                {submitText ??
                                    (compact
                                        ? 'Book My Consult'
                                        : 'Yes, I Want My Free Consultation')}
                            </SubmitButton>
                        </div>

                        {compact && (
                            <CheckboxField
                                control={form.control}
                                name='consentGiven'
                                disabled={isSubmitting}
                                variant='dark'
                                required
                                className='mt-1'
                            >
                                I agree to receive texts and emails about my
                                quote — no spam, opt out anytime. See our{' '}
                                <Link
                                    href='/privacy'
                                    className='text-gold-400 hover:text-gold-300 underline'
                                >
                                    Privacy Policy
                                </Link>{' '}
                                and{' '}
                                <Link
                                    href='/terms'
                                    className='text-gold-400 hover:text-gold-300 underline'
                                >
                                    Terms
                                </Link>
                                .
                            </CheckboxField>
                        )}

                        {/* Privacy Note */}
                        <p className='text-center text-xs text-stone-500'>
                            {footerNote ??
                                'Your information is private and secure. We respond within 24 hours.'}
                        </p>
                    </form>
                </Form>
            )}
        </div>
    )
}
