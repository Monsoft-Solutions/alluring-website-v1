/**
 * Chat Widget Component
 *
 * Container component that manages the chat flow:
 * 1. Creates or restores anonymous session from cookie
 * 2. Shows chat interface immediately (no pre-chat form)
 * 3. Restores message history when session exists
 *
 * @module components/chat/chat-widget
 */
'use client'

import { useCallback, useEffect } from 'react'
import { cn } from '@workspace/ui/lib/utils'
import { X, Loader2, MessageCircle } from 'lucide-react'

import { ChatInterface } from './chat-interface.component'
import { useUnifiedChat } from '@/hooks/chat/useUnifiedChat.hook'
import { Z_INDEX, CSS_CLASSES } from '@/lib/chat/constants'

type ChatWidgetProps = {
    isOpen: boolean
    onClose: () => void
}

/**
 * Loading skeleton for session restore
 */
function LoadingSkeleton() {
    return (
        <div className='flex h-full flex-col items-center justify-center gap-4 p-8'>
            {/* Animated logo */}
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

            {/* Loading text */}
            <div className='space-y-2 text-center'>
                <p className='font-serif text-sm font-medium text-stone-700'>
                    Loading your conversation
                </p>
                <p className='text-xs text-stone-500'>Just a moment...</p>
            </div>

            {/* Loading indicator */}
            <Loader2 className='text-gold-500 h-5 w-5 animate-spin' />
        </div>
    )
}

/**
 * Premium chat widget with luxury design
 *
 * Features:
 * - Anonymous sessions (no pre-chat form required)
 * - Automatic session restoration via cookie
 * - Smooth entrance/exit animations
 * - Loading skeleton for session restore
 * - Mobile-first responsive design
 * - Safe area support
 */
export function ChatWidget({ isOpen, onClose }: ChatWidgetProps) {
    const {
        session,
        messages,
        isInitializing,
        isReady,
        error,
        initializeSession,
        resetSession,
    } = useUnifiedChat({
        pageUrl:
            typeof window !== 'undefined' ? window.location.href : undefined,
        referrer:
            typeof document !== 'undefined' ? document.referrer : undefined,
    })

    /**
     * Initialize session when widget opens
     */
    useEffect(() => {
        if (isOpen && !session) {
            initializeSession()
        }
    }, [isOpen, session, initializeSession])

    const handleClose = useCallback(() => {
        onClose()
        // Don't clear session on close - persist for next visit!
    }, [onClose])

    if (!isOpen) return null

    return (
        <div
            className={cn(
                'fixed flex flex-col overflow-hidden',
                // Premium container styling
                'rounded-2xl bg-white',
                'ring-1 ring-stone-200/60',
                // Premium shadow
                'shadow-2xl shadow-stone-900/20',
                // Animation
                CSS_CLASSES.SCALE_UP,
                // Mobile: full screen with some padding
                'inset-4 sm:inset-auto',
                // Desktop: fixed size in corner
                'sm:right-6 sm:bottom-24',
                // Fixed dimensions for desktop (400x600)
                'sm:h-[600px] sm:max-h-[calc(100vh-8rem)] sm:w-[400px]',
                // Safe area padding for mobile
                'pb-[env(safe-area-inset-bottom)] sm:pb-0'
            )}
            style={{
                zIndex: Z_INDEX.WIDGET,
                // Mobile max height
                maxHeight: 'calc(100dvh - 2rem)',
            }}
            role='dialog'
            aria-label='Chat widget'
            aria-modal='true'
        >
            {/* Close button */}
            <button
                onClick={handleClose}
                className={cn(
                    'absolute top-3 right-3 z-10',
                    'flex h-8 w-8 items-center justify-center rounded-full',
                    // Glassmorphism background
                    'bg-white/80 backdrop-blur-sm',
                    'text-stone-500',
                    'ring-1 ring-stone-200/60',
                    'shadow-sm',
                    // Transitions
                    'transition-all duration-200',
                    'hover:bg-white hover:text-stone-700 hover:shadow-md',
                    'active:scale-95',
                    // Focus
                    'focus:ring-2 focus:ring-stone-900/10 focus:outline-none'
                )}
                aria-label='Close chat'
            >
                <X className='h-4 w-4' />
            </button>

            {/* Loading state while initializing session */}
            {isInitializing && <LoadingSkeleton />}

            {/* Error message */}
            {!isInitializing && error && (
                <div
                    className={cn(
                        'mx-4 mt-4 rounded-xl p-4',
                        'bg-red-50 text-sm text-red-600',
                        'ring-1 ring-red-100'
                    )}
                >
                    {error}
                    <button
                        onClick={() => initializeSession()}
                        className='mt-2 text-xs underline hover:no-underline'
                    >
                        Try again
                    </button>
                </div>
            )}

            {/* Chat Interface */}
            {!isInitializing && isReady && session && (
                <ChatInterface
                    sessionId={session.id}
                    agentName={session.config.agentName}
                    welcomeMessage={session.config.welcomeMessage}
                    agentImageUrl={session.config.agentImageUrl}
                    userName={session.fullName?.split(' ')[0] || 'there'}
                    initialMessages={messages}
                    onReset={resetSession}
                />
            )}
        </div>
    )
}
