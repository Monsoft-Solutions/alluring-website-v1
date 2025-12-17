/**
 * Chat Section Component
 *
 * Embeddable chat section that can be added to any page.
 * Creates an anonymous session on first interaction with
 * AI-driven conversational lead capture.
 *
 * @module components/chat/chat-section
 */
'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import { cn } from '@workspace/ui/lib/utils'
import { MessageCircle, Sparkles, Loader2 } from 'lucide-react'

import { ChatInterface } from './chat-interface.component'
import { useUnifiedChat } from '@/hooks/chat/useUnifiedChat.hook'

type ChatSectionProps = {
    /** Section ID for navigation */
    id?: string
    /** Section title */
    title?: string
    /** Section description */
    description?: string
    /** Custom welcome message override */
    welcomeMessage?: string
    /** Additional CSS classes */
    className?: string
}

/**
 * Embeddable chat section with card-style design
 *
 * Features:
 * - Anonymous session creation on first interaction
 * - AI-driven conversational lead capture
 * - Premium card styling with glassmorphism
 * - Mobile-responsive with max-height constraints
 * - Reuses ChatInterface for messaging
 */
export function ChatSection({
    id,
    title = 'Have Questions? Ask Our AI Assistant',
    description = 'Get instant answers about procedures, pricing, recovery, and more. Our AI assistant is available 24/7.',
    welcomeMessage,
    className,
}: ChatSectionProps) {
    const {
        session,
        messages,
        isInitializing,
        isReady,
        error,
        initializeSession,
        addMessage,
    } = useUnifiedChat()

    /**
     * Initialize session on mount if not already initialized
     * Context handles auto-initialization, but we ensure it happens for embedded chat
     */
    useEffect(() => {
        if (!session && !isInitializing) {
            // Small delay to let the page render first
            const timer = setTimeout(() => {
                initializeSession()
            }, 500)

            return () => clearTimeout(timer)
        }
    }, [session, isInitializing, initializeSession])

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
            aria-label='Chat with our AI assistant'
        >
            <div className='mx-auto max-w-4xl px-4 sm:px-6 lg:px-8'>
                {/* Section Header */}
                <div className='mb-8 text-center'>
                    <div className='bg-gold-100 mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5'>
                        <Sparkles className='text-gold-600 h-4 w-4' />
                        <span className='text-gold-700 text-sm font-medium'>
                            AI-Powered Assistance
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
                        // Premium styling
                        'bg-white',
                        'ring-1 ring-stone-200/60',
                        'shadow-xl shadow-stone-900/10',
                        // Fixed height for desktop, responsive for mobile
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
                                onClick={() => initializeSession()}
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
                            {/* Custom Header for Embedded */}
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
                                        Online • Typically replies instantly
                                    </p>
                                </div>
                            </header>

                            {/* Chat Interface without its own header */}
                            <div className='h-[calc(100%-56px)]'>
                                <ChatInterface
                                    sessionId={session.id}
                                    agentName={config.agentName}
                                    welcomeMessage={
                                        welcomeMessage || config.welcomeMessage
                                    }
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
                            onClick={() => initializeSession()}
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
                                    Ask anything about our procedures
                                </p>
                            </div>
                        </button>
                    )}
                </div>
            </div>
        </section>
    )
}
