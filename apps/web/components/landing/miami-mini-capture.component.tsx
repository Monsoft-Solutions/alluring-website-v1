/**
 * MiamiMiniCapture Component
 *
 * A Miami-focused mid-page lead capture form emphasizing:
 * - Local convenience
 * - Spanish language support
 * - Neighborhood familiarity
 *
 * Uses the shared leadCaptureSchema for validation.
 */
'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@workspace/ui/components/button'
import { Form } from '@workspace/ui/components/form'
import {
    CheckCircle2,
    Languages,
    Loader2,
    MapPin,
    Sparkles,
} from 'lucide-react'
import { useForm } from 'react-hook-form'

import { FormFeedback } from '@/components/shared/forms/form-feedback.component'
import {
    NameField,
    PhoneField,
} from '@/components/shared/forms/form-fields.component'
import { SectionContainer } from '@/components/shared/section-container.component'
import { ContentWrapper } from '@/components/shared/content-wrapper.component'
import { useContactFormSubmission } from '@/hooks/useContactFormSubmission.hook'
import {
    CONTACT_SOURCES,
    type LeadCaptureInput,
    leadCaptureSchema,
} from '@/lib/types/forms/contact-form.type'

export type MiamiMiniCaptureProps = {
    readonly id?: string
}

export function MiamiMiniCapture({
    id = 'miami-capture',
}: MiamiMiniCaptureProps) {
    const form = useForm<LeadCaptureInput>({
        resolver: zodResolver(leadCaptureSchema),
        defaultValues: {
            name: '',
            phone: '',
        },
    })

    const { submit, state, isSubmitting, isSuccess, isError } =
        useContactFormSubmission({
            source: CONTACT_SOURCES.LANDING_PAGE,
            enableAnalytics: true,
            analyticsFormName: 'miami_mini_capture',
            redirectOnSuccess: '/thank-you',
            onSuccess: () => {
                form.reset()
            },
        })

    const handleSubmit = async (data: LeadCaptureInput) => {
        await submit(data)
    }

    return (
        <SectionContainer
            id={id}
            variant='default'
            className='relative overflow-hidden bg-stone-900'
            paddingY='py-20 lg:py-24'
        >
            {/* Background Accents */}
            <div className='pointer-events-none absolute inset-0'>
                <div className='bg-gold-600/10 absolute -top-[20%] left-[10%] h-[500px] w-[500px] rounded-full blur-3xl' />
                <div className='bg-gold-500/5 absolute right-[5%] bottom-[10%] h-[400px] w-[400px] rounded-full blur-3xl' />
            </div>

            <ContentWrapper
                size='lg'
                paddingX='px-6 md:px-12'
                className='relative z-10'
            >
                <div className='grid items-center gap-12 lg:grid-cols-2 lg:gap-16'>
                    {/* Left Column - Miami-Focused Copy */}
                    <div className='text-center lg:text-left'>
                        <div className='mb-4 inline-flex items-center gap-2'>
                            <div className='bg-gold-500/10 rounded-full p-1.5'>
                                <Sparkles className='text-gold-400 h-4 w-4' />
                            </div>
                            <span className='text-gold-400 text-sm font-bold tracking-[0.2em] uppercase'>
                                Your Miami Neighbors
                            </span>
                        </div>

                        <h2 className='mb-4 font-serif text-3xl leading-tight text-white md:text-4xl'>
                            We&apos;re Right Here in{' '}
                            <span className='text-gold-400 italic'>
                                Your Community
                            </span>
                        </h2>

                        <p className='mb-6 text-lg leading-relaxed text-stone-300'>
                            No need to travel for world-class results. Our Coral
                            Gables office is just minutes away. Leave your
                            number and we&apos;ll help you schedule at a time
                            that works for your busy Miami life.
                        </p>

                        {/* Trust Points */}
                        <div className='flex flex-wrap justify-center gap-4 lg:justify-start'>
                            <div className='flex items-center gap-2 text-stone-400'>
                                <MapPin className='text-gold-400 h-4 w-4' />
                                <span className='text-sm'>
                                    Coral Gables Location
                                </span>
                            </div>
                            <div className='flex items-center gap-2 text-stone-400'>
                                <Languages className='text-gold-400 h-4 w-4' />
                                <span className='text-sm'>
                                    Hablamos Español
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Form */}
                    <div className='mx-auto w-full max-w-md'>
                        <div className='rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm md:p-8'>
                            {isSuccess ? (
                                <div className='flex flex-col items-center gap-4 text-center'>
                                    <div className='flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20'>
                                        <CheckCircle2 className='h-8 w-8 text-green-400' />
                                    </div>
                                    <h3 className='text-xl font-semibold text-white'>
                                        We&apos;ll Be in Touch!
                                    </h3>
                                    <p className='text-stone-300'>
                                        {state.message}
                                    </p>
                                </div>
                            ) : (
                                <Form {...form}>
                                    <form
                                        onSubmit={form.handleSubmit(
                                            handleSubmit
                                        )}
                                        className='space-y-4'
                                    >
                                        {/* Honeypot field - hidden from real users, bots will fill it */}
                                        <div
                                            aria-hidden='true'
                                            style={{
                                                position: 'absolute',
                                                left: '-9999px',
                                                opacity: 0,
                                                height: 0,
                                                overflow: 'hidden',
                                            }}
                                        >
                                            <label htmlFor='_website_miami'>
                                                Website
                                            </label>
                                            <input
                                                type='text'
                                                id='_website_miami'
                                                name='_website'
                                                tabIndex={-1}
                                                autoComplete='off'
                                            />
                                        </div>

                                        <NameField
                                            control={form.control}
                                            name='name'
                                            label=''
                                            placeholder='Your Name (Optional)'
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
                                                    Sending...
                                                </>
                                            ) : (
                                                'Schedule My Visit'
                                            )}
                                        </Button>
                                    </form>
                                </Form>
                            )}

                            <p className='mt-4 text-center text-xs text-stone-500'>
                                Your information stays local. We&apos;ll never
                                spam you.
                            </p>
                        </div>
                    </div>
                </div>
            </ContentWrapper>
        </SectionContainer>
    )
}
