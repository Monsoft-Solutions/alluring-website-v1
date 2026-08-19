/**
 * Refresh Review Page
 *
 * The diff review screen for one refresh candidate (epic #144, #148): what
 * the refresh changed (AI summary + per-field diffs), the working copy's
 * review scores, and the apply / dismiss decision. Nothing reaches the live
 * post until Apply; the URL, publish date, and status can't change here by
 * construction.
 *
 * @module app/(dashboard)/blog/refresh/[id]/page
 */
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ExternalLink } from 'lucide-react'

import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import type { FaqItem } from '@workspace/shared/schemas/blog'

import { getRefreshCandidateDetail } from '@/lib/queries/content-refresh.query'
import { FieldDiff } from '@/components/blog/refresh/field-diff.component'
import { RefreshSignalBadges } from '@/components/blog/refresh/refresh-signal-badges.component'
import {
    ApplyRefreshButton,
    DismissFromReviewButton,
    RollbackRefreshButton,
    RunRefreshButton,
} from '@/components/blog/refresh/refresh-review-actions.component'

export const dynamic = 'force-dynamic'
// Server actions on this segment stay within seconds; the long-running
// refresh run goes through its own route handler with maxDuration=300.

const STATUS_LABELS: Record<string, string> = {
    pending: 'Pending',
    in_progress: 'Refreshing',
    ready_for_review: 'Ready for review',
    applied: 'Applied',
    dismissed: 'Dismissed',
    failed: 'Failed',
}

/** FAQs as diffable plain text. */
function faqsAsText(faqs: FaqItem[] | null): string {
    if (!faqs || faqs.length === 0) return ''
    return faqs
        .map((faq) => `Q: ${faq.question}\nA: ${faq.answer}`)
        .join('\n\n')
}

