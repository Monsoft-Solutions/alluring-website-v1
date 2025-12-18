/**
 * Chat Card Initial State Component
 *
 * Displays a clickable prompt to start the chat session.
 * Used by ChatSection and ThankYouChatSection before session initialization.
 *
 * @module components/chat/chat-card-initial-state
 */
import { cn } from '@workspace/ui/lib/utils'
import { MessageCircle } from 'lucide-react'

type ChatCardInitialStateProps = {
    /** Callback when the start button is clicked */
    onStart: () => void
    /** Optional subtitle text */
    subtitle?: string
}

/**
 * Initial state prompt for chat cards
 */
export function ChatCardInitialState({
    onStart,
    subtitle = 'Ask anything about our procedures',
}: ChatCardInitialStateProps) {
    return (
        <button
            onClick={onStart}
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
                    Click to Start Chatting
                </p>
                <p className='text-base text-stone-500'>{subtitle}</p>
            </div>
        </button>
    )
}
