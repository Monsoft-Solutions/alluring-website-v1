/**
 * Chat Input Component
 *
 * Text input with send button for chat messages.
 *
 * @module components/chat/chat-input
 */
'use client'

import { cn } from '@workspace/ui/lib/utils'
import { Send, Loader2 } from 'lucide-react'
import { type KeyboardEvent, type ChangeEvent } from 'react'

import { MAX_MESSAGE_LENGTH } from '@workspace/chat/constants'

type ChatInputProps = {
    value: string
    onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void
    onSubmit: () => void
    isLoading?: boolean
    disabled?: boolean
    placeholder?: string
}

export function ChatInput({
    value,
    onChange,
    onSubmit,
    isLoading,
    disabled,
    placeholder = 'Type your message...',
}: ChatInputProps) {
    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            if (!isLoading && !disabled && value.trim()) {
                onSubmit()
            }
        }
    }

    const canSend = !isLoading && !disabled && value.trim().length > 0

    return (
        <div className='flex items-end gap-2 border-t border-stone-200 bg-white p-4'>
            <div className='relative flex-1'>
                <textarea
                    value={value}
                    onChange={onChange}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    disabled={disabled || isLoading}
                    maxLength={MAX_MESSAGE_LENGTH}
                    rows={1}
                    className={cn(
                        'w-full resize-none rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 pr-12 text-sm',
                        'placeholder:text-stone-400',
                        'focus:border-stone-300 focus:bg-white focus:ring-2 focus:ring-stone-900/5 focus:outline-none',
                        'disabled:cursor-not-allowed disabled:opacity-50',
                        'max-h-32 min-h-[44px]'
                    )}
                    style={{
                        height: 'auto',
                        minHeight: '44px',
                    }}
                    onInput={(e) => {
                        const target = e.target as HTMLTextAreaElement
                        target.style.height = 'auto'
                        target.style.height = `${Math.min(target.scrollHeight, 128)}px`
                    }}
                />
                <span className='absolute right-3 bottom-3 text-xs text-stone-400'>
                    {value.length}/{MAX_MESSAGE_LENGTH}
                </span>
            </div>

            <button
                type='button'
                onClick={onSubmit}
                disabled={!canSend}
                className={cn(
                    'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-all duration-200',
                    canSend
                        ? 'bg-stone-900 text-white hover:bg-stone-800'
                        : 'cursor-not-allowed bg-stone-200 text-stone-400'
                )}
                aria-label='Send message'
            >
                {isLoading ? (
                    <Loader2 className='h-5 w-5 animate-spin' />
                ) : (
                    <Send className='h-5 w-5' />
                )}
            </button>
        </div>
    )
}