export default async function RefreshReviewPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const detail = await getRefreshCandidateDetail(id)
    if (!detail) notFound()

    const { original, workingCopy, brief } = detail
    const reviews = workingCopy?.pipelineState?.reviewPhase?.reviews ?? []

    return (
        <div className='space-y-6'>
            {/* Header */}
            <div className='flex flex-wrap items-start justify-between gap-4'>
                <div className='space-y-1'>
                    <Link
                        href='/blog/refresh'
                        className='text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm'
                    >
                        <ArrowLeft className='h-3.5 w-3.5' />
                        Refresh queue
                    </Link>
                    <h1 className='text-2xl font-semibold'>{original.title}</h1>
                    <div className='flex flex-wrap items-center gap-2'>
                        <Badge variant='secondary'>
                            {STATUS_LABELS[detail.status] ?? detail.status}
                        </Badge>
                        {original.slug ? (
                            <span className='text-muted-foreground text-sm'>
                                /{original.slug} — the URL never changes
                            </span>
                        ) : null}
                    </div>
                </div>
                <div className='flex flex-wrap items-center gap-2'>
                    {detail.status === 'pending' ? (
                        <>
                            <RunRefreshButton candidateId={detail.id} />
                            <DismissFromReviewButton candidateId={detail.id} />
                        </>
                    ) : null}
                    {detail.status === 'ready_for_review' ? (
                        <>
                            <ApplyRefreshButton candidateId={detail.id} />
                            <Button size='sm' variant='outline' asChild>
                                <Link href='/blog/pipeline'>
                                    <ExternalLink className='h-3.5 w-3.5' />
                                    Open in editor
                                </Link>
                            </Button>
                            <DismissFromReviewButton candidateId={detail.id} />
                        </>
                    ) : null}
                    {detail.status === 'applied' && detail.revisionId ? (
                        <RollbackRefreshButton revisionId={detail.revisionId} />
                    ) : null}
                </div>
            </div>

            {detail.status === 'in_progress' ? (
                <div className='rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200'>
                    A refresh run is executing for this post — the diff appears
                    here when it finishes.
                </div>
            ) : null}

            {detail.status === 'failed' && detail.error ? (
                <div className='rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-900 dark:border-red-900 dark:bg-red-950 dark:text-red-200'>
                    The refresh run failed: {detail.error}
                </div>
            ) : null}

            {/* Why this refresh */}
            <section className='space-y-2'>
                <h2 className='text-lg font-medium'>Why this refresh</h2>
                <RefreshSignalBadges sources={detail.sources} />
                {brief && brief.risingQueriesNotCovered.length > 0 ? (
                    <p className='text-muted-foreground text-sm'>
                        Uncovered rising queries:{' '}
                        {brief.risingQueriesNotCovered.join(', ')}
                    </p>
                ) : null}
                {brief && brief.decayedQueries.length > 0 ? (
                    <p className='text-muted-foreground text-sm'>
                        Decayed queries: {brief.decayedQueries.join(', ')}
                    </p>
                ) : null}
            </section>

            {/* AI change summary */}
            {detail.changeSummary ? (
                <section className='space-y-2'>
                    <h2 className='text-lg font-medium'>What changed</h2>
                    <ul className='list-disc space-y-1 pl-5 text-sm'>
                        {detail.changeSummary
                            .split('\n')
                            .filter((line) => line.trim().length > 0)
                            .map((line, index) => (
                                <li key={index}>
                                    {line.replace(/^[-•]\s*/, '')}
                                </li>
                            ))}
                    </ul>
                </section>
            ) : null}

            {/* Review verdicts of the refreshed draft */}
            {reviews.length > 0 ? (
                <section className='space-y-2'>
                    <h2 className='text-lg font-medium'>Review verdicts</h2>
                    <div className='space-y-2'>
                        {[...reviews]
                            .sort((a, b) => a.score - b.score)
                            .map((review) => (
                                <div
                                    key={review.agentName}
                                    className={`rounded-md border px-4 py-2.5 ${
                                        review.score < 60
                                            ? 'border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/40'
                                            : ''
                                    }`}
                                >
                                    <div className='flex items-center gap-2'>
                                        <Badge
                                            variant={
                                                review.score < 60
                                                    ? 'destructive'
                                                    : 'outline'
                                            }
                                            className='font-mono'
                                        >
                                            {review.score}
                                        </Badge>
                                        <span className='text-sm font-medium'>
                                            {review.agentName}
                                        </span>
                                    </div>
                                    {review.summary ? (
                                        <p className='text-muted-foreground mt-1 text-sm'>
                                            {review.summary}
                                        </p>
                                    ) : null}
                                </div>
                            ))}
                    </div>
                </section>
            ) : null}

            {/* Per-field diffs */}
            {workingCopy ? (
                <section className='space-y-3'>
                    <h2 className='text-lg font-medium'>
                        {detail.status === 'applied'
                            ? 'Applied changes (working copy vs pre-apply original)'
                            : 'Changes vs the live post'}
                    </h2>
                    <FieldDiff
                        label='Title'
                        oldText={original.title}
                        newText={workingCopy.title}
                    />
                    <FieldDiff
                        label='Meta title'
                        oldText={original.metaTitle}
                        newText={workingCopy.metaTitle}
                    />
                    <FieldDiff
                        label='Meta description'
                        oldText={original.metaDescription}
                        newText={workingCopy.metaDescription}
                    />
                    <FieldDiff
                        label='Excerpt'
                        oldText={original.excerpt}
                        newText={workingCopy.excerpt}
                    />
                    <FieldDiff
                        label='Quick answer'
                        oldText={original.quickAnswer}
                        newText={workingCopy.quickAnswer}
                    />
                    <FieldDiff
                        label='FAQs'
                        oldText={faqsAsText(original.faqs)}
                        newText={faqsAsText(workingCopy.faqs)}
                        mode='lines'
                    />
                    <FieldDiff
                        label='Content'
                        oldText={original.content}
                        newText={workingCopy.content}
                        mode='lines'
                    />
                </section>
            ) : detail.status === 'pending' ? (
                <p className='text-muted-foreground text-sm'>
                    Run the refresh to generate the updated draft — the
                    per-field diff appears here for review before anything
                    touches the live post.
                </p>
            ) : null}
        </div>
    )
}
