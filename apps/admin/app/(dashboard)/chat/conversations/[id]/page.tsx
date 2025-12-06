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
    Brain,
    Heart,
    Lightbulb,
    MessageSquareText,
    DollarSign,
    Timer,
    Flag,
    Plane,
    CheckCircle2,
    XCircle,
    AlertCircle,
    PhoneCall,
    Send,
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

/**
 * Budget indicator labels and colors
 */
const BUDGET_LABELS: Record<string, { label: string; color: string }> = {
    low: { label: 'Budget Conscious', color: 'bg-orange-100 text-orange-800' },
    medium: { label: 'Moderate Budget', color: 'bg-blue-100 text-blue-800' },
    high: { label: 'High Budget', color: 'bg-green-100 text-green-800' },
    premium: { label: 'Premium', color: 'bg-purple-100 text-purple-800' },
    unknown: { label: 'Unknown', color: 'bg-stone-100 text-stone-600' },
}

/**
 * Timeline labels
 */
const TIMELINE_LABELS: Record<string, string> = {
    within_week: 'Within a Week',
    within_month: 'Within a Month',
    within_3_months: 'Within 3 Months',
    within_6_months: 'Within 6 Months',
    within_year: 'Within a Year',
    flexible: 'Flexible',
    unknown: 'Unknown',
}

/**
 * Decision stage labels and colors
 */
const DECISION_STAGE_LABELS: Record<string, { label: string; color: string }> =
    {
        researching: {
            label: 'Researching',
            color: 'bg-stone-100 text-stone-700',
        },
        comparing: {
            label: 'Comparing Options',
            color: 'bg-blue-100 text-blue-800',
        },
        ready_to_book: {
            label: 'Ready to Book',
            color: 'bg-green-100 text-green-800',
        },
        post_op: {
            label: 'Post-Op Patient',
            color: 'bg-purple-100 text-purple-800',
        },
        unknown: { label: 'Unknown', color: 'bg-stone-100 text-stone-600' },
    }

/**
 * Patient type labels
 */
const PATIENT_TYPE_LABELS: Record<string, string> = {
    local: 'Local (Miami Area)',
    travel_domestic: 'Travel - Domestic',
    travel_international: 'Travel - International',
    unknown: 'Unknown',
}

/**
 * Sentiment labels and colors
 */
const SENTIMENT_LABELS: Record<
    string,
    { label: string; color: string; icon: typeof CheckCircle2 }
> = {
    positive: {
        label: 'Positive',
        color: 'text-green-600',
        icon: CheckCircle2,
    },
    neutral: { label: 'Neutral', color: 'text-stone-500', icon: AlertCircle },
    negative: { label: 'Negative', color: 'text-red-600', icon: XCircle },
    mixed: { label: 'Mixed', color: 'text-orange-500', icon: AlertCircle },
}

/**
 * Follow-up priority labels and colors
 */
const PRIORITY_LABELS: Record<string, { label: string; color: string }> = {
    urgent: {
        label: 'Urgent',
        color: 'bg-red-100 text-red-800 border-red-200',
    },
    high: {
        label: 'High',
        color: 'bg-orange-100 text-orange-800 border-orange-200',
    },
    normal: {
        label: 'Normal',
        color: 'bg-blue-100 text-blue-800 border-blue-200',
    },
    low: {
        label: 'Low',
        color: 'bg-stone-100 text-stone-700 border-stone-200',
    },
}

/**
 * Recommended action labels
 */
const ACTION_LABELS: Record<string, { label: string; description: string }> = {
    call_immediately: {
        label: 'Call Immediately',
        description: 'Hot lead - call right now',
    },
    schedule_callback: {
        label: 'Schedule Callback',
        description: 'Set up a call at their preferred time',
    },
    send_info: {
        label: 'Send Information',
        description: 'Email detailed procedure information',
    },
    send_pricing: {
        label: 'Send Pricing',
        description: 'Email pricing and financing details',
    },
    nurture: { label: 'Nurture', description: 'Add to nurture sequence' },
    no_action: { label: 'No Action', description: 'No follow-up needed' },
}

