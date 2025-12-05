/**
 * Chat Conversation Detail Page
 *
 * Displays full conversation history with contact details,
 * lead scoring, intent classification, and escalation status.
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
    Target,
    TrendingUp,
    AlertTriangle,
    Tag,
} from 'lucide-react'
import Link from 'next/link'

import { getChatSessionWithMessages } from '@/lib/queries/chat.query'
import { formatMessageTime, formatPhoneNumber } from '@workspace/chat/utils'
import { getGradeColor } from '@workspace/chat/services'
import { AdminRespondForm } from '@/components/chat/admin-respond-form.component'

/**
 * Intent labels for display
 */
const INTENT_LABELS: Record<string, string> = {
    consultation_request: 'Consultation Request',
    pricing_inquiry: 'Pricing Inquiry',
    procedure_info: 'Procedure Information',
    post_op_question: 'Post-Op Question',
    financing_inquiry: 'Financing Inquiry',
    general_inquiry: 'General Inquiry',
    complaint: 'Complaint',
    unknown: 'Unknown',
}

/**
 * Procedure labels for display
 */
const PROCEDURE_LABELS: Record<string, string> = {
    bbl: 'BBL',
    breast_augmentation: 'Breast Augmentation',
    breast_lift: 'Breast Lift',
    breast_reduction: 'Breast Reduction',
    tummy_tuck: 'Tummy Tuck',
    liposuction: 'Liposuction',
    mommy_makeover: 'Mommy Makeover',
    facelift: 'Facelift',
    rhinoplasty: 'Rhinoplasty',
    blepharoplasty: 'Blepharoplasty',
    brow_lift: 'Brow Lift',
    chin_augmentation: 'Chin Augmentation',
    lip_augmentation: 'Lip Augmentation',
    botox: 'Botox',
    fillers: 'Fillers',
}

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
                        <CardContent className='max-h-[500px] overflow-y-auto p-4'>
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

                        {/* Admin Respond Form for escalated sessions */}
                        {session.isEscalated && (
                            <div className='border-t p-4'>
                                <p className='text-muted-foreground mb-3 text-xs font-medium uppercase'>
                                    Send Response
                                </p>
                                <AdminRespondForm sessionId={session.id} />
                            </div>
                        )}
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

                    {/* Lead Score & Intent Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className='flex items-center gap-2'>
                                <TrendingUp className='h-5 w-5' />
                                Lead Intelligence
                            </CardTitle>
                        </CardHeader>
                        <CardContent className='space-y-4'>
                            {/* Lead Grade */}
                            <div className='flex items-center justify-between'>
                                <span className='text-sm font-medium'>
                                    Lead Grade
                                </span>
                                {session.leadGrade ? (
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
                                        {session.leadGrade} ({session.leadScore}
                                        )
                                    </Badge>
                                ) : (
                                    <span className='text-muted-foreground text-sm'>
                                        Not scored
                                    </span>
                                )}
                            </div>

                            {/* Intent */}
                            <div className='flex items-center justify-between'>
                                <span className='text-sm font-medium'>
                                    Intent
                                </span>
                                {session.primaryIntent ? (
                                    <div className='flex items-center gap-1'>
                                        <Target className='h-4 w-4 text-stone-500' />
                                        <span className='text-sm'>
                                            {INTENT_LABELS[
                                                session.primaryIntent
                                            ] ?? session.primaryIntent}
                                        </span>
                                    </div>
                                ) : (
                                    <span className='text-muted-foreground text-sm'>
                                        Not classified
                                    </span>
                                )}
                            </div>

                            {/* Detected Procedures */}
                            {session.detectedProcedures &&
                                (session.detectedProcedures as string[])
                                    .length > 0 && (
                                    <div className='border-t pt-3'>
                                        <p className='text-muted-foreground mb-2 text-xs font-medium uppercase'>
                                            Procedures Mentioned
                                        </p>
                                        <div className='flex flex-wrap gap-1'>
                                            {(
                                                session.detectedProcedures as string[]
                                            ).map((proc) => (
                                                <Badge
                                                    key={proc}
                                                    variant='outline'
                                                    className='text-xs'
                                                >
                                                    {PROCEDURE_LABELS[proc] ??
                                                        proc}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}

                            {/* Tags */}
                            {session.tags &&
                                (session.tags as string[]).length > 0 && (
                                    <div className='border-t pt-3'>
                                        <p className='text-muted-foreground mb-2 text-xs font-medium uppercase'>
                                            Tags
                                        </p>
                                        <div className='flex flex-wrap gap-1'>
                                            {(session.tags as string[]).map(
                                                (tag) => (
                                                    <Badge
                                                        key={tag}
                                                        variant='secondary'
                                                        className='text-xs'
                                                    >
                                                        <Tag className='mr-1 h-3 w-3' />
                                                        {tag.replace(/_/g, ' ')}
                                                    </Badge>
                                                )
                                            )}
                                        </div>
                                    </div>
                                )}

                            {/* Escalation Status */}
                            {session.isEscalated && (
                                <div className='border-t pt-3'>
                                    <div className='flex items-center gap-2 rounded-lg bg-orange-50 p-3'>
                                        <AlertTriangle className='h-5 w-5 text-orange-500' />
                                        <div>
                                            <p className='text-sm font-medium text-orange-800'>
                                                Escalated
                                            </p>
                                            {session.escalationReason && (
                                                <p className='text-xs text-orange-600'>
                                                    {session.escalationReason}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
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
