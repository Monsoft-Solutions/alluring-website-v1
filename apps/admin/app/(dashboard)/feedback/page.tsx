import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent } from '@workspace/ui/components/card'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@workspace/ui/components/table'
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@workspace/ui/components/tabs'
import { Bug, MessageSquare, ExternalLink, Eye } from 'lucide-react'
import Link from 'next/link'

import { getBugReports, getBetaFeedback } from '@/lib/queries/feedback.query'

export const dynamic = 'force-dynamic'

export default async function FeedbackPage() {
    const [bugReportsData, betaFeedbackData] = await Promise.all([
        getBugReports(1, 20),
        getBetaFeedback(1, 20),
    ])

    return (
        <div className='space-y-6'>
            <div>
                <h1 className='text-2xl font-semibold'>Feedback</h1>
                <p className='text-muted-foreground'>
                    View bug reports and beta feedback submissions
                </p>
            </div>

            <Tabs defaultValue='bugs' className='space-y-4'>
                <TabsList>
                    <TabsTrigger value='bugs' className='gap-2'>
                        <Bug className='h-4 w-4' />
                        Bug Reports ({bugReportsData.total})
                    </TabsTrigger>
                    <TabsTrigger value='beta' className='gap-2'>
                        <MessageSquare className='h-4 w-4' />
                        Beta Feedback ({betaFeedbackData.total})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value='bugs'>
                    <Card>
                        <CardContent className='p-0'>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Page</TableHead>
                                        <TableHead>Severity</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Device</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead className='w-[60px]'></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {bugReportsData.reports.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={7}
                                                className='text-muted-foreground py-8 text-center'
                                            >
                                                No bug reports yet
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        bugReportsData.reports.map((report) => (
                                            <TableRow key={report.id}>
                                                <TableCell>
                                                    <div className='max-w-[300px]'>
                                                        <p className='line-clamp-2 text-sm'>
                                                            {report.description}
                                                        </p>
                                                        {report.reporterEmail && (
                                                            <p className='text-muted-foreground mt-1 text-xs'>
                                                                {
                                                                    report.reporterEmail
                                                                }
                                                            </p>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Link
                                                        href={report.pageUrl}
                                                        target='_blank'
                                                        className='text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm'
                                                    >
                                                        <span className='max-w-[150px] truncate'>
                                                            {
                                                                new URL(
                                                                    report.pageUrl
                                                                ).pathname
                                                            }
                                                        </span>
                                                        <ExternalLink className='h-3 w-3 shrink-0' />
                                                    </Link>
                                                </TableCell>
                                                <TableCell>
                                                    <SeverityBadge
                                                        severity={
                                                            report.severity
                                                        }
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <StatusBadge
                                                        status={report.status}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <div className='text-muted-foreground text-sm'>
                                                        <p>
                                                            {report.deviceType ??
                                                                'Unknown'}
                                                        </p>
                                                        <p className='text-xs'>
                                                            {report.browserType ??
                                                                'Unknown'}
                                                        </p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <span className='text-muted-foreground text-sm'>
                                                        {new Date(
                                                            report.createdAt
                                                        ).toLocaleDateString()}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        variant='ghost'
                                                        size='sm'
                                                        asChild
                                                    >
                                                        <Link
                                                            href={`/feedback/bugs/${report.id}`}
                                                        >
                                                            <Eye className='h-4 w-4' />
                                                        </Link>
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value='beta'>
                    <Card>
                        <CardContent className='p-0'>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Design Rating</TableHead>
                                        <TableHead>Satisfaction</TableHead>
                                        <TableHead>Device</TableHead>
                                        <TableHead>Browser</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead className='w-[60px]'></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {betaFeedbackData.feedback.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={7}
                                                className='text-muted-foreground py-8 text-center'
                                            >
                                                No beta feedback yet
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        betaFeedbackData.feedback.map(
                                            (feedback) => (
                                                <TableRow key={feedback.id}>
                                                    <TableCell>
                                                        <RatingDisplay
                                                            rating={
                                                                feedback.overallDesignRating
                                                            }
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <RatingDisplay
                                                            rating={
                                                                feedback.overallSatisfactionRating
                                                            }
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className='text-sm capitalize'>
                                                            {feedback.deviceType.replace(
                                                                '-',
                                                                ' '
                                                            )}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className='text-sm capitalize'>
                                                            {
                                                                feedback.browserType
                                                            }
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className='text-muted-foreground text-sm'>
                                                            {feedback.email ??
                                                                'Anonymous'}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className='text-muted-foreground text-sm'>
                                                            {new Date(
                                                                feedback.createdAt
                                                            ).toLocaleDateString()}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button
                                                            variant='ghost'
                                                            size='sm'
                                                            asChild
                                                        >
                                                            <Link
                                                                href={`/feedback/beta/${feedback.id}`}
                                                            >
                                                                <Eye className='h-4 w-4' />
                                                            </Link>
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        )
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}

function SeverityBadge({ severity }: { severity: string | null }) {
    const variants: Record<
        string,
        'default' | 'secondary' | 'destructive' | 'outline'
    > = {
        low: 'outline',
        medium: 'secondary',
        high: 'default',
        critical: 'destructive',
    }

    return (
        <Badge variant={variants[severity ?? 'medium'] ?? 'secondary'}>
            {severity ?? 'medium'}
        </Badge>
    )
}

function StatusBadge({ status }: { status: string | null }) {
    const variants: Record<
        string,
        'default' | 'secondary' | 'destructive' | 'outline'
    > = {
        new: 'default',
        acknowledged: 'secondary',
        'in-progress': 'secondary',
        resolved: 'outline',
        'wont-fix': 'outline',
    }

    return (
        <Badge variant={variants[status ?? 'new'] ?? 'default'}>
            {status ?? 'new'}
        </Badge>
    )
}

function RatingDisplay({ rating }: { rating: number }) {
    const color =
        rating >= 4
            ? 'text-green-600'
            : rating >= 3
              ? 'text-yellow-600'
              : 'text-red-600'

    return <span className={`font-medium ${color}`}>{rating}/5</span>
}
