/**
 * Handoff Button Component
 *
 * Button to escalate chat to human support.
 *
 * @module components/chat/handoff-button
 */
'use client'

import { useState, useCallback } from 'react'
import { cn } from '@workspace/ui/lib/utils'
import { User2, Loader2 } from 'lucide-react'

type HandoffButtonProps = {
    sessionId: string
    /** Callback when escalation is successful */
    onEscalated?: () => void
    /** Whether the button should be compact (icon only on mobile) */
    compact?: boolean
    /** Additional CSS classes */
    className?: string
}

export function HandoffButton({
    sessionId,
    onEscalated,
    compact = false,
    className,
}: HandoffButtonProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [isEscalated, setIsEscalated] = useState(false)

    const handleEscalate = useCallback(async () => {
        if (isLoading || isEscalated) return

        setIsLoading(true)

        try {
            const response = await fetch('/api/chat/escalate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionId,
                    reason: 'user_request',
                }),
            })

            const data = await response.json()

            if (data.success) {
                setIsEscalated(true)
                onEscalated?.()
            }
        } catch (error) {
            console.error('Failed to escalate:', error)
        } finally {
            setIsLoading(false)
        }
    }, [sessionId, isLoading, isEscalated, onEscalated])

    if (isEscalated) {
        return (
            <div
                className={cn(
                    'flex items-center gap-1.5 rounded-lg bg-green-50 px-2 py-1 text-xs text-green-700',
                    className
                )}
            >
                <User2 className='h-3.5 w-3.5' />
                <span>Team notified</span>
            </div>
        )
    }

    return (
        <button
            type='button'
            onClick={handleEscalate}
            disabled={isLoading}
            className={cn(
                'flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium',
                'border border-stone-200 bg-white text-stone-600',
                'transition-all duration-200',
                'hover:border-stone-300 hover:bg-stone-50 hover:text-stone-800',
                'disabled:cursor-not-allowed disabled:opacity-50',
                className
            )}
            title='Talk to a team member'
        >
            {isLoading ? (
                <Loader2 className='h-3.5 w-3.5 animate-spin' />
            ) : (
                <User2 className='h-3.5 w-3.5' />
            )}
            {!compact && <span>Talk to Team</span>}
        </button>
    )
}
