/**
 * Chat Escalations Page
 *
 * Displays escalated chat sessions that need human attention.
 * Allows admins to claim and respond to escalated conversations.
 *
 * @module app/(dashboard)/chat/escalations/page
 */
import Link from 'next/link'
import {
    ArrowLeft,
    AlertTriangle,
    MessageCircle,
    Clock,
    User,
    Phone,
} from 'lucide-react'

import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card'

import { getEscalatedSessions } from '@/lib/queries/chat.query'
import { formatRelativeTime, formatPhoneNumber } from '@workspace/chat/utils'
import { getGradeColor } from '@workspace/chat/services'

export const dynamic = 'force-dynamic'

export default async function EscalationsPage() {
    const escalatedSessions = await getEscalatedSessions()

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

            <div className='flex items-center justify-between'>
                <div>
                    <h1 className='flex items-center gap-2 text-2xl font-semibold'>
                        <AlertTriangle className='h-6 w-6 text-orange-500' />
                        Escalated Conversations
                    </h1>
                    <p className='text-muted-foreground'>
                        {escalatedSessions.length} conversation
                        {escalatedSessions.length !== 1 ? 's' : ''} need
                        {escalatedSessions.length === 1 ? 's' : ''} attention
                    </p>
                </div>
            </div>

            {/* Stats */}
            <div className='grid gap-4 md:grid-cols-3'>
                <Card>
                    <CardHeader className='pb-2'>
                        <CardTitle className='text-sm font-medium'>
                            Pending
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className='text-2xl font-bold text-orange-600'>
                            {
                                escalatedSessions.filter((s) => !s.assignedTo)
                                    .length
                            }
                        </div>
                        <p className='text-muted-foreground text-xs'>
                            Unassigned escalations
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className='pb-2'>
                        <CardTitle className='text-sm font-medium'>
                            Assigned
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className='text-2xl font-bold text-blue-600'>
                            {
                                escalatedSessions.filter((s) => s.assignedTo)
                                    .length
                            }
                        </div>
                        <p className='text-muted-foreground text-xs'>
                            Being handled
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className='pb-2'>
                        <CardTitle className='text-sm font-medium'>
                            Avg Wait Time
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className='text-2xl font-bold'>
                            {calculateAvgWaitTime(escalatedSessions)}
                        </div>
                        <p className='text-muted-foreground text-xs'>
                            Since escalation
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Escalated Sessions List */}
            {escalatedSessions.length === 0 ? (
                <Card>
                    <CardContent className='flex flex-col items-center justify-center py-12'>
                        <div className='mb-4 rounded-full bg-green-100 p-4'>
                            <MessageCircle className='h-8 w-8 text-green-600' />
                        </div>
                        <h3 className='mb-2 text-lg font-semibold'>
                            All caught up!
                        </h3>
                        <p className='text-muted-foreground text-center'>
                            No conversations need human attention right now.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className='space-y-4'>
                    {escalatedSessions.map((session) => (
                        <Card
                            key={session.id}
                            className='border-l-4 border-l-orange-500'
                        >
                            <CardHeader className='pb-2'>
                                <div className='flex items-start justify-between'>
                                    <div className='flex items-center gap-3'>
                                        <div className='flex h-10 w-10 items-center justify-center rounded-full bg-orange-100'>
                                            <User className='h-5 w-5 text-orange-600' />
                                        </div>
                                        <div>
                                            <CardTitle className='text-base'>
                                                {session.fullName}
                                            </CardTitle>
                                            <CardDescription className='flex items-center gap-2'>
                                                <Phone className='h-3 w-3' />
                                                {formatPhoneNumber(
                                                    session.phone
                                                )}
                                            </CardDescription>
                                        </div>
                                    </div>
                                    <div className='flex items-center gap-2'>
                                        {session.leadGrade && (
                                            <Badge
                                                variant='outline'
                                                className={getGradeColor(
                                                    session.leadGrade as
                                                        | 'A'
                                                        | 'B'
                                                        | 'C'
                                                        | 'D'
                                                )}
                                            >
                                                {session.leadGrade}
                                            </Badge>
                                        )}
                                        <Badge variant='destructive'>
                                            <AlertTriangle className='mr-1 h-3 w-3' />
                                            Escalated
                                        </Badge>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className='flex items-center justify-between'>
                                    <div className='text-muted-foreground flex items-center gap-4 text-sm'>
                                        <span className='flex items-center gap-1'>
                                            <MessageCircle className='h-4 w-4' />
                                            {session.messageCount} messages
                                        </span>
                                        <span className='flex items-center gap-1'>
                                            <Clock className='h-4 w-4' />
                                            Escalated{' '}
                                            {session.escalatedAt
                                                ? formatRelativeTime(
                                                      session.escalatedAt
                                                  )
                                                : 'recently'}
                                        </span>
                                        {session.escalationReason && (
                                            <span className='text-stone-500'>
                                                Reason:{' '}
                                                {session.escalationReason.replace(
                                                    /_/g,
                                                    ' '
                                                )}
                                            </span>
                                        )}
                                    </div>
                                    <div className='flex items-center gap-2'>
                                        {session.assignedTo ? (
                                            <Badge variant='secondary'>
                                                Assigned to {session.assignedTo}
                                            </Badge>
                                        ) : (
                                            <Badge variant='outline'>
                                                Unassigned
                                            </Badge>
                                        )}
                                        <Button asChild size='sm'>
                                            <Link
                                                href={`/chat/conversations/${session.id}`}
                                            >
                                                View Conversation
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}

/**
 * Calculate average wait time for escalated sessions
 */
function calculateAvgWaitTime(
    sessions: Array<{ escalatedAt: Date | null }>
): string {
    if (sessions.length === 0) return '—'

    const now = new Date()
    let totalMinutes = 0
    let count = 0

    for (const session of sessions) {
        if (session.escalatedAt) {
            const diffMs = now.getTime() - session.escalatedAt.getTime()
            totalMinutes += diffMs / (1000 * 60)
            count++
        }
    }

    if (count === 0) return '—'

    const avgMinutes = Math.round(totalMinutes / count)

    if (avgMinutes < 60) {
        return `${avgMinutes}m`
    }

    const hours = Math.floor(avgMinutes / 60)
    const minutes = avgMinutes % 60

    return `${hours}h ${minutes}m`
}
