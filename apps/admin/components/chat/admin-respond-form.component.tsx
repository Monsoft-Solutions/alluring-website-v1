/**
 * Admin Respond Form Component
 *
 * Form for admins to send messages to escalated chat sessions.
 *
 * @module components/chat/admin-respond-form
 */
'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Send, Loader2 } from 'lucide-react'

import { Button } from '@workspace/ui/components/button'
import { Textarea } from '@workspace/ui/components/textarea'

type AdminRespondFormProps = {
    sessionId: string
    /** Admin name to include in the message */
    adminName?: string
}

export function AdminRespondForm({
    sessionId,
    adminName = 'Team Member',
}: AdminRespondFormProps) {
    const router = useRouter()
    const [message, setMessage] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault()

            if (!message.trim() || isSubmitting) return

            setIsSubmitting(true)
            setError(null)

            try {
                const response = await fetch('/api/chat/respond', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        sessionId,
                        message: message.trim(),
                        adminName,
                    }),
                })

                const data = await response.json()

                if (data.success) {
                    setMessage('')
                    router.refresh()
                } else {
                    setError(data.error ?? 'Failed to send message')
                }
            } catch {
                setError('An unexpected error occurred')
            } finally {
                setIsSubmitting(false)
            }
        },
        [sessionId, message, adminName, isSubmitting, router]
    )

    return (
        <form onSubmit={handleSubmit} className='space-y-3'>
            {error && (
                <div className='rounded-lg bg-red-50 p-2 text-sm text-red-600'>
                    {error}
                </div>
            )}

            <div className='relative'>
                <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder='Type your response...'
                    rows={3}
                    disabled={isSubmitting}
                    className='resize-none pr-12'
                />
            </div>

            <div className='flex items-center justify-between'>
                <p className='text-muted-foreground text-xs'>
                    Sending as {adminName}
                </p>
                <Button
                    type='submit'
                    disabled={!message.trim() || isSubmitting}
                    size='sm'
                >
                    {isSubmitting ? (
                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    ) : (
                        <Send className='mr-2 h-4 w-4' />
                    )}
                    Send Response
                </Button>
            </div>
        </form>
    )
}
