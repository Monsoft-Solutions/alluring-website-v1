/**
 * Chat Conversation Detail Page
 *
 * Displays full conversation history with contact details.
 *
 * @module app/(dashboard)/chat/conversations/[id]/page
 */
import { notFound } from 'next/navigation'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card'
import {
    ArrowLeft,
    Phone,
    Mail,
    Globe,
    Calendar,
    User,
    Bot,
    Clock,
    MapPin,
} from 'lucide-react'
import Link from 'next/link'

import { getChatSessionWithMessages } from '@/lib/queries/chat.query'
import { formatMessageTime, formatPhoneNumber } from '@workspace/chat/utils'

export const dynamic = 'force-dynamic'

type PageProps = {
    params: Promise<{ id: string }>
}

export default async function ConversationDetailPage({ params }: PageProps) {
    const { id } = await params
    const data = await getChatSessionWithMessages(id)

    if (!data) {
        notFound()
    }

    const { session, messages } = data

    return (
        <div className='space-y-6'>
            {/* Header */}
            <div className='flex items-center gap-4'>
                <Button asChild variant='ghost' size='sm'>
                    <Link href='/chat/conversations'>
                        <ArrowLeft className='mr-2 h-4 w-4' />
                        Back to Conversations
                    </Link>
                </Button>
            </div>

            <div className='grid gap-6 lg:grid-cols-3'>
                {/* Conversation */}
                <div className='lg:col-span-2'>
                    <Card className='h-full'>
                        <CardHeader className='border-b'>
                            <div className='flex items-center justify-between'>
                                <CardTitle>Conversation</CardTitle>
                                <Badge
                                    variant={
                                        session.status === 'active'
                                            ? 'default'
                                            : 'secondary'
                                    }
                                >
                                    {session.status}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className='max-h-[600px] overflow-y-auto p-4'>
                            {messages.length === 0 ? (
                                <p className='text-muted-foreground py-8 text-center'>
                                    No messages in this conversation
                                </p>
                            ) : (
                                <div className='space-y-4'>
                                    {messages.map((message) => (
                                        <div
                                            key={message.id}
                                            className={`flex gap-3 ${
                                                message.role === 'user'
                                                    ? 'flex-row-reverse'
                                                    : 'flex-row'
                                            }`}
                                        >
                                            {/* Avatar */}
                                            <div
                                                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                                                    message.role === 'user'
                                                        ? 'bg-stone-900 text-white'
                                                        : 'bg-gold-100 text-gold-700'
                                                }`}
                                            >
                                                {message.role === 'user' ? (
                                                    <User className='h-4 w-4' />
                                                ) : (
                                                    <Bot className='h-4 w-4' />
                                                )}
                                            </div>

                                            {/* Message */}
                                            <div
                                                className={`flex max-w-[80%] flex-col gap-1 ${
                                                    message.role === 'user'
                                                        ? 'items-end'
                                                        : 'items-start'
                                                }`}
                                            >
                                                <div className='flex items-center gap-2 text-xs text-stone-500'>
                                                    <span className='font-medium'>
                                                        {message.role === 'user'
                                                            ? session.fullName.split(
                                                                  ' '
                                                              )[0]
                                                            : 'Assistant'}
                                                    </span>
                                                    <span>
                                                        {formatMessageTime(
                                                            message.createdAt
                                                        )}
                                                    </span>
                                                </div>
                                                <div
                                                    className={`rounded-2xl px-4 py-2.5 text-sm ${
                                                        message.role === 'user'
                                                            ? 'rounded-tr-sm bg-stone-900 text-white'
                                                            : 'rounded-tl-sm bg-stone-100 text-stone-900'
                                                    }`}
                                                >
                                                    {message.content}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Contact Info */}
                <div className='space-y-6'>
                    <Card>
                        <CardHeader>
                            <CardTitle>Contact Information</CardTitle>
                        </CardHeader>
                        <CardContent className='space-y-4'>
                            <div className='flex items-center gap-3'>
                                <div className='flex h-10 w-10 items-center justify-center rounded-full bg-stone-100'>
                                    <User className='h-5 w-5 text-stone-600' />
                                </div>
                                <div>
                                    <p className='font-medium'>
                                        {session.fullName}
                                    </p>
                                    <p className='text-muted-foreground text-sm'>
                                        Lead
                                    </p>
                                </div>
                            </div>

                            <div className='space-y-3 border-t pt-4'>
                                <div className='flex items-center gap-2 text-sm'>
                                    <Phone className='text-muted-foreground h-4 w-4' />
                                    <a
                                        href={`tel:${session.phone}`}
                                        className='hover:underline'
                                    >
                                        {formatPhoneNumber(session.phone)}
                                    </a>
                                </div>

                                {session.email && (
                                    <div className='flex items-center gap-2 text-sm'>
                                        <Mail className='text-muted-foreground h-4 w-4' />
                                        <a
                                            href={`mailto:${session.email}`}
                                            className='hover:underline'
                                        >
                                            {session.email}
                                        </a>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Session Details</CardTitle>
                        </CardHeader>
                        <CardContent className='space-y-3'>
                            <div className='flex items-center gap-2 text-sm'>
                                <Calendar className='text-muted-foreground h-4 w-4' />
                                <span>
                                    Started{' '}
                                    {new Date(
                                        session.createdAt
                                    ).toLocaleString()}
                                </span>
                            </div>

                            <div className='flex items-center gap-2 text-sm'>
                                <Clock className='text-muted-foreground h-4 w-4' />
                                <span>{session.messageCount} messages</span>
                            </div>

                            {session.pageUrl && (
                                <div className='flex items-center gap-2 text-sm'>
                                    <Globe className='text-muted-foreground h-4 w-4' />
                                    <span
                                        className='truncate'
                                        title={session.pageUrl}
                                    >
                                        {getPathname(session.pageUrl)}
                                    </span>
                                </div>
                            )}

                            {session.ipAddress && (
                                <div className='flex items-center gap-2 text-sm'>
                                    <MapPin className='text-muted-foreground h-4 w-4' />
                                    <span>{session.ipAddress}</span>
                                </div>
                            )}

                            {/* UTM Data */}
                            {(session.utmSource ||
                                session.utmMedium ||
                                session.utmCampaign) && (
                                <div className='border-t pt-3'>
                                    <p className='text-muted-foreground mb-2 text-xs font-medium uppercase'>
                                        Attribution
                                    </p>
                                    {session.utmSource && (
                                        <p className='text-sm'>
                                            Source: {session.utmSource}
                                        </p>
                                    )}
                                    {session.utmMedium && (
                                        <p className='text-sm'>
                                            Medium: {session.utmMedium}
                                        </p>
                                    )}
                                    {session.utmCampaign && (
                                        <p className='text-sm'>
                                            Campaign: {session.utmCampaign}
                                        </p>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

function getPathname(url: string): string {
    try {
        return new URL(url).pathname
    } catch {
        return url || '/'
    }
}
