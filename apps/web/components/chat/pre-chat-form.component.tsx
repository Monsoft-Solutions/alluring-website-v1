/**
 * Pre-Chat Form Component
 *
 * Lead capture form shown before starting a chat conversation.
 * Collects name and phone number.
 *
 * @module components/chat/pre-chat-form
 */
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { cn } from '@workspace/ui/lib/utils'
import { Loader2, MessageCircle, Phone, User } from 'lucide-react'

import { preChatFormSchema, type PreChatFormInput } from '@workspace/chat/types'

type PreChatFormProps = {
    onSubmit: (data: PreChatFormInput) => Promise<void>
    agentName?: string
    welcomeMessage?: string
}

export function PreChatForm({
    onSubmit,
    agentName = 'Alluring Assistant',
    welcomeMessage = "Hello! I'm here to help answer your questions. Please share your details to get started.",
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
            <div className='border-b border-stone-200 bg-stone-50 px-6 py-5'>
                <div className='flex items-center gap-3'>
                    <div className='bg-gold-100 flex h-10 w-10 items-center justify-center rounded-full'>
                        <MessageCircle className='text-gold-700 h-5 w-5' />
                    </div>
                    <div>
                        <h3 className='font-serif text-lg font-semibold text-stone-900'>
                            {agentName}
                        </h3>
                        <p className='text-xs text-stone-500'>
                            Typically replies instantly
                        </p>
                    </div>
                </div>
            </div>

            {/* Welcome Message */}
            <div className='flex-1 overflow-y-auto p-6'>
                <div className='mb-6 rounded-2xl rounded-tl-sm bg-stone-100 px-4 py-3 text-sm text-stone-700'>
                    {welcomeMessage}
                </div>

                {/* Form */}
                <form
                    onSubmit={handleSubmit(handleFormSubmit)}
                    className='space-y-4'
                >
                    {/* Full Name */}
                    <div>
                        <label
                            htmlFor='fullName'
                            className='mb-1.5 block text-sm font-medium text-stone-700'
                        >
                            Full Name *
                        </label>
                        <div className='relative'>
                            <User className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-stone-400' />
                            <input
                                {...register('fullName')}
                                id='fullName'
                                type='text'
                                placeholder='Enter your full name'
                                className={cn(
                                    'w-full rounded-lg border bg-white py-2.5 pr-4 pl-10 text-sm',
                                    'placeholder:text-stone-400',
                                    'focus:ring-2 focus:ring-stone-900/10 focus:outline-none',
                                    errors.fullName
                                        ? 'border-red-300 focus:ring-red-500/20'
                                        : 'border-stone-200'
                                )}
                            />
                        </div>
                        {errors.fullName && (
                            <p className='mt-1 text-xs text-red-500'>
                                {errors.fullName.message}
                            </p>
                        )}
                    </div>

                    {/* Phone */}
                    <div>
                        <label
                            htmlFor='phone'
                            className='mb-1.5 block text-sm font-medium text-stone-700'
                        >
                            Phone Number *
                        </label>
                        <div className='relative'>
                            <Phone className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-stone-400' />
                            <input
                                {...register('phone')}
                                id='phone'
                                type='tel'
                                placeholder='(555) 123-4567'
                                className={cn(
                                    'w-full rounded-lg border bg-white py-2.5 pr-4 pl-10 text-sm',
                                    'placeholder:text-stone-400',
                                    'focus:ring-2 focus:ring-stone-900/10 focus:outline-none',
                                    errors.phone
                                        ? 'border-red-300 focus:ring-red-500/20'
                                        : 'border-stone-200'
                                )}
                            />
                        </div>
                        {errors.phone && (
                            <p className='mt-1 text-xs text-red-500'>
                                {errors.phone.message}
                            </p>
                        )}
                    </div>

                    {/* Submit Button */}
                    <button
                        type='submit'
                        disabled={isSubmitting}
                        className={cn(
                            'flex w-full items-center justify-center gap-2 rounded-lg py-3 text-sm font-semibold transition-all duration-200',
                            'bg-stone-900 text-white hover:bg-stone-800',
                            'disabled:cursor-not-allowed disabled:opacity-50'
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

                    <p className='text-center text-xs text-stone-500'>
                        By starting a chat, you agree to our{' '}
                        <a
                            href='/privacy'
                            className='underline hover:text-stone-700'
                        >
                            Privacy Policy
                        </a>
                    </p>
                </form>
            </div>
        </div>
    )
}
