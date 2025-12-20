/**
 * Quick Reply Buttons Component
 *
 * Displays contextual quick reply suggestions as premium pill-style buttons
 * to guide users through common questions.
 *
 * Features shimmer loading effect and staggered entrance animations.
 *
 * @module components/chat/quick-reply-buttons
 */
'use client'

import { useState, useEffect, useCallback, memo } from 'react'
import { cn } from '@workspace/ui/lib/utils'
import { Sparkles } from 'lucide-react'

type QuickReply = {
    id: string
    label: string
    message: string
    category: string
}

type QuickReplyButtonsProps = {
    /** Current category - only 'initial' fetches from DB, others rely on dynamic questions */
    category?: string
    /** Callback when a quick reply is clicked */
    onSelect: (message: string) => void
    /** Whether quick replies should be hidden */
    hidden?: boolean
    /** Additional CSS classes */
    className?: string
    /** AI-generated dynamic questions (takes precedence over category-based) */
    dynamicQuestions?: string[]
    /** Whether dynamic questions are still loading */
    dynamicQuestionsLoading?: boolean
}

/**
 * Determines if this is the initial conversation state
 *
 * @deprecated Other categories (procedures, pricing, etc.) are no longer used.
 * After the initial state, AI-generated questions take over exclusively.
 */
export function getQuickReplyCategory(messageCount: number): string {
    return messageCount === 0 ? 'initial' : 'dynamic'
}

/**
 * Shimmer loading skeleton for quick reply buttons
 */
function QuickReplyShimmer() {
    return (
        <div className='flex flex-wrap justify-end gap-2'>
            {[1, 2, 3].map((i) => (
                <div
                    key={i}
                    className={cn(
                        'h-8 rounded-full',
                        'bg-linear-to-r from-stone-100 via-stone-50 to-stone-100',
                        'animate-shimmer bg-size-[200%_100%]',
                        i === 1 && 'w-32',
                        i === 2 && 'w-40',
                        i === 3 && 'w-28'
                    )}
                    style={{
                        animationDelay: `${i * 100}ms`,
                    }}
                />
            ))}
        </div>
    )
}

/**
 * Individual quick reply button with premium styling
 */
const QuickReplyButton = memo(function QuickReplyButton({
    text,
    onClick,
    index,
    isDynamic = false,
}: {
    text: string
    onClick: () => void
    index: number
    isDynamic?: boolean
}) {
    return (
        <button
            type='button'
            onClick={onClick}
            className={cn(
                'group inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-medium',
                // Base styling
                'bg-white text-stone-700',
                'border border-stone-200/80',
                // Premium shadow
                'shadow-sm shadow-stone-900/5',
                // Transitions
                'transition-all duration-200',
                // Hover effects
                'hover:border-gold-300/60 hover:bg-gold-50/50 hover:text-stone-900',
                'hover:shadow-gold-500/10 hover:shadow-md',
                // Press feedback
                'active:scale-[0.97]',
                // Focus ring
                'focus:ring-gold-500/30 focus:ring-2 focus:outline-none',
                // Entrance animation with stagger
                'animate-in fade-in slide-in-from-bottom-2',
                'duration-300'
            )}
            style={{
                animationDelay: `${index * 50}ms`,
                animationFillMode: 'both',
            }}
        >
            {isDynamic && (
                <Sparkles className='text-gold-500 h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100' />
            )}
            {text}
        </button>
    )
})

export const QuickReplyButtons = memo(function QuickReplyButtons({
    category = 'initial',
    onSelect,
    hidden = false,
    className,
    dynamicQuestions,
    dynamicQuestionsLoading = false,
}: QuickReplyButtonsProps) {
    const [quickReplies, setQuickReplies] = useState<QuickReply[]>([])
    const [isLoading, setIsLoading] = useState(true)

    // Check if we should use dynamic questions
    const hasDynamicQuestions = dynamicQuestions && dynamicQuestions.length > 0

    // Only fetch static quick replies for 'initial' category
    // After the first message, AI-generated questions take over exclusively
    const isInitialCategory = category === 'initial'

    useEffect(() => {
        // Skip fetching if we have dynamic questions or if not initial category
        if (hasDynamicQuestions || !isInitialCategory) {
            setIsLoading(false)
            return
        }

        async function fetchQuickReplies() {
            setIsLoading(true)
            try {
                const response = await fetch(
                    `/api/chat/quick-replies?category=initial`
                )
                const data = await response.json()
                if (data.success) {
                    setQuickReplies(data.quickReplies)
                }
            } catch (error) {
                console.error('Failed to fetch quick replies:', error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchQuickReplies()
    }, [isInitialCategory, hasDynamicQuestions])

    const handleStaticClick = useCallback(
        (reply: QuickReply) => {
            // Track the click asynchronously (fire and forget)
            void fetch('/api/chat/quick-replies/track', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ quickReplyId: reply.id }),
            }).catch(() => {
                // Ignore tracking errors
            })

            // Trigger the selection callback
            onSelect(reply.message)
        },
        [onSelect]
    )

    const handleDynamicClick = useCallback(
        (question: string) => {
            onSelect(question)
        },
        [onSelect]
    )

    // Hide if explicitly hidden
    if (hidden) {
        return null
    }

    // Show shimmer loading state
    if (dynamicQuestionsLoading) {
        return (
            <div className={cn('space-y-2', className)}>
                <p className='text-right text-xs font-medium text-stone-500'>
                    Generating suggestions...
                </p>
                <QuickReplyShimmer />
            </div>
        )
    }

    // Render dynamic AI-generated questions if available
    if (hasDynamicQuestions) {
        return (
            <div className={cn('space-y-2', className)}>
                <p className='flex items-center justify-end gap-1.5 text-xs font-medium text-stone-500'>
                    <Sparkles className='text-gold-500 h-3 w-3' />
                    Suggested questions
                </p>
                <div className='flex flex-wrap justify-end gap-2'>
                    {dynamicQuestions.map((question, index) => (
                        <QuickReplyButton
                            key={`dynamic-${index}`}
                            text={question}
                            onClick={() => handleDynamicClick(question)}
                            index={index}
                            isDynamic
                        />
                    ))}
                </div>
            </div>
        )
    }

    // Show initial quick replies from DB (only for initial state)
    if (isLoading || quickReplies.length === 0) {
        return null
    }

    return (
        <div className={cn('space-y-2', className)}>
            <p className='text-right text-xs font-medium text-stone-500'>
                Quick questions
            </p>
            <div className='flex flex-wrap justify-end gap-2'>
                {quickReplies.map((reply, index) => (
                    <QuickReplyButton
                        key={reply.id}
                        text={reply.label}
                        onClick={() => handleStaticClick(reply)}
                        index={index}
                    />
                ))}
            </div>
        </div>
    )
})
