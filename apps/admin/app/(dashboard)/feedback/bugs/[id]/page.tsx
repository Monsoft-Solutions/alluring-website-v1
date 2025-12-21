import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import {
    ArrowLeft,
    Bug,
    Monitor,
    Globe,
    ExternalLink,
    AlertTriangle,
    CheckCircle,
    Clock,
    Image as ImageIcon,
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

import { getBugReportById } from '@/lib/queries/feedback.query'

/**
 * Validates that a URL uses only http or https protocols
 * to prevent XSS attacks via javascript:, data:, or vbscript: URLs
 */
function isValidHttpUrl(url: string): boolean {
    try {
        const parsed = new URL(url)
        return parsed.protocol === 'http:' || parsed.protocol === 'https:'
    } catch {
        return false
    }
}

export const dynamic = 'force-dynamic'
export const maxDuration = 30

type PageProps = {
    params: Promise<{ id: string }>
}

export default async function BugReportDetailPage({ params }: PageProps) {
    const { id } = await params
    const report = await getBugReportById(id)

    if (!report) {
        notFound()
    }

    return (
        <div className='space-y-6'>
            <div className='flex items-center gap-4'>
                <Button variant='ghost' size='sm' asChild>
                    <Link href='/feedback'>
                        <ArrowLeft className='mr-2 h-4 w-4' />
                        Back to Feedback
                    </Link>
                </Button>
            </div>

            <div className='flex items-start justify-between'>
                <div>
                    <h1 className='text-2xl font-semibold'>Bug Report</h1>
                    <p className='text-muted-foreground'>
                        Submitted{' '}
                        {new Intl.DateTimeFormat('en-US', {
                            dateStyle: 'full',
                            timeStyle: 'short',
                        }).format(new Date(report.createdAt))}
                    </p>
                </div>
                <div className='flex items-center gap-2'>
                    <SeverityBadge severity={report.severity} />
                    <StatusBadge status={report.status} />
                </div>
            </div>

            <div className='grid gap-6 lg:grid-cols-2'>
                {/* Bug Description */}
                <Card>
                    <CardHeader>
                        <CardTitle className='flex items-center gap-2'>
                            <Bug className='h-5 w-5' />
                            Bug Description
                        </CardTitle>
                        <CardDescription>
                            {isValidHttpUrl(report.pageUrl) ? (
                                <Link
                                    href={report.pageUrl}
                                    target='_blank'
                                    className='flex items-center gap-1 text-blue-600 hover:underline'
                                >
                                    {report.pageUrl}
                                    <ExternalLink className='h-3 w-3' />
                                </Link>
                            ) : (
                                <span className='text-muted-foreground'>
                                    {report.pageUrl}
                                </span>
                            )}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                        <div>
                            <h4 className='text-muted-foreground mb-1 text-xs uppercase'>
                                Description
                            </h4>
                            <p className='text-sm whitespace-pre-wrap'>
                                {report.description}
                            </p>
                        </div>

                        {report.stepsToReproduce && (
                            <div>
                                <h4 className='text-muted-foreground mb-1 text-xs uppercase'>
                                    Steps to Reproduce
                                </h4>
                                <p className='text-sm whitespace-pre-wrap'>
                                    {report.stepsToReproduce}
                                </p>
                            </div>
                        )}

                        {report.expectedBehavior && (
                            <div>
                                <h4 className='text-muted-foreground mb-1 text-xs uppercase'>
                                    Expected Behavior
                                </h4>
                                <p className='text-sm whitespace-pre-wrap'>
                                    {report.expectedBehavior}
                                </p>
                            </div>
                        )}

                        {report.actualBehavior && (
                            <div>
                                <h4 className='text-muted-foreground mb-1 text-xs uppercase'>
                                    Actual Behavior
                                </h4>
                                <p className='text-sm whitespace-pre-wrap'>
                                    {report.actualBehavior}
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Device & Browser Info */}
                <Card>
                    <CardHeader>
                        <CardTitle className='flex items-center gap-2'>
                            <Monitor className='h-5 w-5' />
                            Device Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-3'>
                        <DataRow
                            label='Device Type'
                            value={report.deviceType ?? 'Unknown'}
                        />
                        <DataRow
                            label='Browser'
                            value={
                                report.browserType
                                    ? `${report.browserType}${report.browserVersion ? ` ${report.browserVersion}` : ''}`
                                    : 'Unknown'
                            }
                        />
                        <DataRow
                            label='Screen Size'
                            value={report.screenSize ?? 'Unknown'}
                        />
                        {report.screenWidth && report.screenHeight && (
                            <DataRow
                                label='Screen Resolution'
                                value={`${report.screenWidth} × ${report.screenHeight}`}
                            />
                        )}
                        {report.viewportWidth && report.viewportHeight && (
                            <DataRow
                                label='Viewport Size'
                                value={`${report.viewportWidth} × ${report.viewportHeight}`}
                            />
                        )}
                        {report.devicePixelRatio && (
                            <DataRow
                                label='Pixel Ratio'
                                value={`${report.devicePixelRatio}x`}
                            />
                        )}
                        {report.timezone && (
                            <DataRow label='Timezone' value={report.timezone} />
                        )}
                        {report.language && (
                            <DataRow label='Language' value={report.language} />
                        )}
                        {report.connectionType && (
                            <DataRow
                                label='Connection'
                                value={report.connectionType}
                            />
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Screenshot & Reporter */}
            <div className='grid gap-6 lg:grid-cols-2'>
                {report.screenshotUrl && (
                    <Card>
                        <CardHeader>
                            <CardTitle className='flex items-center gap-2'>
                                <ImageIcon className='h-5 w-5' />
                                Screenshot
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <a
                                href={report.screenshotUrl}
                                target='_blank'
                                rel='noopener noreferrer'
                                className='relative block aspect-video w-full'
                            >
                                <Image
                                    src={report.screenshotUrl}
                                    alt='Bug screenshot'
                                    fill
                                    className='rounded-lg border object-contain'
                                    unoptimized
                                />
                            </a>
                        </CardContent>
                    </Card>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle className='flex items-center gap-2'>
                            <Globe className='h-5 w-5' />
                            Additional Info
                        </CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-3'>
                        {report.reporterName && (
                            <DataRow
                                label='Reporter Name'
                                value={report.reporterName}
                            />
                        )}
                        {report.reporterEmail && (
                            <DataRow
                                label='Reporter Email'
                                value={report.reporterEmail}
                            />
                        )}
                        {report.referrer && (
                            <DataRow
                                label='Referrer'
                                value={report.referrer}
                                truncate
                            />
                        )}
                        {report.ipAddress && (
                            <DataRow
                                label='IP Address'
                                value={report.ipAddress}
                            />
                        )}
                        {report.userAgent && (
                            <div>
                                <h4 className='text-muted-foreground mb-1 text-xs uppercase'>
                                    User Agent
                                </h4>
                                <p className='font-mono text-xs break-all'>
                                    {report.userAgent}
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

function SeverityBadge({ severity }: { severity: string | null }) {
    const config = {
        low: { variant: 'outline' as const, label: 'Low' },
        medium: { variant: 'secondary' as const, label: 'Medium' },
        high: { variant: 'default' as const, label: 'High' },
        critical: { variant: 'destructive' as const, label: 'Critical' },
    }

    const key = (severity ?? 'medium') as keyof typeof config
    const severityConfig = config[key] ?? config.medium

    return (
        <Badge variant={severityConfig.variant}>{severityConfig.label}</Badge>
    )
}

function StatusBadge({ status }: { status: string | null }) {
    const config = {
        new: { variant: 'default' as const, icon: AlertTriangle, label: 'New' },
        acknowledged: {
            variant: 'secondary' as const,
            icon: Clock,
            label: 'Acknowledged',
        },
        'in-progress': {
            variant: 'secondary' as const,
            icon: Clock,
            label: 'In Progress',
        },
        resolved: {
            variant: 'outline' as const,
            icon: CheckCircle,
            label: 'Resolved',
        },
        'wont-fix': {
            variant: 'outline' as const,
            icon: CheckCircle,
            label: "Won't Fix",
        },
    }

    const key = (status ?? 'new') as keyof typeof config
    const statusConfig = config[key] ?? config.new
    const Icon = statusConfig.icon

    return (
        <Badge variant={statusConfig.variant} className='gap-1'>
            <Icon className='h-3 w-3' />
            {statusConfig.label}
        </Badge>
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
                className={`col-span-2 ${truncate ? 'truncate' : ''}`}
                title={truncate ? value : undefined}
            >
                {value}
            </span>
        </div>
    )
}
