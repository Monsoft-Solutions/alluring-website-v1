/**
 * Voice Input Button Component
 *
 * Microphone button for voice-to-text in chat.
 * Visual states: idle, connecting, recording with countdown.
 *
 * @module components/chat/voice-input-button
 */
'use client'

import { memo } from 'react'
import { Mic, MicOff, Loader2 } from 'lucide-react'
import { cn } from '@workspace/ui/lib/utils'

type VoiceInputButtonProps = {
    /** Whether currently recording */
    isRecording: boolean
    /** Whether connecting to STT service */
    isConnecting: boolean
    /** Whether the button should be disabled */
    isDisabled?: boolean
    /** Remaining recording time in seconds (shown when < 10) */
    remainingTime: number | null
    /** Click handler */
    onClick: () => void
}

/**
 * Voice input button with visual state feedback
 *
 * States:
 * - Idle: Stone background, Mic icon
 * - Connecting: Stone background, Spinner
 * - Recording: Red pulsing background, MicOff icon
 * - Countdown: Recording with timer badge (< 10 seconds)
 */
export const VoiceInputButton = memo(function VoiceInputButton({
    isRecording,
    isConnecting,
    isDisabled = false,
    remainingTime,
    onClick,
}: VoiceInputButtonProps) {
    const showCountdown =
        isRecording && remainingTime !== null && remainingTime <= 10
    const isButtonDisabled = isDisabled || isConnecting

    const getAriaLabel = () => {
        if (isConnecting) return 'Connecting voice input...'
        if (isRecording) {
            return showCountdown
                ? `Stop recording. ${remainingTime} seconds remaining`
                : 'Stop recording'
        }
        return 'Start voice input'
    }

    return (
        <button
            type='button'
            onClick={onClick}
            disabled={isButtonDisabled}
            className={cn(
                // Base - compact size for inline toolbar
                'relative flex shrink-0 items-center justify-center rounded-lg',
                'h-9 min-h-[36px] w-9 min-w-[36px]',
                'transition-all duration-200',
                // Recording state - keep prominent styling
                isRecording
                    ? [
                          'bg-red-500 text-white',
                          'shadow-md shadow-red-500/30',
                          'animate-pulse',
                          'hover:bg-red-600 hover:shadow-red-600/40',
                      ]
                    : [
                          // Idle state - transparent with subtle hover
                          'bg-transparent text-stone-500',
                          'hover:bg-stone-100 hover:text-stone-700',
                      ],
                // Disabled
                isButtonDisabled &&
                    'cursor-not-allowed opacity-60 hover:bg-transparent',
                // Focus
                'focus:ring-2 focus:ring-offset-1 focus:outline-none',
                isRecording ? 'focus:ring-red-500' : 'focus:ring-stone-400',
                // Press feedback
                'active:scale-95'
            )}
            aria-label={getAriaLabel()}
        >
            {isConnecting ? (
                <Loader2 className='h-4 w-4 animate-spin' />
            ) : isRecording ? (
                <MicOff className='h-4 w-4' />
            ) : (
                <Mic className='h-4 w-4' />
            )}

            {/* Countdown Badge */}
            {showCountdown && (
                <span
                    className={cn(
                        'absolute -top-1 -right-1',
                        'flex h-4 min-w-[16px] items-center justify-center',
                        'rounded-full bg-red-600 px-1',
                        'text-[9px] font-bold text-white shadow-sm',
                        remainingTime <= 5 && 'animate-ping-slow'
                    )}
                    aria-hidden='true'
                >
                    {remainingTime}
                </span>
            )}
        </button>
    )
})
