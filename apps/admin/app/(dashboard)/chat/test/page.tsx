/**
 * Chat Test Page
 *
 * Admin page for testing the chat agent with real AI responses.
 *
 * @module app/(dashboard)/chat/test/page
 */
import { Button } from '@workspace/ui/components/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

import { env } from '@/env'
import { getChatConfig } from '@/lib/queries/chat.query'
import { ChatTestInterface } from '@/components/chat/chat-test-interface.component'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

export default async function ChatTestPage() {
    const config = await getChatConfig()
    const hasApiKey = Boolean(env.OPENROUTER_API_KEY)

    return (
        <div className='space-y-6'>
            {/* Header */}
            <div className='flex items-center gap-4'>
                <Button asChild variant='ghost' size='sm'>
                    <Link href='/chat'>
                        <ArrowLeft className='mr-2 h-4 w-4' />
                        Back to Chat
                    </Link>
                </Button>
            </div>

            <div>
                <h1 className='text-2xl font-semibold'>Test Chat Agent</h1>
                <p className='text-muted-foreground'>
                    Test how your chat agent responds to messages
                </p>
            </div>

            {/* Test Interface */}
            <div className='mx-auto max-w-2xl'>
                <ChatTestInterface
                    welcomeMessage={config.welcomeMessage}
                    agentName={config.agentName}
                    hasApiKey={hasApiKey}
                />
            </div>
        </div>
    )
}
