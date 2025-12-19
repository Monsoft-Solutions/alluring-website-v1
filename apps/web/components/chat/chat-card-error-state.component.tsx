/**
 * Chat Card Error State Component
 *
 * Displays an error message with retry button when chat initialization fails.
 * Used by ChatSection and ThankYouChatSection for consistent error UI.
 *
 * @module components/chat/chat-card-error-state
 */
import { cn } from '@workspace/ui/lib/utils'
import { MessageCircle } from 'lucide-react'

type ChatCardErrorStateProps = {
    /** Error message to display */
    error: string
    /** Callback when retry button is clicked */
    onRetry: () => void
}

/**
 * Error state for chat card with retry functionality
 */
export function ChatCardErrorState({
    error,
    onRetry,
}: ChatCardErrorStateProps) {
    return (
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
                <p className='font-serif text-base font-medium text-red-700'>
                    Unable to start chat
                </p>
                <p className='text-sm text-red-500'>{error}</p>
            </div>
            <button
                onClick={onRetry}
                className={cn(
                    'rounded-lg px-4 py-2 text-base font-medium',
                    'bg-stone-900 text-white',
                    'hover:bg-stone-800',
                    'transition-colors'
                )}
            >
                Try Again
            </button>
        </div>
    )
}
