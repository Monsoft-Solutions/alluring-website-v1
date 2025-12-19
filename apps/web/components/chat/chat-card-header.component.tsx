/**
 * Chat Card Header Component
 *
 * Displays the agent avatar, name, and online status in the chat card.
 * Used by ChatSection and ThankYouChatSection for consistent header UI.
 *
 * @module components/chat/chat-card-header
 */
import Image from 'next/image'
import { cn } from '@workspace/ui/lib/utils'
import { MessageCircle } from 'lucide-react'

type ChatCardHeaderProps = {
    /** Agent display name */
    agentName: string
    /** Optional agent avatar image URL */
    agentImageUrl?: string | null
    /** Status subtitle text */
    subtitle?: string
}

/**
 * Header for embedded chat cards with agent info and online status
 */
export function ChatCardHeader({
    agentName,
    agentImageUrl,
    subtitle = 'Online • Typically replies instantly',
}: ChatCardHeaderProps) {
    return (
        <header
            className={cn(
                'flex items-center gap-3 px-4 py-3',
                'border-b border-stone-200/60 bg-stone-50/80 backdrop-blur-xl',
                'shadow-sm shadow-stone-900/5'
            )}
        >
            {/* Avatar */}
            <div className='relative'>
                <div
                    className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-full',
                        'from-gold-100 to-gold-50 bg-linear-to-br',
                        'ring-gold-200/60 ring-2 ring-offset-1 ring-offset-white',
                        'shadow-gold-500/10 shadow-md',
                        'overflow-hidden'
                    )}
                >
                    {agentImageUrl ? (
                        <Image
                            src={agentImageUrl}
                            alt={agentName}
                            width={40}
                            height={40}
                            className='h-full w-full object-cover'
                        />
                    ) : (
                        <MessageCircle className='text-gold-600 h-4 w-4' />
                    )}
                </div>
                {/* Online indicator */}
                <span
                    className={cn(
                        'absolute -right-0.5 -bottom-0.5',
                        'h-3 w-3 rounded-full border-2 border-white',
                        'bg-emerald-500'
                    )}
                />
            </div>

            {/* Info */}
            <div>
                <h3 className='font-serif text-base font-semibold tracking-tight text-stone-900'>
                    {agentName}
                </h3>
                <p className='text-sm text-stone-500'>{subtitle}</p>
            </div>
        </header>
    )
}
