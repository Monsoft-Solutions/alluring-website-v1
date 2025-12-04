import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
    ArrowLeft,
    Mail,
    Phone,
    Clock,
    MapPin,
    Globe,
    MousePointerClick,
    BarChart3,
} from 'lucide-react'

import { Button } from '@workspace/ui/components/button'
import { Badge } from '@workspace/ui/components/badge'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card'

import { getContactById } from '@/lib/queries/contacts.query'

export const dynamic = 'force-dynamic'

type PageProps = {
    params: Promise<{ id: string }>
}

export default async function ContactDetailPage({ params }: PageProps) {
    const { id } = await params
    const contact = await getContactById(id)

    if (!contact) {
        notFound()
    }

    const fullName =
        contact.firstName && contact.lastName
            ? `${contact.firstName} ${contact.lastName}`
            : contact.name

    const hasUtmData =
        contact.utmSource ||
        contact.utmMedium ||
        contact.utmCampaign ||
        contact.utmContent ||
        contact.utmTerm ||
        contact.gclid ||
        contact.fbclid ||
        contact.ttclid ||
        contact.referrer ||
        contact.landingPage

    return (
        <div className='space-y-6'>
            <div className='flex items-center gap-4'>
                <Button variant='ghost' size='sm' asChild>
                    <Link href='/contacts'>
                        <ArrowLeft className='mr-2 h-4 w-4' />
                        Back to Contacts
                    </Link>
                </Button>
            </div>

            <div className='flex items-start justify-between'>
                <div>
                    <h1 className='text-2xl font-semibold'>{fullName}</h1>
                    <p className='text-muted-foreground'>
                        Submitted{' '}
                        {new Intl.DateTimeFormat('en-US', {
                            dateStyle: 'full',
                            timeStyle: 'short',
                        }).format(new Date(contact.createdAt))}
                    </p>
                </div>
                <div className='flex items-center gap-2'>
                    <Button variant='outline' asChild>
                        <a href={`mailto:${contact.email}`}>
                            <Mail className='mr-2 h-4 w-4' />
                            Send Email
                        </a>
                    </Button>
                    {contact.phone && (
                        <Button variant='outline' asChild>
                            <a href={`tel:${contact.phone}`}>
                                <Phone className='mr-2 h-4 w-4' />
                                Call
                            </a>
                        </Button>
                    )}
                </div>
            </div>

            <div className='grid gap-6 lg:grid-cols-2'>
                {/* Contact Info */}
                <Card>
                    <CardHeader>
                        <CardTitle>Contact Information</CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                        <InfoRow
                            icon={Mail}
                            label='Email'
                            value={
                                <a
                                    href={`mailto:${contact.email}`}
                                    className='text-blue-600 hover:underline'
                                >
                                    {contact.email}
                                </a>
                            }
                        />
                        {contact.phone && (
                            <InfoRow
                                icon={Phone}
                                label='Phone'
                                value={
                                    <a
                                        href={`tel:${contact.phone}`}
                                        className='text-blue-600 hover:underline'
                                    >
                                        {contact.phone}
                                    </a>
                                }
                            />
                        )}
                        {contact.procedure && (
                            <InfoRow
                                label='Procedure of Interest'
                                value={
                                    <Badge variant='secondary'>
                                        {contact.procedure}
                                    </Badge>
                                }
                            />
                        )}
                        {contact.preferredContactTime && (
                            <InfoRow
                                icon={Clock}
                                label='Preferred Contact Time'
                                value={contact.preferredContactTime}
                            />
                        )}
                        {contact.source && (
                            <InfoRow label='Source' value={contact.source} />
                        )}
                    </CardContent>
                </Card>

                {/* Message */}
                <Card>
                    <CardHeader>
                        <CardTitle>Message</CardTitle>
                        {contact.subject && (
                            <CardDescription>
                                Subject: {contact.subject}
                            </CardDescription>
                        )}
                    </CardHeader>
                    <CardContent>
                        {contact.message ? (
                            <p className='text-sm whitespace-pre-wrap'>
                                {contact.message}
                            </p>
                        ) : (
                            <p className='text-muted-foreground text-sm italic'>
                                No message provided
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Analytics Data */}
            {hasUtmData && (
                <div className='grid gap-6 lg:grid-cols-2'>
                    {/* UTM Parameters */}
                    {(contact.utmSource ||
                        contact.utmMedium ||
                        contact.utmCampaign ||
                        contact.utmContent ||
                        contact.utmTerm) && (
                        <Card>
                            <CardHeader>
                                <CardTitle className='flex items-center gap-2'>
                                    <MousePointerClick className='h-5 w-5' />
                                    UTM Parameters
                                </CardTitle>
                                <CardDescription>
                                    Campaign tracking data
                                </CardDescription>
                            </CardHeader>
                            <CardContent className='space-y-3'>
                                {contact.utmSource && (
                                    <DataRow
                                        label='Source'
                                        value={contact.utmSource}
                                    />
                                )}
                                {contact.utmMedium && (
                                    <DataRow
                                        label='Medium'
                                        value={contact.utmMedium}
                                    />
                                )}
                                {contact.utmCampaign && (
                                    <DataRow
                                        label='Campaign'
                                        value={contact.utmCampaign}
                                    />
                                )}
                                {contact.utmContent && (
                                    <DataRow
                                        label='Content'
                                        value={contact.utmContent}
                                    />
                                )}
                                {contact.utmTerm && (
                                    <DataRow
                                        label='Term'
                                        value={contact.utmTerm}
                                    />
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Ad Platform & Session Data */}
                    <Card>
                        <CardHeader>
                            <CardTitle className='flex items-center gap-2'>
                                <BarChart3 className='h-5 w-5' />
                                Session & Attribution
                            </CardTitle>
                        </CardHeader>
                        <CardContent className='space-y-3'>
                            {contact.gclid && (
                                <DataRow
                                    label='Google Ads (gclid)'
                                    value={contact.gclid}
                                    truncate
                                />
                            )}
                            {contact.fbclid && (
                                <DataRow
                                    label='Meta Ads (fbclid)'
                                    value={contact.fbclid}
                                    truncate
                                />
                            )}
                            {contact.ttclid && (
                                <DataRow
                                    label='TikTok Ads (ttclid)'
                                    value={contact.ttclid}
                                    truncate
                                />
                            )}
                            {contact.referrer && (
                                <DataRow
                                    label='Referrer'
                                    value={contact.referrer}
                                    truncate
                                />
                            )}
                            {contact.landingPage && (
                                <DataRow
                                    label='Landing Page'
                                    value={contact.landingPage}
                                    truncate
                                />
                            )}
                            {contact.ipAddress && (
                                <DataRow
                                    label='IP Address'
                                    value={contact.ipAddress}
                                />
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}

function InfoRow({
    icon: Icon,
    label,
    value,
}: {
    icon?: React.ComponentType<{ className?: string }>
    label: string
    value: React.ReactNode
}) {
    return (
        <div className='flex items-start gap-3'>
            {Icon && <Icon className='text-muted-foreground mt-0.5 h-4 w-4' />}
            <div className={!Icon ? 'ml-7' : ''}>
                <p className='text-muted-foreground text-xs uppercase'>
                    {label}
                </p>
                <div className='font-medium'>{value}</div>
            </div>
        </div>
    )
}

function DataRow({
    label,
    value,
    truncate = false,
}: {
    label: string
    value: string
    truncate?: boolean
}) {
    return (
        <div className='grid grid-cols-3 gap-2 text-sm'>
            <span className='text-muted-foreground'>{label}:</span>
            <span
                className={`col-span-2 font-mono text-xs ${truncate ? 'truncate' : ''}`}
                title={truncate ? value : undefined}
            >
                {value}
            </span>
        </div>
    )
}
