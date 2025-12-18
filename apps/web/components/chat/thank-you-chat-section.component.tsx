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
import { cn } from '@workspace/ui/lib/utils'
import { Sparkles } from 'lucide-react'

import { ChatInterface } from './chat-interface.component'
import { ChatCardLoadingState } from './chat-card-loading-state.component'
import { ChatCardErrorState } from './chat-card-error-state.component'
import { ChatCardHeader } from './chat-card-header.component'
import { ChatCardInitialState } from './chat-card-initial-state.component'
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
                'flex min-h-[90dvh] w-full flex-col justify-center py-12',
                'bg-linear-to-b from-stone-100 to-stone-50',
                className
            )}
            aria-label='Chat with our AI assistant while you wait'
        >
            <div className='mx-auto max-w-6xl px-4 sm:px-6 lg:px-8'>
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
                        'h-[60vh] w-full max-w-5xl'
                    )}
                >
                    {/* Loading State */}
                    {isInitializing && <ChatCardLoadingState />}

                    {/* Error State */}
                    {error && !isReady && (
                        <ChatCardErrorState
                            error={error}
                            onRetry={() =>
                                initializeSession(
                                    contactId
                                        ? { contactSubmissionId: contactId }
                                        : undefined
                                )
                            }
                        />
                    )}

                    {/* Chat Interface */}
                    {isReady && session && config && (
                        <>
                            <ChatCardHeader
                                agentName={config.agentName}
                                agentImageUrl={config.agentImageUrl}
                                subtitle='Online • Here to help while you wait'
                            />

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
                        <ChatCardInitialState
                            onStart={() =>
                                initializeSession(
                                    contactId
                                        ? { contactSubmissionId: contactId }
                                        : undefined
                                )
                            }
                            subtitle='Ask any questions while you wait for our call'
                        />
                    )}
                </div>
            </div>
        </section>
    )
}
