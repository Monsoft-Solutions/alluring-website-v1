/**
 * Pre-Chat Form Component
 *
 * Premium lead capture form shown before starting a chat conversation.
 * Collects name and phone number with luxury styling.
 *
 * @module components/chat/pre-chat-form
 */
'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { cn } from '@workspace/ui/lib/utils'
import { Loader2, MessageCircle, Phone, User, Sparkles } from 'lucide-react'

import { preChatFormSchema, type PreChatFormInput } from '@workspace/chat/types'
import { CSS_CLASSES } from '@/lib/chat/constants'

type PreChatFormProps = {
    onSubmit: (data: PreChatFormInput) => Promise<void>
    agentName?: string
    welcomeMessage?: string
    agentImageUrl?: string | null
}

/**
 * Premium pre-chat form with luxury design
 *
 * Features:
 * - Glassmorphism header with agent avatar
 * - Elegant form inputs with icon prefixes
 * - Gold accent on focus states
 * - Loading state with animated button
 * - Smooth entrance animations
 * - Accessible form with proper labels
 */
export function PreChatForm({
    onSubmit,
    agentName = 'Alluring Assistant',
    welcomeMessage = "Hello! I'm here to help answer your questions about our procedures. Please share your details to get started.",
    agentImageUrl,
}: PreChatFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<PreChatFormInput>({
        resolver: zodResolver(preChatFormSchema),
        defaultValues: {
            fullName: '',
            phone: '',
            email: '',
        },
    })

    const handleFormSubmit = async (data: PreChatFormInput) => {
        setIsSubmitting(true)
        try {
            await onSubmit(data)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className='flex h-full flex-col'>
            {/* Header */}
            <header
                className={cn(
                    'px-6 py-5',
                    // Glassmorphism background
                    'border-b border-stone-200/60 bg-stone-50/80 backdrop-blur-xl',
                    'shadow-sm shadow-stone-900/5'
                )}
            >
                <div className='flex items-center gap-3'>
                    {/* Avatar with gold ring */}
                    <div className='relative'>
                        <div
                            className={cn(
                                'flex h-12 w-12 items-center justify-center rounded-full',
                                'from-gold-100 to-gold-50 bg-linear-to-br',
                                'ring-gold-200/60 ring-2 ring-offset-2 ring-offset-white',
                                'shadow-gold-500/10 shadow-lg',
                                'overflow-hidden'
                            )}
                        >
                            {agentImageUrl ? (
                                <Image
                                    src={agentImageUrl}
                                    alt={agentName}
                                    width={48}
                                    height={48}
                                    className='h-full w-full object-cover'
                                />
                            ) : (
                                <MessageCircle className='text-gold-600 h-5 w-5' />
                            )}
                        </div>

                        {/* Online indicator */}
                        <span
                            className={cn(
                                'absolute -right-0.5 -bottom-0.5',
                                'h-3.5 w-3.5 rounded-full',
                                'bg-emerald-500 ring-2 ring-white'
                            )}
                        />
                    </div>

                    <div>
                        <h3 className='font-serif text-lg font-semibold tracking-tight text-stone-900'>
                            {agentName}
                        </h3>
                        <p className='flex items-center gap-1.5 text-xs text-stone-500'>
                            <span className='inline-block h-1.5 w-1.5 rounded-full bg-emerald-500' />
                            Online now • Typically replies instantly
                        </p>
                    </div>
                </div>
            </header>

            {/* Content */}
            <div className='flex-1 overflow-y-auto p-6'>
                {/* Welcome Message Bubble */}
                <div
                    className={cn(
                        'mb-6 rounded-2xl rounded-tl-sm px-4 py-3.5',
                        'bg-linear-to-br from-stone-100 via-stone-50 to-white',
                        'text-sm leading-relaxed text-stone-700',
                        'ring-1 ring-stone-200/50',
                        'shadow-md shadow-stone-900/5',
                        CSS_CLASSES.MESSAGE_APPEAR
                    )}
                >
                    {welcomeMessage}
                </div>

                {/* Form */}
                <form
                    onSubmit={handleSubmit(handleFormSubmit)}
                    className={cn('space-y-4', CSS_CLASSES.FADE_IN)}
                >
                    {/* Section Header */}
                    <div className='flex items-center gap-2'>
                        <Sparkles className='text-gold-500 h-4 w-4' />
                        <span className='text-xs font-medium text-stone-500'>
                            Start your conversation
                        </span>
                    </div>

                    {/* Full Name */}
                    <div className='space-y-1.5'>
                        <label
                            htmlFor='fullName'
                            className='block text-sm font-medium text-stone-700'
                        >
                            Full Name <span className='text-red-500'>*</span>
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
                                id='fullName'
                                type='text'
                                placeholder='Enter your full name'
                                autoComplete='name'
                                className={cn(
                                    'w-full rounded-xl border bg-white py-3 pr-4 pl-11 text-sm',
                                    'placeholder:text-stone-400',
                                    'transition-all duration-200',
                                    // Focus with gold accent
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
                            htmlFor='phone'
                            className='block text-sm font-medium text-stone-700'
                        >
                            Phone Number <span className='text-red-500'>*</span>
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
                                id='phone'
                                type='tel'
                                placeholder='(555) 123-4567'
                                autoComplete='tel'
                                className={cn(
                                    'w-full rounded-xl border bg-white py-3 pr-4 pl-11 text-sm',
                                    'placeholder:text-stone-400',
                                    'transition-all duration-200',
                                    // Focus with gold accent
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
                            // Premium gradient
                            'bg-linear-to-br from-stone-800 to-stone-900',
                            'text-white',
                            // Shadow
                            'shadow-lg shadow-stone-900/20',
                            // Transitions
                            'transition-all duration-200',
                            // Hover
                            'hover:from-stone-700 hover:to-stone-800',
                            'hover:shadow-xl hover:shadow-stone-900/25',
                            // Press
                            'active:scale-[0.98]',
                            // Focus
                            'focus:ring-2 focus:ring-stone-900 focus:ring-offset-2 focus:outline-none',
                            // Disabled
                            'disabled:cursor-not-allowed disabled:opacity-60'
                        )}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className='h-4 w-4 animate-spin' />
                                Starting chat...
                            </>
                        ) : (
                            <>
                                <MessageCircle className='h-4 w-4' />
                                Start Chat
                            </>
                        )}
                    </button>

                    {/* Privacy Notice */}
                    <p className='text-center text-xs text-stone-500'>
                        By starting a chat, you agree to our{' '}
                        <a
                            href='/privacy'
                            className='text-gold-600 underline-offset-2 hover:underline'
                            target='_blank'
                            rel='noopener noreferrer'
                        >
                            Privacy Policy
                        </a>
                    </p>
                </form>
            </div>
        </div>
    )
}
