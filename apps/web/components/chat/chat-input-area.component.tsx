/**
 * Chat Input Area Component
 *
 * Premium message input with auto-resize textarea, character counter,
 * voice input with real-time transcription, and animated send button.
 *
 * @module components/chat/chat-input-area
 */
'use client'

import {
    memo,
    useCallback,
    useState,
    useEffect,
    useRef,
    type ChangeEvent,
    type KeyboardEvent,
} from 'react'
import { cn } from '@workspace/ui/lib/utils'
import { Send, Loader2 } from 'lucide-react'
import { MAX_MESSAGE_LENGTH } from '@workspace/chat/constants'

import { useAutoResizeTextarea } from '@/hooks/chat/useAutoResizeTextarea.hook'
import { useVoiceInput } from '@/hooks/chat/useVoiceInput.hook'
import { VoiceInputButton } from './voice-input-button.component'

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
 * - Voice-to-text with real-time transcription in input field
 * - VAD-based auto-commit when user stops speaking
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

    // Voice input state management
    // baseText: text that was in input before recording started
    // partialText: current partial transcript being spoken
    const [baseText, setBaseText] = useState('')
    const [partialText, setPartialText] = useState('')
    const [isVoiceAvailable, setIsVoiceAvailable] = useState(false)
    const [isVoiceSubmitting, setIsVoiceSubmitting] = useState(false)
    const hasCheckedAvailability = useRef(false)
    const shouldSubmitAfterStop = useRef(false)

    // Refs to track current values (avoids stale closure issues)
    const baseTextRef = useRef('')
    const partialTextRef = useRef('')
    const valueRef = useRef(value)
    const onChangeRef = useRef(onChange)
    const onSubmitRef = useRef(onSubmit)

    // Keep refs in sync with state/props
    useEffect(() => {
        baseTextRef.current = baseText
    }, [baseText])

    useEffect(() => {
        partialTextRef.current = partialText
    }, [partialText])

    useEffect(() => {
        valueRef.current = value
    }, [value])

    useEffect(() => {
        onChangeRef.current = onChange
    }, [onChange])

    useEffect(() => {
        onSubmitRef.current = onSubmit
    }, [onSubmit])

    // Check voice availability on mount
    useEffect(() => {
        if (hasCheckedAvailability.current) return
        hasCheckedAvailability.current = true

        const checkAvailability = async () => {
            try {
                const response = await fetch('/api/stt/token', {
                    method: 'POST',
                })
                if (response.ok) {
                    setIsVoiceAvailable(true)
                }
            } catch {
                // Voice not available
            }
        }
        void checkAvailability()
    }, [])

    // Voice input hook with callbacks
    const {
        isRecording,
        isConnecting,
        error: voiceError,
        startRecording,
        stopRecording,
        remainingTime,
        clearError,
    } = useVoiceInput({
        onPartialTranscript: (text) => {
            setPartialText(text)
        },
        onCommittedTranscript: (text) => {
            // Append committed text to base with space
            setBaseText((prev) => {
                const newBase = prev ? `${prev} ${text}` : text
                return newBase
            })
            // Clear partial since it's now committed
            setPartialText('')
        },
        onSessionEnd: () => {
            // Use refs to get current values (avoids stale closure)
            const currentBase = baseTextRef.current
            const currentPartial = partialTextRef.current
            const currentValue = valueRef.current

            // Build final text from base + any remaining partial
            const finalText =
                currentBase + (currentPartial ? ` ${currentPartial}` : '')

            if (finalText.trim()) {
                // If there was existing text before recording, append to it
                // Otherwise just use the final text
                const existingText = currentValue.trim()
                const newValue = existingText
                    ? `${existingText} ${finalText.trim()}`
                    : finalText.trim()
                onChangeRef.current(newValue)
            }

            // Reset voice state
            setBaseText('')
            setPartialText('')

            // Handle auto-submit if requested
            if (shouldSubmitAfterStop.current) {
                shouldSubmitAfterStop.current = false
                // Small delay to ensure state updates propagate
                setTimeout(() => {
                    onSubmitRef.current()
                    setIsVoiceSubmitting(false)
                }, 0)
            }
        },
    })

    // Compute display value based on recording state
    const displayValue = isRecording
        ? baseText + (partialText ? (baseText ? ' ' : '') + partialText : '')
        : value

    // Trigger resize when display value changes
    useEffect(() => {
        resize()
    }, [displayValue, resize])

    const canSubmit =
        displayValue.trim().length > 0 &&
        !disabled &&
        !isLoading &&
        !isVoiceSubmitting
    const charCount = displayValue.length
    const isNearLimit = charCount > maxLength * 0.9
    const isAtLimit = charCount >= maxLength

    /**
     * Handle input change (only when not recording)
     */
    const handleChange = useCallback(
        (e: ChangeEvent<HTMLTextAreaElement>) => {
            if (!isRecording) {
                onChange(e.target.value)
                resize()
            }
        },
        [onChange, resize, isRecording]
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
        if (!canSubmit) return

        if (isRecording) {
            setIsVoiceSubmitting(true)
            shouldSubmitAfterStop.current = true
            stopRecording()
        } else {
            onSubmit()
            reset()
        }
    }, [canSubmit, onSubmit, reset, isRecording, stopRecording])

    /**
     * Handle voice button click
     */
    const handleVoiceClick = useCallback(() => {
        clearError()

        if (isRecording) {
            stopRecording()
        } else {
            // Initialize with empty base - committed text will accumulate here
            // The original input value is preserved via the ref
            setBaseText('')
            setPartialText('')
            startRecording()
        }
    }, [isRecording, stopRecording, startRecording, clearError])

    return (
        <div
            className={cn(
                // Layout
                'flex flex-col gap-2 p-4',
                // Premium background with subtle gradient
                'border-t border-stone-200/60 bg-linear-to-t from-white to-stone-50/50',
                // Safe area padding for mobile
                'pb-[calc(1rem+env(safe-area-inset-bottom))]',
                className
            )}
        >
            {/* Voice Error Message */}
            {voiceError && (
                <div
                    className={cn(
                        'flex items-center gap-2 px-3 py-2',
                        'rounded-xl bg-red-50 text-sm text-red-600',
                        'ring-1 ring-red-100'
                    )}
                    role='alert'
                >
                    <span>{voiceError}</span>
                    <button
                        type='button'
                        onClick={clearError}
                        className='ml-auto text-xs font-medium underline hover:no-underline'
                    >
                        Dismiss
                    </button>
                </div>
            )}

            {/* Unified Input Container - Stacked Layout */}
            <div
                className={cn(
                    // Container styling
                    'flex flex-col overflow-hidden rounded-2xl border bg-white',
                    'transition-all duration-200',
                    // Default border
                    'border-stone-200',
                    // Recording state - subtle red tint
                    isRecording && 'border-red-300 bg-red-50/20',
                    // Focus-within state with gold accent
                    'focus-within:border-gold-300',
                    'focus-within:ring-gold-500/20 focus-within:ring-2',
                    'focus-within:shadow-gold-500/5 focus-within:shadow-lg',
                    // Disabled state
                    (disabled || isLoading) && 'opacity-60'
                )}
            >
                {/* Textarea - Full Width */}
                <textarea
                    ref={textareaRef}
                    value={displayValue}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    placeholder={isRecording ? 'Listening...' : placeholder}
                    disabled={disabled || isLoading}
                    readOnly={isRecording}
                    maxLength={maxLength}
                    rows={1}
                    className={cn(
                        // Base styles - no border, transparent
                        'w-full resize-none border-0 bg-transparent px-4 pt-3 pb-2 text-sm',
                        'max-h-[128px] min-h-[44px]',
                        // Typography
                        'leading-relaxed text-stone-900 placeholder:text-stone-400',
                        // Remove focus ring (container handles it)
                        'focus:ring-0 focus:outline-none',
                        // Disabled state
                        'disabled:cursor-not-allowed',
                        // Read-only during recording
                        isRecording && 'cursor-default'
                    )}
                    aria-label='Message input'
                />

                {/* Bottom Toolbar */}
                <div className='flex items-center justify-between px-3 pb-2'>
                    {/* Character Counter - Left */}
                    <span
                        className={cn(
                            'text-xs font-medium transition-colors',
                            isAtLimit
                                ? 'text-red-500'
                                : isNearLimit
                                  ? 'text-amber-500'
                                  : 'text-stone-400'
                        )}
                    >
                        {charCount}/{maxLength}
                    </span>

                    {/* Action Buttons - Right */}
                    <div className='flex items-center gap-1'>
                        {/* Voice Input Button */}
                        {isVoiceAvailable && (
                            <VoiceInputButton
                                isRecording={isRecording}
                                isConnecting={isConnecting}
                                isDisabled={disabled || isLoading}
                                remainingTime={remainingTime}
                                onClick={handleVoiceClick}
                            />
                        )}

                        {/* Send Button */}
                        <button
                            type='button'
                            onClick={handleSubmitClick}
                            disabled={!canSubmit}
                            className={cn(
                                // Base - compact size for inline
                                'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                                // Touch target with padding
                                'min-h-[36px] min-w-[36px]',
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
                                          'hover:shadow-md hover:shadow-stone-900/20',
                                          // Press feedback
                                          'active:scale-95',
                                          // Focus ring
                                          'focus:ring-2 focus:ring-stone-900 focus:ring-offset-1 focus:outline-none',
                                      ]
                                    : [
                                          // Disabled state - transparent
                                          'cursor-not-allowed bg-stone-100 text-stone-400',
                                      ]
                            )}
                            aria-label={
                                isLoading || isVoiceSubmitting
                                    ? 'Sending...'
                                    : 'Send message'
                            }
                        >
                            {isLoading || isVoiceSubmitting ? (
                                <Loader2 className='h-4 w-4 animate-spin' />
                            ) : (
                                <Send className='h-4 w-4' />
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
})
