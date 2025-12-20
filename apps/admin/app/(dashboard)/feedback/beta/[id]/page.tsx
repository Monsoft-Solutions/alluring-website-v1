import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
    ArrowLeft,
    Monitor,
    Star,
    ThumbsUp,
    ThumbsDown,
    Lightbulb,
    Mail,
    AlertTriangle,
    CheckCircle,
} from 'lucide-react'

import { Button } from '@workspace/ui/components/button'
import { Badge } from '@workspace/ui/components/badge'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card'

import { getBetaFeedbackById } from '@/lib/queries/feedback.query'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

type PageProps = {
    params: Promise<{ id: string }>
}

export default async function BetaFeedbackDetailPage({ params }: PageProps) {
    const { id } = await params
    const feedback = await getBetaFeedbackById(id)

    if (!feedback) {
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
                    <h1 className='text-2xl font-semibold'>Beta Feedback</h1>
                    <p className='text-muted-foreground'>
                        Submitted{' '}
                        {new Intl.DateTimeFormat('en-US', {
                            dateStyle: 'full',
                            timeStyle: 'short',
                        }).format(new Date(feedback.createdAt))}
                    </p>
                </div>
                {feedback.email && (
                    <Badge variant='outline' className='gap-1'>
                        <Mail className='h-3 w-3' />
                        {feedback.email}
                    </Badge>
                )}
            </div>

            {/* Overall Ratings */}
            <Card>
                <CardHeader>
                    <CardTitle className='flex items-center gap-2'>
                        <Star className='h-5 w-5' />
                        Overall Ratings
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-4'>
                        <RatingCard
                            label='Design Rating'
                            rating={feedback.overallDesignRating}
                        />
                        <RatingCard
                            label='Satisfaction'
                            rating={feedback.overallSatisfactionRating}
                        />
                        <RatingCard
                            label='Visual Aesthetics'
                            rating={feedback.visualAestheticsRating}
                        />
                        <RatingCard
                            label='Wording Clarity'
                            rating={feedback.wordingClarityRating}
                        />
                    </div>
                </CardContent>
            </Card>

            <div className='grid gap-6 lg:grid-cols-2'>
                {/* Navigation & Usability */}
                <Card>
                    <CardHeader>
                        <CardTitle>Navigation & Usability</CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                        <div className='flex items-center justify-between rounded-lg border p-3'>
                            <span className='text-sm font-medium'>
                                Navigation Ease
                            </span>
                            <Badge variant='outline' className='capitalize'>
                                {feedback.navigationEase?.replace(/-/g, ' ') ??
                                    'Unknown'}
                            </Badge>
                        </div>
                        {feedback.hasBrokenLinks !== null && (
                            <div className='flex items-center justify-between rounded-lg border p-3'>
                                <span className='text-sm font-medium'>
                                    Found Broken Links
                                </span>
                                <IssueIndicator
                                    hasIssue={feedback.hasBrokenLinks}
                                />
                            </div>
                        )}
                        {feedback.brokenLinksDescription && (
                            <div className='rounded-lg border border-orange-200 bg-orange-50 p-3'>
                                <p className='text-sm text-orange-800'>
                                    {feedback.brokenLinksDescription}
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Device Info */}
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
                            value={
                                feedback.deviceTypeOther ??
                                feedback.deviceType?.replace(/-/g, ' ') ??
                                'Unknown'
                            }
                        />
                        <DataRow
                            label='Browser'
                            value={
                                feedback.browserTypeOther ??
                                feedback.browserType
                            }
                        />
                        {feedback.ipAddress && (
                            <DataRow
                                label='IP Address'
                                value={feedback.ipAddress}
                            />
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Content & Technical Issues */}
            <div className='grid gap-6 lg:grid-cols-2'>
                {/* Content Issues */}
                <Card>
                    <CardHeader>
                        <CardTitle>Content Quality</CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                        {feedback.hasTypos !== null && (
                            <div className='flex items-center justify-between rounded-lg border p-3'>
                                <span className='text-sm font-medium'>
                                    Found Typos
                                </span>
                                <IssueIndicator hasIssue={feedback.hasTypos} />
                            </div>
                        )}
                        {feedback.typosDescription && (
                            <div className='rounded-lg border border-yellow-200 bg-yellow-50 p-3'>
                                <p className='text-sm text-yellow-800'>
                                    {feedback.typosDescription}
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Technical Issues */}
                <Card>
                    <CardHeader>
                        <CardTitle>Technical Issues</CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                        {feedback.hasTechnicalIssues !== null && (
                            <div className='flex items-center justify-between rounded-lg border p-3'>
                                <span className='text-sm font-medium'>
                                    Experienced Technical Issues
                                </span>
                                <IssueIndicator
                                    hasIssue={feedback.hasTechnicalIssues}
                                />
                            </div>
                        )}
                        {feedback.technicalIssuesDescription && (
                            <div className='rounded-lg border border-red-200 bg-red-50 p-3'>
                                <p className='text-sm text-red-800'>
                                    {feedback.technicalIssuesDescription}
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Design Feedback */}
            {(feedback.designLikes || feedback.designDislikes) && (
                <div className='grid gap-6 lg:grid-cols-2'>
                    {feedback.designLikes && (
                        <Card>
                            <CardHeader>
                                <CardTitle className='flex items-center gap-2'>
                                    <ThumbsUp className='h-5 w-5 text-green-600' />
                                    Design Likes
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className='text-sm whitespace-pre-wrap'>
                                    {feedback.designLikes}
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    {feedback.designDislikes && (
                        <Card>
                            <CardHeader>
                                <CardTitle className='flex items-center gap-2'>
                                    <ThumbsDown className='h-5 w-5 text-red-600' />
                                    Design Dislikes
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className='text-sm whitespace-pre-wrap'>
                                    {feedback.designDislikes}
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}

            {/* Recommendations */}
            {feedback.recommendations && (
                <Card>
                    <CardHeader>
                        <CardTitle className='flex items-center gap-2'>
                            <Lightbulb className='h-5 w-5 text-yellow-600' />
                            Recommendations
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className='text-sm whitespace-pre-wrap'>
                            {feedback.recommendations}
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* UX Testing Interest */}
            {feedback.wantsUxTesting && (
                <Card className='border-green-200 bg-green-50'>
                    <CardContent className='py-4'>
                        <div className='flex items-center gap-2'>
                            <CheckCircle className='h-5 w-5 text-green-600' />
                            <p className='font-medium text-green-800'>
                                User is interested in UX testing sessions
                            </p>
                        </div>
                        {feedback.email && (
                            <p className='text-muted-foreground mt-1 text-sm'>
                                Contact: {feedback.email}
                            </p>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    )
}

function RatingCard({ label, rating }: { label: string; rating: number }) {
    const color =
        rating >= 4
            ? 'text-green-600'
            : rating >= 3
              ? 'text-yellow-600'
              : 'text-red-600'

    return (
        <div className='rounded-lg border p-4 text-center'>
            <p className='text-muted-foreground mb-1 text-xs uppercase'>
                {label}
            </p>
            <p className={`text-3xl font-bold ${color}`}>{rating}/5</p>
        </div>
    )
}

function IssueIndicator({ hasIssue }: { hasIssue: boolean | null }) {
    if (hasIssue === null) return null

    if (hasIssue) {
        return (
            <Badge variant='destructive' className='gap-1'>
                <AlertTriangle className='h-3 w-3' />
                Yes
            </Badge>
        )
    }

    return (
        <Badge variant='outline' className='gap-1 text-green-600'>
            <CheckCircle className='h-3 w-3' />
            No
        </Badge>
    )
}

function DataRow({ label, value }: { label: string; value: string }) {
    return (
        <div className='grid grid-cols-3 gap-2 text-sm'>
            <span className='text-muted-foreground'>{label}:</span>
            <span className='col-span-2 capitalize'>{value}</span>
        </div>
    )
}
