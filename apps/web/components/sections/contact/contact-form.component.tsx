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
import { Button } from '@workspace/ui/components/button'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@workspace/ui/components/form'
import { Input } from '@workspace/ui/components/input'
import { Textarea } from '@workspace/ui/components/textarea'
import { cn } from '@workspace/ui/lib/utils'
import {
    AlertCircle,
    CheckCircle2,
    Loader2,
    Send,
    Sparkles,
} from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { ContentWrapper } from '@/components/shared/content-wrapper.component'
import { SectionContainer } from '@/components/shared/section-container.component'
import { SectionHeader } from '@/components/shared/section-header.component'
import { useAnalyticsEvent } from '@/lib/analytics/useAnalyticsEvent.hook'
import {
    type ContactFormData,
    type ContactFormResponse,
    contactFormSchema,
} from '@/lib/types/forms/contact-form.type'
import type { ContactFormSectionProps } from '@/lib/types/sections/contact-form-section.type'

/**
 * Form submission state
 */
type SubmissionState = {
    status: 'idle' | 'success' | 'error'
    message: string
}

export function ContactForm({
    badge,
    headline,
    description,
    className,
    id,
}: ContactFormSectionProps) {
    const [submissionState, setSubmissionState] = useState<SubmissionState>({
        status: 'idle',
        message: '',
    })

    // Initialize analytics event tracking
    const { trackFormSubmit, track } = useAnalyticsEvent()

    // Initialize react-hook-form with zod validation
    const form = useForm<ContactFormData>({
        resolver: zodResolver(contactFormSchema),
        defaultValues: {
            name: '',
            email: '',
            phone: '',
            subject: '',
            message: '',
        },
    })

    /**
     * Handle form submission
     */
    const onSubmit = async (data: ContactFormData) => {
        try {
            // Reset submission state
            setSubmissionState({ status: 'idle', message: '' })

            // Track form submission start
            track('form_start', {
                form_name: 'contact_form',
                has_phone: !!data.phone,
            })

            // Submit to API endpoint
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            })

            const result: ContactFormResponse = await response.json()

            if (response.ok && result.success) {
                // Success - reset form and show success message
                setSubmissionState({
                    status: 'success',
                    message:
                        result.message ||
                        'Message sent. We respond within 24 hours.',
                })

                // Track successful form submission
                trackFormSubmit('contact_form', {
                    status: 'success',
                    has_phone: !!data.phone,
                })

                form.reset()
            } else {
                // API returned error
                setSubmissionState({
                    status: 'error',
                    message:
                        result.error ||
                        result.message ||
                        'Failed to send. Try again.',
                })

                // Track form submission error
                track('form_error', {
                    form_name: 'contact_form',
                    error_type: 'api_error',
                    error_message: result.error || 'unknown_error',
                })
            }
        } catch (error) {
            // Network or other error
            console.error('Contact form submission error:', error)
            setSubmissionState({
                status: 'error',
                message: 'Network error. Check your connection and try again.',
            })

            // Track network error
            track('form_error', {
                form_name: 'contact_form',
                error_type: 'network_error',
            })
        }
    }

    const isSubmitting = form.formState.isSubmitting

    return (
        <SectionContainer
            variant='muted'
            id={id}
            className={cn('relative py-16 md:py-24', className)}
        >
            {/* Subtle background pattern */}
            <div className='from-primary/[0.02] to-secondary/[0.02] pointer-events-none absolute inset-0 bg-gradient-to-br via-transparent' />
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
                                {/* Name Field */}
                                <FormField
                                    control={form.control}
                                    name='name'
                                    render={({ field }) => (
                                        <FormItem className='space-y-3'>
                                            <FormLabel className='text-foreground/90 flex items-center gap-2 text-sm font-semibold'>
                                                Name
                                                <span className='text-destructive text-xs'>
                                                    *
                                                </span>
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder='John Doe'
                                                    {...field}
                                                    disabled={isSubmitting}
                                                    aria-label='Your name'
                                                    className='border-border/60 focus:border-primary/60 focus:ring-primary/20 hover:border-border/80 h-12 transition-all duration-200'
                                                />
                                            </FormControl>
                                            <FormMessage className='text-xs' />
                                        </FormItem>
                                    )}
                                />

                                {/* Email Field */}
                                <FormField
                                    control={form.control}
                                    name='email'
                                    render={({ field }) => (
                                        <FormItem className='space-y-3'>
                                            <FormLabel className='text-foreground/90 flex items-center gap-2 text-sm font-semibold'>
                                                Email
                                                <span className='text-destructive text-xs'>
                                                    *
                                                </span>
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type='email'
                                                    placeholder='your.email@example.com'
                                                    {...field}
                                                    disabled={isSubmitting}
                                                    aria-label='Your email address'
                                                    className='border-border/60 focus:border-primary/60 focus:ring-primary/20 hover:border-border/80 h-12 transition-all duration-200'
                                                />
                                            </FormControl>
                                            <FormMessage className='text-xs' />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Phone and Subject Row */}
                            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                                {/* Phone Field (Optional) */}
                                <FormField
                                    control={form.control}
                                    name='phone'
                                    render={({ field }) => (
                                        <FormItem className='space-y-3'>
                                            <FormLabel className='text-foreground/90 flex items-center gap-2 text-sm font-semibold'>
                                                Phone
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type='tel'
                                                    placeholder='+1 (555) 123-4567'
                                                    {...field}
                                                    disabled={isSubmitting}
                                                    aria-label='Your phone number'
                                                    className='border-border/60 focus:border-primary/60 focus:ring-primary/20 hover:border-border/80 h-12 transition-all duration-200'
                                                />
                                            </FormControl>
                                            <FormMessage className='text-xs' />
                                        </FormItem>
                                    )}
                                />

                                {/* Subject Field */}
                                <FormField
                                    control={form.control}
                                    name='subject'
                                    render={({ field }) => (
                                        <FormItem className='space-y-3'>
                                            <FormLabel className='text-foreground/90 flex items-center gap-2 text-sm font-semibold'>
                                                Subject
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder='Project inquiry'
                                                    {...field}
                                                    disabled={isSubmitting}
                                                    aria-label='Message subject'
                                                    className='border-border/60 focus:border-primary/60 focus:ring-primary/20 hover:border-border/80 h-12 transition-all duration-200'
                                                />
                                            </FormControl>
                                            <FormMessage className='text-xs' />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Message Field */}
                            <FormField
                                control={form.control}
                                name='message'
                                render={({ field }) => (
                                    <FormItem className='space-y-3'>
                                        <FormLabel className='text-foreground/90 flex items-center gap-2 text-sm font-semibold'>
                                            Message
                                        </FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder='Describe your project or question...'
                                                className='border-border/60 focus:border-primary/60 focus:ring-primary/20 hover:border-border/80 min-h-[150px] resize-none transition-all duration-200'
                                                {...field}
                                                disabled={isSubmitting}
                                                aria-label='Your message'
                                            />
                                        </FormControl>
                                        <FormMessage className='text-xs' />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Submission State Messages */}
                        {submissionState.status === 'success' && (
                            <div
                                className='animate-in slide-in-from-bottom-2 flex items-start gap-4 rounded-xl border border-green-200/60 bg-gradient-to-r from-green-50 to-emerald-50 p-6 text-green-700 shadow-sm duration-300'
                                role='alert'
                                aria-live='polite'
                            >
                                <div className='rounded-full bg-green-100 p-2'>
                                    <CheckCircle2 className='size-5 flex-shrink-0' />
                                </div>
                                <div className='space-y-1'>
                                    <h4 className='text-sm font-semibold'>
                                        Success!
                                    </h4>
                                    <p className='text-sm leading-relaxed'>
                                        {submissionState.message}
                                    </p>
                                </div>
                            </div>
                        )}

                        {submissionState.status === 'error' && (
                            <div
                                className='animate-in slide-in-from-bottom-2 flex items-start gap-4 rounded-xl border border-red-200/60 bg-gradient-to-r from-red-50 to-rose-50 p-6 text-red-700 shadow-sm duration-300'
                                role='alert'
                                aria-live='assertive'
                            >
                                <div className='rounded-full bg-red-100 p-2'>
                                    <AlertCircle className='size-5 flex-shrink-0' />
                                </div>
                                <div className='space-y-1'>
                                    <h4 className='text-sm font-semibold'>
                                        Error
                                    </h4>
                                    <p className='text-sm leading-relaxed'>
                                        {submissionState.message}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Submit Button */}
                        <div className='pt-4'>
                            <Button
                                type='submit'
                                size='lg'
                                disabled={isSubmitting}
                                className='from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 group relative h-14 w-full overflow-hidden bg-gradient-to-r text-base font-semibold shadow-lg transition-all duration-300 hover:shadow-xl'
                                aria-label={
                                    isSubmitting
                                        ? 'Sending message...'
                                        : 'Send message'
                                }
                            >
                                {/* Button background animation */}
                                <div className='from-primary/20 absolute inset-0 bg-gradient-to-r to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100' />

                                {isSubmitting ? (
                                    <>
                                        <Loader2 className='mr-3 size-5 animate-spin' />
                                        <span>Sending...</span>
                                    </>
                                ) : (
                                    <>
                                        <Send className='mr-3 size-5 transition-transform duration-200 group-hover:translate-x-0.5' />
                                        <span>Send Message</span>
                                        <Sparkles className='ml-3 size-4 opacity-60 transition-opacity duration-200 group-hover:opacity-100' />
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </Form>
            </ContentWrapper>
        </SectionContainer>
    )
}
