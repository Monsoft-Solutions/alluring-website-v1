/**
 * Chat Card Loading State Component
 *
 * Displays a loading indicator while the chat session is being initialized.
 * Used by ChatSection and ThankYouChatSection for consistent loading UI.
 *
 * @module components/chat/chat-card-loading-state
 */
import { cn } from '@workspace/ui/lib/utils'
import { MessageCircle, Loader2 } from 'lucide-react'

/**
 * Loading state for chat card initialization
 */
export function ChatCardLoadingState() {
    return (
        <div className='flex h-full flex-col items-center justify-center gap-4 p-8'>
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
            <div className='space-y-2 text-center'>
                <p className='font-serif text-sm font-medium text-stone-700'>
                    Preparing your assistant
                </p>
                <p className='text-xs text-stone-500'>Just a moment...</p>
            </div>
            <Loader2 className='text-gold-500 h-5 w-5 animate-spin' />
        </div>
    )
}
