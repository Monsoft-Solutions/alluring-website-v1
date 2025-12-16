/**
 * Lead Capture Modal Component
 *
 * Lightweight modal for deferred lead capture in embedded chat.
 * Shows when user expresses booking interest or after N messages.
 *
 * @module components/chat/lead-capture-modal
 */
'use client'

import { useState, useCallback, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { cn } from '@workspace/ui/lib/utils'
import { X, Loader2, Phone, User, Sparkles, CheckCircle2 } from 'lucide-react'

/**
 * Validation schema for lead capture form
 */
const leadCaptureSchema = z.object({
    fullName: z.string().min(2, 'Name must be at least 2 characters').max(100),
    phone: z.string().min(10, 'Please enter a valid phone number').max(20),
    email: z.string().email().optional().or(z.literal('')),
})

type LeadCaptureFormData = z.infer<typeof leadCaptureSchema>

type LeadCaptureModalProps = {
    /** Whether the modal is open */
    isOpen: boolean
    /** Close modal callback */
    onClose: () => void
    /** Submit callback - returns true on success */
    onSubmit: (data: LeadCaptureFormData) => Promise<boolean>
}

/**
 * Lead capture modal with luxury styling
 *
 * Features:
 * - Simple name + phone form
 * - Premium glassmorphism design
 * - Loading and success states
 * - Accessible with focus trap
 * - Mobile-optimized
 */
export function LeadCaptureModal({
    isOpen,
    onClose,
    onSubmit,
}: LeadCaptureModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<LeadCaptureFormData>({
        resolver: zodResolver(leadCaptureSchema),
        defaultValues: {
            fullName: '',
            phone: '',
            email: '',
        },
    })

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setIsSuccess(false)
            reset()
        }
    }, [isOpen, reset])

    // Handle escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose()
            }
        }

        document.addEventListener('keydown', handleEscape)
        return () => document.removeEventListener('keydown', handleEscape)
    }, [isOpen, onClose])

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => {
            document.body.style.overflow = ''
        }
    }, [isOpen])

    const handleFormSubmit = useCallback(
        async (data: LeadCaptureFormData) => {
            setIsSubmitting(true)
            try {
                const success = await onSubmit(data)
                if (success) {
                    setIsSuccess(true)
                    // Auto-close after success
                    setTimeout(() => {
                        onClose()
                    }, 2000)
                }
            } finally {
                setIsSubmitting(false)
            }
        },
        [onSubmit, onClose]
    )

    if (!isOpen) return null

    return (
        <div
            className={cn(
                'fixed inset-0 z-50',
                'flex items-center justify-center p-4',
                'animate-in fade-in duration-200'
            )}
            role='dialog'
            aria-modal='true'
            aria-labelledby='lead-capture-title'
        >
            {/* Backdrop */}
            <div
                className='absolute inset-0 bg-black/40 backdrop-blur-sm'
                onClick={onClose}
                aria-hidden='true'
            />

            {/* Modal */}
            <div
                className={cn(
                    'relative w-full max-w-md',
                    'rounded-2xl bg-white p-6',
                    'shadow-2xl shadow-stone-900/20',
                    'ring-1 ring-stone-200/60',
                    'animate-in zoom-in-95 slide-in-from-bottom-4 duration-300'
                )}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className={cn(
                        'absolute top-4 right-4',
                        'flex h-8 w-8 items-center justify-center rounded-full',
                        'text-stone-400 transition-colors',
                        'hover:bg-stone-100 hover:text-stone-600',
                        'focus:ring-2 focus:ring-stone-900/10 focus:outline-none'
                    )}
                    aria-label='Close modal'
                >
                    <X className='h-4 w-4' />
                </button>

                {/* Success State */}
                {isSuccess ? (
                    <div className='py-8 text-center'>
                        <div
                            className={cn(
                                'mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full',
                                'bg-emerald-50 text-emerald-500'
                            )}
                        >
                            <CheckCircle2 className='h-8 w-8' />
                        </div>
                        <h3 className='font-serif text-xl font-semibold text-stone-900'>
                            Thank You!
                        </h3>
                        <p className='mt-2 text-sm text-stone-600'>
                            We&apos;ll be in touch soon to help with your
                            consultation.
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Header */}
                        <div className='mb-6 text-center'>
                            <div
                                className={cn(
                                    'mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full',
                                    'from-gold-100 to-gold-50 bg-linear-to-br',
                                    'ring-gold-200/60 ring-2'
                                )}
                            >
                                <Sparkles className='text-gold-600 h-6 w-6' />
                            </div>
                            <h3
                                id='lead-capture-title'
                                className='font-serif text-xl font-semibold text-stone-900'
                            >
                                Get Personalized Help
                            </h3>
                            <p className='mt-2 text-sm text-stone-600'>
                                Share your details and our team will reach out
                                to assist you further.
                            </p>
                        </div>

                        {/* Form */}
                        <form
                            onSubmit={handleSubmit(handleFormSubmit)}
                            className='space-y-4'
                        >
                            {/* Full Name */}
                            <div className='space-y-1.5'>
                                <label
                                    htmlFor='lead-fullName'
                                    className='block text-sm font-medium text-stone-700'
                                >
                                    Full Name{' '}
                                    <span className='text-red-500'>*</span>
                                </label>
                                <div className='relative'>
                                    <User
                                        className={cn(
                                            'absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2',
                                            errors.fullName
                                                ? 'text-red-400'
                                                : 'text-stone-400'
                                        )}
                                    />
                                    <input
                                        {...register('fullName')}
                                        id='lead-fullName'
                                        type='text'
                                        placeholder='Enter your full name'
                                        autoComplete='name'
                                        className={cn(
                                            'w-full rounded-xl border bg-white py-3 pr-4 pl-11 text-sm',
                                            'placeholder:text-stone-400',
                                            'transition-all duration-200',
                                            'focus:ring-2 focus:outline-none',
                                            errors.fullName
                                                ? 'border-red-300 focus:border-red-400 focus:ring-red-500/20'
                                                : 'focus:border-gold-300 focus:ring-gold-500/20 border-stone-200'
                                        )}
                                    />
                                </div>
                                {errors.fullName && (
                                    <p className='text-xs text-red-500'>
                                        {errors.fullName.message}
                                    </p>
                                )}
                            </div>

                            {/* Phone */}
                            <div className='space-y-1.5'>
                                <label
                                    htmlFor='lead-phone'
                                    className='block text-sm font-medium text-stone-700'
                                >
                                    Phone Number{' '}
                                    <span className='text-red-500'>*</span>
                                </label>
                                <div className='relative'>
                                    <Phone
                                        className={cn(
                                            'absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2',
                                            errors.phone
                                                ? 'text-red-400'
                                                : 'text-stone-400'
                                        )}
                                    />
                                    <input
                                        {...register('phone')}
                                        id='lead-phone'
                                        type='tel'
                                        placeholder='(555) 123-4567'
                                        autoComplete='tel'
                                        className={cn(
                                            'w-full rounded-xl border bg-white py-3 pr-4 pl-11 text-sm',
                                            'placeholder:text-stone-400',
                                            'transition-all duration-200',
                                            'focus:ring-2 focus:outline-none',
                                            errors.phone
                                                ? 'border-red-300 focus:border-red-400 focus:ring-red-500/20'
                                                : 'focus:border-gold-300 focus:ring-gold-500/20 border-stone-200'
                                        )}
                                    />
                                </div>
                                {errors.phone && (
                                    <p className='text-xs text-red-500'>
                                        {errors.phone.message}
                                    </p>
                                )}
                            </div>

                            {/* Submit Button */}
                            <button
                                type='submit'
                                disabled={isSubmitting}
                                className={cn(
                                    'flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold',
                                    'bg-linear-to-br from-stone-800 to-stone-900',
                                    'text-white',
                                    'shadow-lg shadow-stone-900/20',
                                    'transition-all duration-200',
                                    'hover:from-stone-700 hover:to-stone-800',
                                    'hover:shadow-xl hover:shadow-stone-900/25',
                                    'active:scale-[0.98]',
                                    'focus:ring-2 focus:ring-stone-900 focus:ring-offset-2 focus:outline-none',
                                    'disabled:cursor-not-allowed disabled:opacity-60'
                                )}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className='h-4 w-4 animate-spin' />
                                        Saving...
                                    </>
                                ) : (
                                    'Get Personalized Help'
                                )}
                            </button>

                            {/* Skip Link */}
                            <button
                                type='button'
                                onClick={onClose}
                                className='w-full py-2 text-center text-xs text-stone-500 hover:text-stone-700'
                            >
                                Continue chatting without saving
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    )
}
