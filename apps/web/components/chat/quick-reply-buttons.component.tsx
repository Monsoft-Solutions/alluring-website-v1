/**
 * Quick Reply Buttons Component
 *
 * Displays contextual quick reply suggestions as pill-style buttons
 * to guide users through common questions.
 *
 * @module components/chat/quick-reply-buttons
 */
'use client'

import { useState, useEffect, useCallback } from 'react'
import { cn } from '@workspace/ui/lib/utils'

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

export function QuickReplyButtons({
    category = 'initial',
    onSelect,
    hidden = false,
    className,
}: QuickReplyButtonsProps) {
    const [quickReplies, setQuickReplies] = useState<QuickReply[]>([])
    const [isLoading, setIsLoading] = useState(true)

    // Fetch quick replies when category changes
    useEffect(() => {
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
    }, [category])

    const handleClick = useCallback(
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

    if (hidden || isLoading || quickReplies.length === 0) {
        return null
    }

    return (
        <div className={cn('flex flex-wrap gap-2', className)}>
            {quickReplies.map((reply) => (
                <button
                    key={reply.id}
                    type='button'
                    onClick={() => handleClick(reply)}
                    className={cn(
                        'inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium',
                        'border border-stone-200 bg-white text-stone-700',
                        'transition-all duration-200',
                        'hover:border-stone-300 hover:bg-stone-50 hover:text-stone-900',
                        'active:scale-95'
                    )}
                >
                    {reply.label}
                </button>
            ))}
        </div>
    )
}
