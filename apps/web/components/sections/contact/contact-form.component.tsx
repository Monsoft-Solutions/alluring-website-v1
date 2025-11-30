/**
 * ContactForm Component
 *
 * A comprehensive contact form with client-side validation using react-hook-form
 * and zod schema validation. Handles form submission, loading states, and displays
 * success/error messages with enhanced visual design and micro-interactions.
 *
 * @example
 * ```tsx
 * <ContactForm
 *   badge="Send a Message"
 *   headline="Get In Touch"
 *   description="Fill out the form below..."
 * />
 * ```
 */
'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Form } from '@workspace/ui/components/form'
import { cn } from '@workspace/ui/lib/utils'
import { useForm } from 'react-hook-form'

import { ContentWrapper } from '@/components/shared/content-wrapper.component'
import { SectionContainer } from '@/components/shared/section-container.component'
import { SectionHeader } from '@/components/shared/section-header.component'
import {
    EmailField,
    FormFeedback,
    MessageField,
    NameField,
    PhoneField,
    SubjectField,
    SubmitButton,
} from '@/components/shared/forms'
import { useContactFormSubmission } from '@/hooks/useContactFormSubmission.hook'
import {
    CONTACT_SOURCES,
    type ContactFormInput,
    contactFormSchema,
} from '@/lib/types/forms/contact-form.type'
import type { ContactFormSectionProps } from '@/lib/types/sections/contact-form-section.type'

export function ContactForm({
    badge,
    headline,
    description,
    className,
    id,
}: ContactFormSectionProps) {
    // Initialize react-hook-form with zod validation
    const form = useForm<ContactFormInput>({
        resolver: zodResolver(contactFormSchema),
        defaultValues: {
            name: '',
            email: '',
            phone: '',
            subject: '',
            message: '',
        },
    })

    const { submit, state, isSubmitting, isSuccess, isError } =
        useContactFormSubmission({
            source: CONTACT_SOURCES.CONTACT_PAGE,
            enableAnalytics: true,
            analyticsFormName: 'contact_form',
            onSuccess: () => form.reset(),
        })

    /**
     * Handle form submission
     */
    const onSubmit = async (data: ContactFormInput) => {
        await submit(data)
    }

    return (
        <SectionContainer
            variant='muted'
            id={id}
            className={cn('relative py-16 md:py-24', className)}
        >
            {/* Subtle background pattern */}
            <div className='from-primary/[0.02] to-secondary/[0.02] pointer-events-none absolute inset-0 bg-linear-to-br via-transparent' />
            <div className='pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.05),transparent_50%)]' />

            <ContentWrapper size='md' className='relative'>
                {/* Section Header */}
                {(badge || headline || description) && (
                    <SectionHeader
                        badge={badge}
                        title={headline || ''}
                        description={description}
                        className='mb-16 text-center'
                    />
                )}

                {/* Contact Form */}
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className='group bg-card/80 border-border/50 mx-auto max-w-2xl space-y-8 rounded-2xl border p-8 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl md:p-10'
                    >
                        {/* Form Fields Grid */}
                        <div className='space-y-8'>
                            {/* Name and Email Row */}
                            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                                <NameField
                                    control={form.control}
                                    name='name'
                                    label='Name'
                                    placeholder='John Doe'
                                    disabled={isSubmitting}
                                    variant='light'
                                    required
                                />
                                <EmailField
                                    control={form.control}
                                    name='email'
                                    label='Email'
                                    placeholder='your.email@example.com'
                                    disabled={isSubmitting}
                                    variant='light'
                                    required
                                />
                            </div>

                            {/* Phone and Subject Row */}
                            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                                <PhoneField
                                    control={form.control}
                                    name='phone'
                                    label='Phone'
                                    placeholder='+1 (555) 123-4567'
                                    disabled={isSubmitting}
                                    variant='light'
                                />
                                <SubjectField
                                    control={form.control}
                                    name='subject'
                                    label='Subject'
                                    placeholder='Project inquiry'
                                    disabled={isSubmitting}
                                    variant='light'
                                />
                            </div>

                            {/* Message Field */}
                            <MessageField
                                control={form.control}
                                name='message'
                                label='Message'
                                placeholder='Describe your project or question...'
                                disabled={isSubmitting}
                                variant='light'
                                rows={5}
                            />
                        </div>

                        {/* Submission State Messages */}
                        {isSuccess && (
                            <FormFeedback
                                status='success'
                                title='Success!'
                                message={state.message}
                                variant='light'
                            />
                        )}

                        {isError && (
                            <FormFeedback
                                status='error'
                                title='Error'
                                message={state.message}
                                variant='light'
                            />
                        )}

                        {/* Submit Button */}
                        <div className='pt-4'>
                            <SubmitButton
                                isSubmitting={isSubmitting}
                                loadingText='Sending...'
                                size='lg'
                                fullWidth
                                showSendIcon
                                showSparkles
                                className='from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 h-14 bg-linear-to-r text-base font-semibold shadow-lg transition-all duration-300 hover:shadow-xl'
                                aria-label={
                                    isSubmitting
                                        ? 'Sending message...'
                                        : 'Send message'
                                }
                            >
                                Send Message
                            </SubmitButton>
                        </div>
                    </form>
                </Form>
            </ContentWrapper>
        </SectionContainer>
    )
}
