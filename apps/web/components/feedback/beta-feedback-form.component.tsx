/**
 * Beta Feedback Form Component
 *
 * Multi-step form for comprehensive website feedback during beta testing.
 * Contains 7 sections covering design, navigation, content, and technical issues.
 *
 * @module components/feedback/beta-feedback-form
 */
'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@workspace/ui/components/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@workspace/ui/components/dialog'
import { Form } from '@workspace/ui/components/form'
import { cn } from '@workspace/ui/lib/utils'
import { ArrowLeft, ArrowRight, Loader2, Send, X } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import {
    EmailField,
    MessageField,
    RadioGroupField,
    RatingField,
    YesNoField,
} from '@/components/shared/forms/form-fields.component'
import {
    betaFeedbackDefaultValues,
    type BetaFeedbackFormInput,
    betaFeedbackFormSchema,
    BROWSER_TYPE_OPTIONS,
    DEVICE_TYPE_OPTIONS,
    FEEDBACK_FORM_STEPS,
    FEEDBACK_STEP_INFO,
    NAVIGATION_EASE_OPTIONS,
    RATING_LABELS,
} from '@/lib/types/forms/beta-feedback.type'

import { FeedbackStepIndicator } from './feedback-step-indicator.component'

type BetaFeedbackFormProps = {
    readonly isOpen: boolean
    readonly onClose: () => void
}

