/**
 * Thank You Chat Section Component
 *
 * Specialized chat section for the thank-you page after form submission.
 * Reads contactId from URL parameter and links the chat session to the
 * contact submission for full data access and AI personalization.
 *
 * @module components/chat/thank-you-chat-section
 */
'use client'

import { useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { cn } from '@workspace/ui/lib/utils'
import { MessageCircle, Sparkles, Loader2 } from 'lucide-react'

import { ChatInterface } from './chat-interface.component'
import { useUnifiedChat } from '@/hooks/chat/useUnifiedChat.hook'

type ThankYouChatSectionProps = {
    /** Section ID for navigation */
    id?: string
    /** Section title */
    title?: string
    /** Section description */
    description?: string
    /** Additional CSS classes */
    className?: string
}

/**
 * Thank You page chat section with contact submission integration
 *
 * Features:
 * - Reads contactId from URL parameter (?contactId=xxx)
 * - Links chat session to contact submission via foreign key
 * - Enables full contact data access for AI personalization
 * - Premium card styling matching the ChatSection design
 */
export function ThankYouChatSection({
    id,
    title = 'Questions While You Wait?',
    description = "Our AI assistant can answer your questions right now. We'll also be calling you within 24 hours.",
    className,
}: ThankYouChatSectionProps) {
    const {
        session,
        messages,
        isInitializing,
        isReady,
        error,
        initializeSession,
        addMessage,
    } = useUnifiedChat()

    // Read contactId from URL search params
    const searchParams = useSearchParams()
    const contactId = searchParams.get('contactId')
    const hasInitializedRef = useRef(false)

    /**
     * Initialize session on mount with contactId if available
     */
    useEffect(() => {
        if (!session && !isInitializing && !hasInitializedRef.current) {
            hasInitializedRef.current = true
            const timer = setTimeout(() => {
                initializeSession(
                    contactId ? { contactSubmissionId: contactId } : undefined
                )
            }, 300)

            return () => clearTimeout(timer)
        }
    }, [session, isInitializing, initializeSession, contactId])

    const config = session?.config
    const userName = session?.fullName?.split(' ')[0] || 'there'

    return (
        <section
            id={id}
            className={cn(
                'w-full py-16 md:py-24',
                'bg-linear-to-b from-stone-100 to-stone-50',
                className
            )}
            aria-label='Chat with our AI assistant while you wait'
        >
            <div className='mx-auto max-w-4xl px-4 sm:px-6 lg:px-8'>
                {/* Section Header */}
                <div className='mb-8 text-center'>
                    <div className='bg-gold-100 mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5'>
                        <Sparkles className='text-gold-600 h-4 w-4' />
                        <span className='text-gold-700 text-sm font-medium'>
                            While You Wait
                        </span>
                    </div>
                    <h2 className='font-serif text-3xl font-bold tracking-tight text-stone-900 md:text-4xl'>
                        {title}
                    </h2>
                    <p className='mx-auto mt-4 max-w-2xl text-lg text-stone-600'>
                        {description}
                    </p>
                </div>

                {/* Chat Card */}
                <div
                    className={cn(
                        'relative mx-auto overflow-hidden rounded-2xl',
                        'bg-white',
                        'ring-1 ring-stone-200/60',
                        'shadow-xl shadow-stone-900/10',
                        'h-[500px] max-h-[70vh]'
                    )}
                >
                    {/* Loading State */}
                    {isInitializing && (
                        <div className='flex h-full flex-col items-center justify-center gap-4 p-8'>
                            <div
                                className={cn(
                                    'flex h-16 w-16 items-center justify-center rounded-full',
                                    'from-gold-100 to-gold-50 bg-linear-to-br',
                                    'ring-gold-200/60 ring-2',
                                    'shadow-gold-500/10 shadow-lg',
                                    'animate-pulse'
                                )}
                            >
                                <MessageCircle className='text-gold-600 h-7 w-7' />
                            </div>
                            <div className='space-y-2 text-center'>
                                <p className='font-serif text-sm font-medium text-stone-700'>
                                    Preparing your assistant
                                </p>
                                <p className='text-xs text-stone-500'>
                                    Just a moment...
                                </p>
                            </div>
                            <Loader2 className='text-gold-500 h-5 w-5 animate-spin' />
                        </div>
                    )}

                    {/* Error State */}
                    {error && !isReady && (
                        <div className='flex h-full flex-col items-center justify-center gap-4 p-8'>
                            <div
                                className={cn(
                                    'flex h-16 w-16 items-center justify-center rounded-full',
                                    'bg-red-50',
                                    'ring-2 ring-red-100'
                                )}
                            >
                                <MessageCircle className='h-7 w-7 text-red-400' />
                            </div>
                            <div className='space-y-2 text-center'>
                                <p className='font-serif text-sm font-medium text-red-700'>
                                    Unable to start chat
                                </p>
                                <p className='text-xs text-red-500'>{error}</p>
                            </div>
                            <button
                                onClick={() =>
                                    initializeSession(
                                        contactId
                                            ? { contactSubmissionId: contactId }
                                            : undefined
                                    )
                                }
                                className={cn(
                                    'rounded-lg px-4 py-2 text-sm font-medium',
                                    'bg-stone-900 text-white',
                                    'hover:bg-stone-800',
                                    'transition-colors'
                                )}
                            >
                                Try Again
                            </button>
                        </div>
                    )}

                    {/* Chat Interface */}
                    {isReady && session && config && (
                        <>
                            {/* Custom Header */}
                            <header
                                className={cn(
                                    'flex items-center gap-3 px-4 py-3',
                                    'border-b border-stone-200/60 bg-stone-50/80 backdrop-blur-xl',
                                    'shadow-sm shadow-stone-900/5'
                                )}
                            >
                                {/* Avatar */}
                                <div className='relative'>
                                    <div
                                        className={cn(
                                            'flex h-10 w-10 items-center justify-center rounded-full',
                                            'from-gold-100 to-gold-50 bg-linear-to-br',
                                            'ring-gold-200/60 ring-2 ring-offset-1 ring-offset-white',
                                            'shadow-gold-500/10 shadow-md',
                                            'overflow-hidden'
                                        )}
                                    >
                                        {config.agentImageUrl ? (
                                            <Image
                                                src={config.agentImageUrl}
                                                alt={config.agentName}
                                                width={40}
                                                height={40}
                                                className='h-full w-full object-cover'
                                            />
                                        ) : (
                                            <MessageCircle className='text-gold-600 h-4 w-4' />
                                        )}
                                    </div>
                                    {/* Online indicator */}
                                    <span
                                        className={cn(
                                            'absolute -right-0.5 -bottom-0.5',
                                            'h-3 w-3 rounded-full border-2 border-white',
                                            'bg-emerald-500'
                                        )}
                                    />
                                </div>

                                {/* Info */}
                                <div>
                                    <h3 className='font-serif text-sm font-semibold tracking-tight text-stone-900'>
                                        {config.agentName}
                                    </h3>
                                    <p className='text-xs text-stone-500'>
                                        Online • Here to help while you wait
                                    </p>
                                </div>
                            </header>

                            {/* Chat Interface without its own header */}
                            <div className='h-[calc(100%-56px)]'>
                                <ChatInterface
                                    sessionId={session.id}
                                    agentName={config.agentName}
                                    welcomeMessage={config.welcomeMessage}
                                    agentImageUrl={config.agentImageUrl}
                                    userName={userName}
                                    showHeader={false}
                                    initialMessages={messages}
                                    onMessageReceived={addMessage}
                                />
                            </div>
                        </>
                    )}

                    {/* Initial State - Before Session */}
                    {!session && !isInitializing && (
                        <button
                            onClick={() =>
                                initializeSession(
                                    contactId
                                        ? { contactSubmissionId: contactId }
                                        : undefined
                                )
                            }
                            className='flex h-full w-full flex-col items-center justify-center gap-4 p-8 transition-colors hover:bg-stone-50'
                        >
                            <div
                                className={cn(
                                    'flex h-20 w-20 items-center justify-center rounded-full',
                                    'from-gold-100 to-gold-50 bg-linear-to-br',
                                    'ring-gold-200/60 ring-2',
                                    'shadow-gold-500/10 shadow-lg'
                                )}
                            >
                                <MessageCircle className='text-gold-600 h-9 w-9' />
                            </div>
                            <div className='space-y-2 text-center'>
                                <p className='font-serif text-lg font-semibold text-stone-900'>
                                    Click to Start Chatting
                                </p>
                                <p className='text-sm text-stone-500'>
                                    Ask any questions while you wait for our
                                    call
                                </p>
                            </div>
                        </button>
                    )}
                </div>
            </div>
        </section>
    )
}
