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
import { cn } from '@workspace/ui/lib/utils'
import { Sparkles } from 'lucide-react'

import { ChatInterface } from './chat-interface.component'
import { ChatCardLoadingState } from './chat-card-loading-state.component'
import { ChatCardErrorState } from './chat-card-error-state.component'
import { ChatCardHeader } from './chat-card-header.component'
import { ChatCardInitialState } from './chat-card-initial-state.component'
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
                'flex min-h-[90dvh] w-full flex-col justify-center py-12',
                'bg-linear-to-b from-stone-100 to-stone-50',
                className
            )}
            aria-label='Chat with our AI assistant'
        >
            <div className='mx-auto max-w-6xl px-4 sm:px-6 lg:px-8'>
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
                        'h-[60vh] w-full max-w-5xl'
                    )}
                >
                    {/* Loading State */}
                    {isInitializing && <ChatCardLoadingState />}

                    {/* Error State */}
                    {error && !isReady && (
                        <ChatCardErrorState
                            error={error}
                            onRetry={() => initializeSession()}
                        />
                    )}

                    {/* Chat Interface */}
                    {isReady && session && config && (
                        <>
                            <ChatCardHeader
                                agentName={config.agentName}
                                agentImageUrl={config.agentImageUrl}
                                subtitle='Online • Typically replies instantly'
                            />

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
                        <ChatCardInitialState
                            onStart={() => initializeSession()}
                            subtitle='Ask anything about our procedures'
                        />
                    )}
                </div>
            </div>
        </section>
    )
}