export function BetaFeedbackForm({ isOpen, onClose }: BetaFeedbackFormProps) {
    const [currentStep, setCurrentStep] = useState(1)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)

    const form = useForm<BetaFeedbackFormInput>({
        resolver: zodResolver(betaFeedbackFormSchema),
        defaultValues: {
            ...betaFeedbackDefaultValues,
            userAgent: typeof window !== 'undefined' ? navigator.userAgent : '',
            pageUrl: typeof window !== 'undefined' ? window.location.href : '',
        },
        mode: 'onChange',
    })

    const { watch, trigger } = form

    // Watch conditional fields
    const deviceType = watch('deviceType')
    const browserType = watch('browserType')
    const hasBrokenLinks = watch('hasBrokenLinks')
    const hasTypos = watch('hasTypos')
    const hasTechnicalIssues = watch('hasTechnicalIssues')
    const wantsUxTesting = watch('wantsUxTesting')

    /**
     * Validate current step fields before proceeding
     */
    const validateCurrentStep = async (): Promise<boolean> => {
        const fieldsToValidate = getStepFields(currentStep)
        if (fieldsToValidate.length === 0) return true

        const result = await trigger(
            fieldsToValidate as (keyof BetaFeedbackFormInput)[]
        )
        return result
    }

    /**
     * Get fields to validate for each step
     */
    function getStepFields(step: number): string[] {
        switch (step) {
            case 1:
                return [] // Introduction - no validation
            case 2:
                return deviceType === 'other'
                    ? ['deviceType', 'deviceTypeOther', 'browserType']
                    : browserType === 'other'
                      ? ['deviceType', 'browserType', 'browserTypeOther']
                      : ['deviceType', 'browserType']
            case 3:
                return ['overallDesignRating', 'visualAestheticsRating']
            case 4:
                return hasBrokenLinks
                    ? [
                          'navigationEase',
                          'hasBrokenLinks',
                          'brokenLinksDescription',
                      ]
                    : ['navigationEase']
            case 5:
                return hasTypos
                    ? ['wordingClarityRating', 'hasTypos', 'typosDescription']
                    : ['wordingClarityRating']
            case 6:
                return hasTechnicalIssues
                    ? ['hasTechnicalIssues', 'technicalIssuesDescription']
                    : []
            case 7:
                return wantsUxTesting
                    ? ['overallSatisfactionRating', 'email']
                    : ['overallSatisfactionRating']
            default:
                return []
        }
    }

    const handleNext = async () => {
        const isValid = await validateCurrentStep()
        if (isValid && currentStep < FEEDBACK_FORM_STEPS) {
            setCurrentStep((prev) => prev + 1)
        }
    }

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep((prev) => prev - 1)
        }
    }

    const handleSubmit = async (data: BetaFeedbackFormInput) => {
        setIsSubmitting(true)
        try {
            const response = await fetch('/api/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            })

            if (response.ok) {
                setIsSuccess(true)
                setTimeout(() => {
                    onClose()
                    setIsSuccess(false)
                    setCurrentStep(1)
                    form.reset()
                }, 2000)
            } else {
                const error = await response.json()
                console.error('Feedback submission failed:', error)
            }
        } catch (error) {
            console.error('Feedback submission error:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleClose = () => {
        onClose()
        setCurrentStep(1)
        form.reset()
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className='max-h-[90vh] max-w-2xl overflow-y-auto'>
                <DialogHeader className='relative'>
                    <button
                        onClick={handleClose}
                        className='text-muted-foreground hover:text-foreground absolute top-0 right-0 transition-colors'
                        aria-label='Close feedback form'
                    >
                        <X className='h-5 w-5' />
                    </button>
                    <DialogTitle className='font-serif text-2xl'>
                        {FEEDBACK_STEP_INFO[currentStep - 1]?.icon}{' '}
                        {FEEDBACK_STEP_INFO[currentStep - 1]?.title}
                    </DialogTitle>
                </DialogHeader>

                {isSuccess ? (
                    <div className='py-12 text-center'>
                        <div className='bg-primary/10 text-primary mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full'>
                            <Send className='h-8 w-8' />
                        </div>
                        <h3 className='mb-2 text-xl font-semibold'>
                            Thank You!
                        </h3>
                        <p className='text-muted-foreground'>
                            Your feedback has been submitted successfully.
                        </p>
                    </div>
                ) : (
                    <>
                        <FeedbackStepIndicator
                            currentStep={currentStep}
                            totalSteps={FEEDBACK_FORM_STEPS}
                        />

                        <Form {...form}>
                            <form
                                onSubmit={form.handleSubmit(handleSubmit)}
                                className='space-y-6'
                            >
                                {/* Step 1: Introduction */}
                                {currentStep === 1 && (
                                    <div className='space-y-4'>
                                        <div className='bg-muted/50 rounded-lg p-6'>
                                            <h3 className='mb-3 text-lg font-semibold'>
                                                New Website Feedback (Beta
                                                Review)
                                            </h3>
                                            <p className='text-muted-foreground mb-4'>
                                                Thank you for helping us test
                                                the new version of our website.
                                            </p>
                                            <p className='text-muted-foreground mb-4'>
                                                This form will help us identify
                                                improvements in design, wording,
                                                content, navigation, and
                                                technical errors before the
                                                official release.
                                            </p>
                                            <p className='text-muted-foreground mb-4'>
                                                Your feedback is extremely
                                                valuable. Please be honest and
                                                specific.
                                            </p>
                                            <p className='text-muted-foreground text-sm'>
                                                ⏱️ This form takes 3–5 minutes.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Step 2: Basic Information */}
                                {currentStep === 2 && (
                                    <div className='space-y-6'>
                                        <RadioGroupField
                                            control={form.control}
                                            name='deviceType'
                                            label='How did you access the new website?'
                                            options={DEVICE_TYPE_OPTIONS}
                                            includeOther={false}
                                            required
                                        />
                                        {deviceType === 'other' && (
                                            <div className='pl-7'>
                                                <input
                                                    {...form.register(
                                                        'deviceTypeOther'
                                                    )}
                                                    placeholder='Please specify your device...'
                                                    className='border-border focus:border-primary w-full rounded-md border bg-transparent px-3 py-2 text-sm'
                                                />
                                            </div>
                                        )}

                                        <RadioGroupField
                                            control={form.control}
                                            name='browserType'
                                            label='What browser did you use?'
                                            options={BROWSER_TYPE_OPTIONS}
                                            includeOther={false}
                                            required
                                        />
                                        {browserType === 'other' && (
                                            <div className='pl-7'>
                                                <input
                                                    {...form.register(
                                                        'browserTypeOther'
                                                    )}
                                                    placeholder='Please specify your browser...'
                                                    className='border-border focus:border-primary w-full rounded-md border bg-transparent px-3 py-2 text-sm'
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Step 3: Design & Aesthetic Feedback */}
                                {currentStep === 3 && (
                                    <div className='space-y-6'>
                                        <RatingField
                                            control={form.control}
                                            name='overallDesignRating'
                                            label='How would you rate the overall design?'
                                            ratingLabels={RATING_LABELS}
                                            required
                                        />

                                        <RatingField
                                            control={form.control}
                                            name='visualAestheticsRating'
                                            label='How would you rate the visual aesthetics (colors, spacing, images, layout)?'
                                            ratingLabels={RATING_LABELS}
                                            required
                                        />

                                        <MessageField
                                            control={form.control}
                                            name='designLikes'
                                            label='What do you LIKE the most about the new design?'
                                            placeholder='Share what stands out positively...'
                                            rows={3}
                                        />

                                        <MessageField
                                            control={form.control}
                                            name='designDislikes'
                                            label='What do you DISLIKE or feel could be improved visually?'
                                            placeholder="Share any visual improvements you'd suggest..."
                                            rows={3}
                                        />
                                    </div>
                                )}

                                {/* Step 4: Navigation & Usability */}
                                {currentStep === 4 && (
                                    <div className='space-y-6'>
                                        <RadioGroupField
                                            control={form.control}
                                            name='navigationEase'
                                            label='Was it easy to find the information you were looking for?'
                                            options={NAVIGATION_EASE_OPTIONS}
                                            required
                                        />

                                        <YesNoField
                                            control={form.control}
                                            name='hasBrokenLinks'
                                            label='Did you encounter any broken links, missing sections, or confusing navigation?'
                                            yesLabel='Yes, I found issues'
                                            noLabel='No issues'
                                        />

                                        {hasBrokenLinks && (
                                            <MessageField
                                                control={form.control}
                                                name='brokenLinksDescription'
                                                label='Please describe the issue and the page where it happened'
                                                placeholder='Include the page URL and describe what you encountered...'
                                                rows={3}
                                                required
                                            />
                                        )}
                                    </div>
                                )}

                                {/* Step 5: Content & Wording Quality */}
                                {currentStep === 5 && (
                                    <div className='space-y-6'>
                                        <RatingField
                                            control={form.control}
                                            name='wordingClarityRating'
                                            label='How clear and easy to understand is the wording throughout the site?'
                                            ratingLabels={RATING_LABELS}
                                            required
                                        />

                                        <YesNoField
                                            control={form.control}
                                            name='hasTypos'
                                            label='Did you notice any typos, grammar issues, outdated info, or unclear text?'
                                            yesLabel='Yes, I found issues'
                                            noLabel='No issues'
                                        />

                                        {hasTypos && (
                                            <MessageField
                                                control={form.control}
                                                name='typosDescription'
                                                label='Where? Please include page and the sentence/area if possible'
                                                placeholder='Describe where you found the issue...'
                                                rows={3}
                                                required
                                            />
                                        )}
                                    </div>
                                )}

                                {/* Step 6: Performance & Technical Issues */}
                                {currentStep === 6 && (
                                    <div className='space-y-6'>
                                        <div className='bg-muted/50 rounded-lg p-4'>
                                            <p className='text-muted-foreground text-sm'>
                                                Technical issues include: slow
                                                loading, animations breaking,
                                                buttons not working, images not
                                                loading, etc.
                                            </p>
                                        </div>

                                        <YesNoField
                                            control={form.control}
                                            name='hasTechnicalIssues'
                                            label='Did you experience any technical problems?'
                                            yesLabel='Yes, bug found'
                                            noLabel='No issues'
                                        />

                                        {hasTechnicalIssues && (
                                            <MessageField
                                                control={form.control}
                                                name='technicalIssuesDescription'
                                                label='Please describe the bug'
                                                placeholder='Include details like: Page URL, Device, Browser, Steps to reproduce...'
                                                rows={4}
                                                required
                                            />
                                        )}
                                    </div>
                                )}

                                {/* Step 7: Overall Impression */}
                                {currentStep === 7 && (
                                    <div className='space-y-6'>
                                        <RatingField
                                            control={form.control}
                                            name='overallSatisfactionRating'
                                            label='Overall, how satisfied are you with the new website?'
                                            ratingLabels={RATING_LABELS}
                                            required
                                        />

                                        <MessageField
                                            control={form.control}
                                            name='recommendations'
                                            label='Would you recommend any features or improvements before we launch?'
                                            placeholder='Share your suggestions...'
                                            rows={3}
                                        />

                                        <YesNoField
                                            control={form.control}
                                            name='wantsUxTesting'
                                            label='Would you like to be part of future UX testing?'
                                        />

                                        {wantsUxTesting && (
                                            <EmailField
                                                control={form.control}
                                                name='email'
                                                label='Your email address'
                                                placeholder='your@email.com'
                                                required
                                            />
                                        )}
                                    </div>
                                )}

                                {/* Navigation buttons */}
                                <div className='flex items-center justify-between gap-4 border-t pt-6'>
                                    <Button
                                        type='button'
                                        variant='outline'
                                        onClick={handleBack}
                                        disabled={currentStep === 1}
                                        className={cn(
                                            currentStep === 1 && 'invisible'
                                        )}
                                    >
                                        <ArrowLeft className='mr-2 h-4 w-4' />
                                        Back
                                    </Button>

                                    {currentStep < FEEDBACK_FORM_STEPS ? (
                                        <Button
                                            type='button'
                                            onClick={handleNext}
                                        >
                                            {currentStep === 1
                                                ? 'Start'
                                                : 'Next'}
                                            <ArrowRight className='ml-2 h-4 w-4' />
                                        </Button>
                                    ) : (
                                        <Button
                                            type='submit'
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                                    Submitting...
                                                </>
                                            ) : (
                                                <>
                                                    <Send className='mr-2 h-4 w-4' />
                                                    Submit Feedback
                                                </>
                                            )}
                                        </Button>
                                    )}
                                </div>
                            </form>
                        </Form>
                    </>
                )}
            </DialogContent>
        </Dialog>
    )
}
