'use client'

import Image from 'next/image'
import { MessageCircle, Sparkles } from 'lucide-react'

import { cn } from '@workspace/ui/lib/utils'

type AgentAvatarPreviewProps = {
    /** URL of the agent avatar image */
    imageUrl: string | null | undefined
    /** Agent name for alt text */
    agentName?: string
}

/**
 * Preview component showing how the agent avatar will appear in different
 * contexts within the chat interface.
 *
 * Shows three preview sizes:
 * - Header: 40px (main chat header)
 * - Message: 32px (chat message bubbles)
 * - Pre-chat: 48px (pre-chat welcome form)
 */
export function AgentAvatarPreview({
    imageUrl,
    agentName = 'Agent',
}: AgentAvatarPreviewProps) {
    if (!imageUrl) return null

    return (
        <div className='rounded-lg border bg-stone-50 p-4'>
            <p className='mb-3 text-xs font-medium text-stone-600'>
                Avatar Preview
            </p>

            <div className='flex items-end gap-6'>
                {/* Pre-chat Form Preview (48px) */}
                <div className='flex flex-col items-center gap-1.5'>
                    <div className='relative'>
                        <div
                            className={cn(
                                'flex items-center justify-center rounded-full',
                                'bg-linear-to-br from-amber-100 to-amber-50',
                                'ring-2 ring-amber-200/60 ring-offset-2 ring-offset-white',
                                'shadow-lg shadow-amber-500/10',
                                'h-12 w-12 overflow-hidden'
                            )}
                        >
                            <Image
                                src={imageUrl}
                                alt={agentName}
                                width={48}
                                height={48}
                                className='h-full w-full object-cover'
                            />
                        </div>
                        {/* Online indicator */}
                        <span
                            className={cn(
                                'absolute -right-0.5 -bottom-0.5',
                                'h-3.5 w-3.5 rounded-full border-2 border-white',
                                'bg-emerald-500'
                            )}
                        />
                    </div>
                    <span className='text-[10px] text-stone-400'>Welcome</span>
                </div>

                {/* Header Preview (40px) */}
                <div className='flex flex-col items-center gap-1.5'>
                    <div className='relative'>
                        <div
                            className={cn(
                                'flex items-center justify-center rounded-full',
                                'bg-linear-to-br from-amber-100 to-amber-50',
                                'ring-2 ring-amber-200/60 ring-offset-1 ring-offset-white',
                                'shadow-md shadow-amber-500/10',
                                'h-10 w-10 overflow-hidden'
                            )}
                        >
                            <Image
                                src={imageUrl}
                                alt={agentName}
                                width={40}
                                height={40}
                                className='h-full w-full object-cover'
                            />
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
                    <span className='text-[10px] text-stone-400'>Header</span>
                </div>

                {/* Message Preview (32px) */}
                <div className='flex flex-col items-center gap-1.5'>
                    <div
                        className={cn(
                            'flex items-center justify-center rounded-full',
                            'bg-linear-to-br from-amber-100 to-amber-50',
                            'ring-1 ring-amber-200/60 ring-offset-1 ring-offset-white',
                            'shadow-md shadow-amber-500/10',
                            'h-8 w-8 overflow-hidden'
                        )}
                    >
                        <Image
                            src={imageUrl}
                            alt={agentName}
                            width={32}
                            height={32}
                            className='h-full w-full object-cover'
                        />
                    </div>
                    <span className='text-[10px] text-stone-400'>Message</span>
                </div>

                {/* Divider */}
                <div className='mx-2 h-12 w-px bg-stone-200' />

                {/* Fallback Icons for comparison */}
                <div className='flex flex-col items-center gap-1.5'>
                    <div className='flex gap-2'>
                        <div
                            className={cn(
                                'flex items-center justify-center rounded-full',
                                'bg-linear-to-br from-amber-100 to-amber-50',
                                'ring-1 ring-amber-200/60',
                                'h-8 w-8'
                            )}
                        >
                            <MessageCircle className='h-4 w-4 text-amber-600' />
                        </div>
                        <div
                            className={cn(
                                'flex items-center justify-center rounded-full',
                                'bg-linear-to-br from-amber-100 to-amber-50',
                                'ring-1 ring-amber-200/60',
                                'h-8 w-8'
                            )}
                        >
                            <Sparkles className='h-4 w-4 text-amber-600' />
                        </div>
                    </div>
                    <span className='text-[10px] text-stone-400'>
                        Fallback icons
                    </span>
                </div>
            </div>
        </div>
    )
}
