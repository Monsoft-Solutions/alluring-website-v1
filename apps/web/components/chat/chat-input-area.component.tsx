/**
 * Chat Input Area Component
 *
 * Premium message input with auto-resize textarea, character counter,
 * and animated send button.
 *
 * @module components/chat/chat-input-area
 */
'use client'

import { memo, useCallback, type ChangeEvent, type KeyboardEvent } from 'react'
import { cn } from '@workspace/ui/lib/utils'
import { Send, Loader2 } from 'lucide-react'
import { MAX_MESSAGE_LENGTH } from '@workspace/chat/constants'

import { useAutoResizeTextarea } from '@/hooks/chat'

type ChatInputAreaProps = {
    /** Current input value */
    value: string
    /** Input change handler */
    onChange: (value: string) => void
    /** Submit handler */
    onSubmit: () => void
    /** Placeholder text */
    placeholder?: string
    /** Whether input is disabled (e.g., during loading) */
    disabled?: boolean
    /** Whether currently sending/streaming */
    isLoading?: boolean
    /** Maximum character length */
    maxLength?: number
    /** Additional CSS classes */
    className?: string
}

/**
 * Premium chat input with luxury styling
 *
 * Features:
 * - Auto-resizing textarea (44px min, 128px max)
 * - Character counter with limit warning
 * - Gold accent on focus
 * - Animated send button with loading state
 * - Enter to submit, Shift+Enter for new line
 * - Minimum 44px touch target for mobile
 */
export const ChatInputArea = memo(function ChatInputArea({
    value,
    onChange,
    onSubmit,
    placeholder = 'Type a message...',
    disabled = false,
    isLoading = false,
    maxLength = MAX_MESSAGE_LENGTH,
    className,
}: ChatInputAreaProps) {
    const { textareaRef, resize, reset } = useAutoResizeTextarea({
        minHeight: 44,
        maxHeight: 128,
    })

    const canSubmit = value.trim().length > 0 && !disabled && !isLoading
    const charCount = value.length
    const isNearLimit = charCount > maxLength * 0.9
    const isAtLimit = charCount >= maxLength

    /**
     * Handle input change
     */
    const handleChange = useCallback(
        (e: ChangeEvent<HTMLTextAreaElement>) => {
            onChange(e.target.value)
            resize()
        },
        [onChange, resize]
    )

    /**
     * Handle keyboard events
     */
    const handleKeyDown = useCallback(
        (e: KeyboardEvent<HTMLTextAreaElement>) => {
            // Submit on Enter (without Shift)
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                if (canSubmit) {
                    onSubmit()
                    reset()
                }
            }
        },
        [canSubmit, onSubmit, reset]
    )

    /**
     * Handle submit button click
     */
    const handleSubmitClick = useCallback(() => {
        if (canSubmit) {
            onSubmit()
            reset()
        }
    }, [canSubmit, onSubmit, reset])

    return (
        <div
            className={cn(
                // Layout
                'flex items-end gap-3 p-4',
                // Premium background with subtle gradient
                'border-t border-stone-200/60 bg-linear-to-t from-white to-stone-50/50',
                // Safe area padding for mobile
                'pb-[calc(1rem+env(safe-area-inset-bottom))]',
                className
            )}
        >
            {/* Input Container */}
            <div className='relative flex-1'>
                <textarea
                    ref={textareaRef}
                    value={value}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    disabled={disabled || isLoading}
                    maxLength={maxLength}
                    rows={1}
                    className={cn(
                        // Base styles
                        'w-full resize-none rounded-2xl border bg-white px-4 py-3 pr-14 text-sm',
                        'max-h-[128px] min-h-[44px]',
                        // Typography
                        'leading-relaxed text-stone-900 placeholder:text-stone-400',
                        // Default border
                        'border-stone-200',
                        // Focus state with gold accent
                        'focus:border-gold-300 focus:outline-none',
                        'focus:ring-gold-500/20 focus:ring-2',
                        // Premium shadow on focus
                        'focus:shadow-gold-500/5 focus:shadow-lg',
                        // Disabled state
                        'disabled:cursor-not-allowed disabled:bg-stone-50 disabled:opacity-60',
                        // Transition
                        'transition-all duration-200'
                    )}
                    aria-label='Message input'
                />

                {/* Character Counter */}
                <span
                    className={cn(
                        'absolute right-3 bottom-3 text-xs font-medium transition-colors',
                        isAtLimit
                            ? 'text-red-500'
                            : isNearLimit
                              ? 'text-amber-500'
                              : 'text-stone-400'
                    )}
                >
                    {charCount}/{maxLength}
                </span>
            </div>

            {/* Send Button */}
            <button
                type='button'
                onClick={handleSubmitClick}
                disabled={!canSubmit}
                className={cn(
                    // Base styles
                    'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
                    // Touch target minimum
                    'min-h-[44px] min-w-[44px]',
                    // Transitions
                    'transition-all duration-200',
                    // Active state
                    canSubmit
                        ? [
                              // Gradient background
                              'bg-linear-to-br from-stone-800 to-stone-900',
                              'text-white',
                              // Hover effects
                              'hover:from-stone-700 hover:to-stone-800',
                              'hover:shadow-lg hover:shadow-stone-900/20',
                              // Press feedback
                              'active:scale-95',
                              // Focus ring
                              'focus:ring-2 focus:ring-stone-900 focus:ring-offset-2 focus:outline-none',
                          ]
                        : [
                              // Disabled state
                              'cursor-not-allowed bg-stone-100 text-stone-400',
                          ]
                )}
                aria-label={isLoading ? 'Sending...' : 'Send message'}
            >
                {isLoading ? (
                    <Loader2 className='h-5 w-5 animate-spin' />
                ) : (
                    <Send
                        className={cn(
                            'h-5 w-5 transition-transform duration-200',
                            canSubmit && 'group-hover:translate-x-0.5'
                        )}
                    />
                )}
            </button>
        </div>
    )
})
