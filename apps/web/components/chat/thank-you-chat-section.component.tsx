/**
 * Thank You Chat Section Component
 *
 * Specialized chat section for the thank-you page after form submission.
 * Reads lead context from sessionStorage, auto-upgrades the session with
 * contact info, and uses a personalized welcome message.
 *
 * @module components/chat/thank-you-chat-section
 */
'use client'

import { useEffect, useMemo, useCallback, useRef, useState } from 'react'
import Image from 'next/image'
import { cn } from '@workspace/ui/lib/utils'
import { MessageCircle, Sparkles, Loader2 } from 'lucide-react'
import { generateThankYouWelcomeMessage } from '@workspace/ai'

import { ChatInterface } from './chat-interface.component'
import { useUnifiedChat } from '@/hooks/chat/useUnifiedChat.hook'

/**
 * Lead context stored in sessionStorage after form submission
 */
type LeadContext = {
    firstName: string
    lastName?: string
    email?: string
    phone?: string
    procedure?: string
    submittedAt?: string
}

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

// Module-level cache to prevent double-read during React initialization
let cachedLeadContext: LeadContext | null | undefined = undefined

/**
 * Read and clear lead context from sessionStorage
 * Called as a lazy initializer for useState
 *
 * Uses module-level cache to prevent React's double-call behavior
 * from clearing sessionStorage on first call and returning null on second call
 *
 * @returns Lead context if available, null otherwise
 */
function getAndClearLeadContext(): LeadContext | null {
    // Return cached value if already read (prevents double-read issue)
    if (cachedLeadContext !== undefined) {
        return cachedLeadContext
    }

    if (typeof window === 'undefined') {
        cachedLeadContext = null
        return null
    }

    try {
        const stored = sessionStorage.getItem('lead_context')
        if (stored) {
            sessionStorage.removeItem('lead_context')
            const parsed = JSON.parse(stored) as LeadContext

            // Cache the result before returning
            cachedLeadContext = parsed
            return parsed
        }
    } catch {
        // Ignore sessionStorage errors
    }

    // Cache null result
    cachedLeadContext = null
    return null
}

/**
 * Thank You page chat section with lead context integration
 *
 * Features:
 * - Reads lead context from sessionStorage (set by form submission)
 * - Auto-upgrades session with contact information
 * - Personalized welcome message using lead's name and procedure
 * - Premium card styling matching the ChatSection design
 * - Passes lead context to session for AI prompt enhancement
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
        updateContactInfo,
        addMessage,
    } = useUnifiedChat()

    // Lead context from sessionStorage - read once using lazy initializer (React 19 compliant)
    const [leadContext] = useState<LeadContext | null>(getAndClearLeadContext)
    const hasUpgradedRef = useRef(false)
    const hasInitializedRef = useRef(false)

    // Derive welcome message from lead context (memoized, not stored in state)
    const welcomeMessage = useMemo(() => {
        if (leadContext) {
            return generateThankYouWelcomeMessage(leadContext)
        }
        return ''
    }, [leadContext])

    /**
     * Initialize session with lead context
     */
    const initializeWithLeadContext = useCallback(async () => {
        if (hasInitializedRef.current) return
        hasInitializedRef.current = true

        const context = leadContext

        // Build the request body with lead context
        const leadContextData = context
            ? {
                  leadContext: {
                      firstName: context.firstName,
                      procedure: context.procedure,
                  },
              }
            : {}

        // Make direct API call with lead context instead of using the hook
        // This allows us to pass lead context to the anonymous session endpoint
        try {
            const response = await fetch('/api/chat/session/anonymous', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    pageUrl:
                        typeof window !== 'undefined'
                            ? window.location.href
                            : undefined,
                    referrer:
                        typeof document !== 'undefined'
                            ? document.referrer
                            : undefined,
                    ...leadContextData,
                }),
            })

            if (response.ok) {
                // Now initialize through the hook to set up the context properly
                await initializeSession()
            }
        } catch {
            // Fall back to regular initialization
            await initializeSession()
        }
    }, [leadContext, initializeSession])

    /**
     * Initialize session on mount
     */
    useEffect(() => {
        if (!session && !isInitializing && !hasInitializedRef.current) {
            const timer = setTimeout(() => {
                initializeWithLeadContext()
            }, 300)

            return () => clearTimeout(timer)
        }
    }, [session, isInitializing, initializeWithLeadContext])

    /**
     * Auto-upgrade session with contact info once session is ready
     */
    useEffect(() => {
        if (
            isReady &&
            session?.isAnonymous &&
            leadContext &&
            !hasUpgradedRef.current
        ) {
            hasUpgradedRef.current = true

            // Upgrade the session with contact info
            const fullName = [leadContext.firstName, leadContext.lastName]
                .filter(Boolean)
                .join(' ')

            if (fullName && leadContext.phone) {
                updateContactInfo({
                    fullName,
                    phone: leadContext.phone,
                    email: leadContext.email,
                })
            }
        }
    }, [isReady, session?.isAnonymous, leadContext, updateContactInfo])

    const config = session?.config
    const userName =
        leadContext?.firstName || session?.fullName?.split(' ')[0] || 'there'

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
                            onClick={() => initializeWithLeadContext()}
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
                                    {leadContext?.firstName
                                        ? `Hi ${leadContext.firstName}! Click to Chat`
                                        : 'Click to Start Chatting'}
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