/**
 * Type definitions for JSONB fields
 */
type LeadProfile = {
    budgetIndicator?: string
    timeline?: string
    decisionStage?: string
    patientType?: string
}

type PsychographicData = {
    motivations?: string[]
    concerns?: string[]
    objections?: string[]
    sentiment?: string
}

type ContactPreference = {
    method?: string
    timeOfDay?: string
    language?: string
}

type ActionableIntelligence = {
    recommendedAction?: string
    followUpPriority?: string
    talkingPoints?: string[]
    contactPreference?: ContactPreference
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

            {/* Conversation Summary - Prominent display when available */}
            {session.conversationSummary && (
                <Card className='border-gold-200 bg-gold-50/50'>
                    <CardContent className='flex items-start gap-4 p-4'>
                        <div className='bg-gold-100 flex h-10 w-10 shrink-0 items-center justify-center rounded-full'>
                            <MessageSquareText className='text-gold-700 h-5 w-5' />
                        </div>
                        <div className='flex-1'>
                            <p className='text-gold-700 mb-1 text-xs font-medium uppercase'>
                                AI Summary
                            </p>
                            <p className='text-sm leading-relaxed text-stone-700'>
                                {session.conversationSummary}
                            </p>
                        </div>
                        {session.followUpPriority && (
                            <Badge
                                className={`shrink-0 ${PRIORITY_LABELS[session.followUpPriority]?.color ?? ''}`}
                            >
                                <Flag className='mr-1 h-3 w-3' />
                                {PRIORITY_LABELS[session.followUpPriority]
                                    ?.label ?? session.followUpPriority}
                            </Badge>
                        )}
                    </CardContent>
                </Card>
            )}

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

                    {/* Lead Profile Card */}
                    {session.leadProfile && (
                        <Card>
                            <CardHeader>
                                <CardTitle className='flex items-center gap-2'>
                                    <User className='h-5 w-5' />
                                    Lead Profile
                                </CardTitle>
                            </CardHeader>
                            <CardContent className='space-y-3'>
                                {(() => {
                                    const profile =
                                        session.leadProfile as LeadProfile
                                    return (
                                        <>
                                            {/* Budget */}
                                            <div className='flex items-center justify-between'>
                                                <div className='flex items-center gap-2'>
                                                    <DollarSign className='h-4 w-4 text-stone-400' />
                                                    <span className='text-sm'>
                                                        Budget
                                                    </span>
                                                </div>
                                                {profile.budgetIndicator && (
                                                    <Badge
                                                        variant='outline'
                                                        className={
                                                            BUDGET_LABELS[
                                                                profile
                                                                    .budgetIndicator
                                                            ]?.color ?? ''
                                                        }
                                                    >
                                                        {BUDGET_LABELS[
                                                            profile
                                                                .budgetIndicator
                                                        ]?.label ??
                                                            profile.budgetIndicator}
                                                    </Badge>
                                                )}
                                            </div>

                                            {/* Timeline */}
                                            <div className='flex items-center justify-between'>
                                                <div className='flex items-center gap-2'>
                                                    <Timer className='h-4 w-4 text-stone-400' />
                                                    <span className='text-sm'>
                                                        Timeline
                                                    </span>
                                                </div>
                                                <span className='text-sm text-stone-600'>
                                                    {TIMELINE_LABELS[
                                                        profile.timeline ??
                                                            'unknown'
                                                    ] ?? profile.timeline}
                                                </span>
                                            </div>

                                            {/* Decision Stage */}
                                            <div className='flex items-center justify-between'>
                                                <div className='flex items-center gap-2'>
                                                    <Target className='h-4 w-4 text-stone-400' />
                                                    <span className='text-sm'>
                                                        Stage
                                                    </span>
                                                </div>
                                                {profile.decisionStage && (
                                                    <Badge
                                                        variant='outline'
                                                        className={
                                                            DECISION_STAGE_LABELS[
                                                                profile
                                                                    .decisionStage
                                                            ]?.color ?? ''
                                                        }
                                                    >
                                                        {DECISION_STAGE_LABELS[
                                                            profile
                                                                .decisionStage
                                                        ]?.label ??
                                                            profile.decisionStage}
                                                    </Badge>
                                                )}
                                            </div>

                                            {/* Patient Type */}
                                            <div className='flex items-center justify-between'>
                                                <div className='flex items-center gap-2'>
                                                    <Plane className='h-4 w-4 text-stone-400' />
                                                    <span className='text-sm'>
                                                        Patient Type
                                                    </span>
                                                </div>
                                                <span className='text-sm text-stone-600'>
                                                    {PATIENT_TYPE_LABELS[
                                                        profile.patientType ??
                                                            'unknown'
                                                    ] ?? profile.patientType}
                                                </span>
                                            </div>
                                        </>
                                    )
                                })()}
                            </CardContent>
                        </Card>
                    )}

                    {/* Psychographic Insights Card */}
                    {session.psychographicData && (
                        <Card>
                            <CardHeader>
                                <CardTitle className='flex items-center gap-2'>
                                    <Brain className='h-5 w-5' />
                                    Psychographic Insights
                                </CardTitle>
                            </CardHeader>
                            <CardContent className='space-y-4'>
                                {(() => {
                                    const psycho =
                                        session.psychographicData as PsychographicData
                                    const SentimentIcon = psycho.sentiment
                                        ? (SENTIMENT_LABELS[psycho.sentiment]
                                              ?.icon ?? AlertCircle)
                                        : AlertCircle
                                    return (
                                        <>
                                            {/* Sentiment */}
                                            {psycho.sentiment && (
                                                <div className='flex items-center gap-2'>
                                                    <SentimentIcon
                                                        className={`h-5 w-5 ${SENTIMENT_LABELS[psycho.sentiment]?.color ?? ''}`}
                                                    />
                                                    <span className='text-sm font-medium'>
                                                        {SENTIMENT_LABELS[
                                                            psycho.sentiment
                                                        ]?.label ??
                                                            psycho.sentiment}{' '}
                                                        Sentiment
                                                    </span>
                                                </div>
                                            )}

                                            {/* Motivations */}
                                            {psycho.motivations &&
                                                psycho.motivations.length >
                                                    0 && (
                                                    <div>
                                                        <p className='mb-2 flex items-center gap-1 text-xs font-medium text-green-700 uppercase'>
                                                            <Heart className='h-3 w-3' />
                                                            Motivations
                                                        </p>
                                                        <ul className='space-y-1'>
                                                            {psycho.motivations.map(
                                                                (item, i) => (
                                                                    <li
                                                                        key={i}
                                                                        className='flex items-start gap-2 text-sm text-stone-600'
                                                                    >
                                                                        <span className='mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-green-400' />
                                                                        {item}
                                                                    </li>
                                                                )
                                                            )}
                                                        </ul>
                                                    </div>
                                                )}

                                            {/* Concerns */}
                                            {psycho.concerns &&
                                                psycho.concerns.length > 0 && (
                                                    <div>
                                                        <p className='mb-2 flex items-center gap-1 text-xs font-medium text-orange-700 uppercase'>
                                                            <AlertCircle className='h-3 w-3' />
                                                            Concerns
                                                        </p>
                                                        <ul className='space-y-1'>
                                                            {psycho.concerns.map(
                                                                (item, i) => (
                                                                    <li
                                                                        key={i}
                                                                        className='flex items-start gap-2 text-sm text-stone-600'
                                                                    >
                                                                        <span className='mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-400' />
                                                                        {item}
                                                                    </li>
                                                                )
                                                            )}
                                                        </ul>
                                                    </div>
                                                )}

                                            {/* Objections */}
                                            {psycho.objections &&
                                                psycho.objections.length >
                                                    0 && (
                                                    <div>
                                                        <p className='mb-2 flex items-center gap-1 text-xs font-medium text-red-700 uppercase'>
                                                            <XCircle className='h-3 w-3' />
                                                            Objections
                                                        </p>
                                                        <ul className='space-y-1'>
                                                            {psycho.objections.map(
                                                                (item, i) => (
                                                                    <li
                                                                        key={i}
                                                                        className='flex items-start gap-2 text-sm text-stone-600'
                                                                    >
                                                                        <span className='mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-400' />
                                                                        {item}
                                                                    </li>
                                                                )
                                                            )}
                                                        </ul>
                                                    </div>
                                                )}
                                        </>
                                    )
                                })()}
                            </CardContent>
                        </Card>
                    )}

                    {/* Actionable Intelligence Card */}
                    {session.actionableIntelligence && (
                        <Card>
                            <CardHeader>
                                <CardTitle className='flex items-center gap-2'>
                                    <Lightbulb className='h-5 w-5' />
                                    Recommended Actions
                                </CardTitle>
                            </CardHeader>
                            <CardContent className='space-y-4'>
                                {(() => {
                                    const intel =
                                        session.actionableIntelligence as ActionableIntelligence
                                    return (
                                        <>
                                            {/* Recommended Action */}
                                            {intel.recommendedAction && (
                                                <div className='rounded-lg bg-stone-50 p-3'>
                                                    <div className='flex items-center gap-2'>
                                                        {intel.recommendedAction ===
                                                        'call_immediately' ? (
                                                            <PhoneCall className='h-5 w-5 text-green-600' />
                                                        ) : (
                                                            <Send className='h-5 w-5 text-blue-600' />
                                                        )}
                                                        <span className='font-medium'>
                                                            {ACTION_LABELS[
                                                                intel
                                                                    .recommendedAction
                                                            ]?.label ??
                                                                intel.recommendedAction}
                                                        </span>
                                                    </div>
                                                    <p className='mt-1 text-sm text-stone-500'>
                                                        {
                                                            ACTION_LABELS[
                                                                intel
                                                                    .recommendedAction
                                                            ]?.description
                                                        }
                                                    </p>
                                                </div>
                                            )}

                                            {/* Contact Preference */}
                                            {intel.contactPreference && (
                                                <div className='space-y-1 text-sm'>
                                                    {intel.contactPreference
                                                        .method && (
                                                        <p>
                                                            <span className='text-stone-500'>
                                                                Preferred
                                                                contact:
                                                            </span>{' '}
                                                            <span className='font-medium capitalize'>
                                                                {
                                                                    intel
                                                                        .contactPreference
                                                                        .method
                                                                }
                                                            </span>
                                                        </p>
                                                    )}
                                                    {intel.contactPreference
                                                        .timeOfDay && (
                                                        <p>
                                                            <span className='text-stone-500'>
                                                                Best time:
                                                            </span>{' '}
                                                            <span className='font-medium'>
                                                                {
                                                                    intel
                                                                        .contactPreference
                                                                        .timeOfDay
                                                                }
                                                            </span>
                                                        </p>
                                                    )}
                                                    {intel.contactPreference
                                                        .language && (
                                                        <p>
                                                            <span className='text-stone-500'>
                                                                Language:
                                                            </span>{' '}
                                                            <span className='font-medium'>
                                                                {
                                                                    intel
                                                                        .contactPreference
                                                                        .language
                                                                }
                                                            </span>
                                                        </p>
                                                    )}
                                                </div>
                                            )}

                                            {/* Talking Points */}
                                            {intel.talkingPoints &&
                                                intel.talkingPoints.length >
                                                    0 && (
                                                    <div className='border-t pt-3'>
                                                        <p className='mb-2 text-xs font-medium text-stone-500 uppercase'>
                                                            Talking Points for
                                                            Follow-up
                                                        </p>
                                                        <ul className='space-y-2'>
                                                            {intel.talkingPoints.map(
                                                                (point, i) => (
                                                                    <li
                                                                        key={i}
                                                                        className='flex items-start gap-2 rounded-md bg-blue-50 p-2 text-sm text-blue-900'
                                                                    >
                                                                        <CheckCircle2 className='mt-0.5 h-4 w-4 shrink-0 text-blue-500' />
                                                                        {point}
                                                                    </li>
                                                                )
                                                            )}
                                                        </ul>
                                                    </div>
                                                )}
                                        </>
                                    )
                                })()}
                            </CardContent>
                        </Card>
                    )}

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
