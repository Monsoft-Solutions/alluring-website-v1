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
    /** Current category to display (initial, procedures, pricing, etc.) */
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
 * Determines the appropriate quick reply category based on conversation state
 */
export function getQuickReplyCategory(
    messageCount: number,
    lastAssistantMessage?: string
): string {
    // At the start of conversation
    if (messageCount === 0) {
        return 'initial'
    }

    // Check if the last assistant message mentions specific topics
    if (lastAssistantMessage) {
        const lowerMessage = lastAssistantMessage.toLowerCase()

        if (
            lowerMessage.includes('procedure') ||
            lowerMessage.includes('bbl') ||
            lowerMessage.includes('augmentation') ||
            lowerMessage.includes('tummy tuck') ||
            lowerMessage.includes('liposuction')
        ) {
            return 'procedures'
        }

        if (
            lowerMessage.includes('price') ||
            lowerMessage.includes('cost') ||
            lowerMessage.includes('financing') ||
            lowerMessage.includes('payment')
        ) {
            return 'pricing'
        }

        if (
            lowerMessage.includes('consultation') ||
            lowerMessage.includes('schedule') ||
            lowerMessage.includes('appointment')
        ) {
            return 'scheduling'
        }
    }

    // Default to general for mid-conversation
    return 'general'
}

/**
 * Shimmer loading skeleton for quick reply buttons
 */
function QuickReplyShimmer() {
    return (
        <div className='flex flex-wrap gap-2'>
            {[1, 2, 3].map((i) => (
                <div
                    key={i}
                    className={cn(
                        'h-8 rounded-full',
                        'bg-linear-to-r from-stone-100 via-stone-50 to-stone-100',
                        'animate-shimmer bg-[length:200%_100%]',
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

    // Fetch static quick replies when category changes (as fallback)
    useEffect(() => {
        // Skip fetching static replies if we have dynamic questions
        if (hasDynamicQuestions) {
            setIsLoading(false)
            return
        }

        async function fetchQuickReplies() {
            setIsLoading(true)
            try {
                const response = await fetch(
                    `/api/chat/quick-replies?category=${category}`
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
    }, [category, hasDynamicQuestions])

    const handleStaticClick = useCallback(
        async (reply: QuickReply) => {
            // Track the click asynchronously (fire and forget)
            fetch('/api/chat/quick-replies/track', {
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
                <p className='text-xs font-medium text-stone-500'>
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
                <p className='flex items-center gap-1.5 text-xs font-medium text-stone-500'>
                    <Sparkles className='text-gold-500 h-3 w-3' />
                    Suggested questions
                </p>
                <div className='flex flex-wrap gap-2'>
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

    // Fallback to static category-based quick replies
    if (isLoading || quickReplies.length === 0) {
        return null
    }

    return (
        <div className={cn('space-y-2', className)}>
            <p className='text-xs font-medium text-stone-500'>
                Quick questions
            </p>
            <div className='flex flex-wrap gap-2'>
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
