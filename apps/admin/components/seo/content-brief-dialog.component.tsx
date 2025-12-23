'use client'

import { useState } from 'react'
import {
    Sparkles,
    AlertCircle,
    RefreshCw,
    Copy,
    Check,
    FileText,
    Target,
    BookOpen,
    MousePointerClick,
    List,
} from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@workspace/ui/components/dialog'
import { Badge } from '@workspace/ui/components/badge'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { Button } from '@workspace/ui/components/button'
import { ScrollArea } from '@workspace/ui/components/scroll-area'
import { Separator } from '@workspace/ui/components/separator'
import { useMutation } from '@tanstack/react-query'
import type { ContentBrief } from '@workspace/shared/schemas/seo'

import { fetchApi } from '@/lib/utils/api-client.util'

type ContentBriefDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    query: string
    currentPosition?: number
    impressions?: number
}

type ContentBriefResponse = {
    success: true
    data: ContentBrief
}

/**
 * Content Brief Dialog
 *
 * Generates and displays an AI-powered content brief for a search query.
 */
export function ContentBriefDialog({
    open,
    onOpenChange,
    query,
    currentPosition,
    impressions,
}: ContentBriefDialogProps) {
    const [copied, setCopied] = useState(false)
    const [brief, setBrief] = useState<ContentBrief | null>(null)

    const generateMutation = useMutation({
        mutationFn: async () => {
            const response = await fetchApi<ContentBriefResponse>(
                '/api/admin/seo/content-brief',
                {
                    method: 'POST',
                    body: { query, currentPosition, impressions },
                }
            )
            return response.data
        },
        onSuccess: (data) => {
            setBrief(data)
        },
    })

    // Generate on open if not already generated
    const handleOpenChange = (open: boolean) => {
        if (open && !brief && !generateMutation.isPending) {
            generateMutation.mutate()
        }
        onOpenChange(open)
    }

    // Copy outline to clipboard as markdown
    const handleCopy = async () => {
        if (!brief) return

        const markdown = formatBriefAsMarkdown(brief)
        await navigator.clipboard.writeText(markdown)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className='flex max-h-[85vh] max-w-3xl flex-col overflow-hidden'>
                <DialogHeader>
                    <DialogTitle className='flex items-center gap-2'>
                        <Sparkles className='h-5 w-5 text-amber-500' />
                        AI Content Brief
                    </DialogTitle>
                    <DialogDescription className='flex items-center gap-2'>
                        <span className='font-medium'>&quot;{query}&quot;</span>
                        {currentPosition && (
                            <Badge variant='outline' className='text-xs'>
                                Position: {currentPosition.toFixed(1)}
                            </Badge>
                        )}
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className='flex-1 pr-4'>
                    {generateMutation.isPending ? (
                        <BriefSkeleton />
                    ) : generateMutation.error ? (
                        <div className='flex h-[300px] flex-col items-center justify-center gap-3'>
                            <AlertCircle className='h-6 w-6 text-red-500' />
                            <p className='text-muted-foreground text-sm'>
                                Failed to generate content brief
                            </p>
                            <Button
                                variant='outline'
                                size='sm'
                                onClick={() => generateMutation.mutate()}
                            >
                                <RefreshCw className='mr-2 h-4 w-4' />
                                Retry
                            </Button>
                        </div>
                    ) : brief ? (
                        <div className='space-y-6'>
                            {/* Title Section */}
                            <section>
                                <h3 className='text-muted-foreground mb-2 flex items-center gap-2 text-sm font-medium'>
                                    <FileText className='h-4 w-4' />
                                    Suggested Title
                                </h3>
                                <p className='text-lg font-semibold'>
                                    {brief.suggestedTitle}
                                </p>
                                <p className='text-muted-foreground mt-1 text-xs'>
                                    {brief.suggestedTitle.length} characters
                                </p>
                            </section>

                            <Separator />

                            {/* Keywords */}
                            <section>
                                <h3 className='text-muted-foreground mb-2 flex items-center gap-2 text-sm font-medium'>
                                    <Target className='h-4 w-4' />
                                    Target Keywords
                                </h3>
                                <div className='flex flex-wrap gap-2'>
                                    <Badge className='bg-green-100 text-green-800 hover:bg-green-100'>
                                        {brief.targetKeyword}
                                    </Badge>
                                    {brief.secondaryKeywords.map((keyword) => (
                                        <Badge key={keyword} variant='outline'>
                                            {keyword}
                                        </Badge>
                                    ))}
                                </div>
                            </section>

                            {/* Meta Info */}
                            <section className='grid grid-cols-2 gap-4'>
                                <div className='bg-muted/50 rounded-lg p-3'>
                                    <p className='text-muted-foreground text-xs'>
                                        Target Word Count
                                    </p>
                                    <p className='text-xl font-bold'>
                                        {brief.targetWordCount.toLocaleString()}
                                    </p>
                                </div>
                                <div className='bg-muted/50 rounded-lg p-3'>
                                    <p className='text-muted-foreground text-xs'>
                                        Search Intent
                                    </p>
                                    <p className='text-xl font-bold capitalize'>
                                        {brief.searchIntent}
                                    </p>
                                </div>
                            </section>

                            <Separator />

                            {/* Meta Description */}
                            <section>
                                <h3 className='text-muted-foreground mb-2 text-sm font-medium'>
                                    Meta Description
                                </h3>
                                <p className='bg-muted/50 rounded-lg p-3 text-sm'>
                                    {brief.metaDescription}
                                </p>
                                <p className='text-muted-foreground mt-1 text-xs'>
                                    {brief.metaDescription.length} characters
                                </p>
                            </section>

                            <Separator />

                            {/* Outline */}
                            <section>
                                <h3 className='text-muted-foreground mb-3 flex items-center gap-2 text-sm font-medium'>
                                    <List className='h-4 w-4' />
                                    Content Outline
                                </h3>
                                <div className='space-y-4'>
                                    {brief.outline.map((section, index) => (
                                        <div
                                            key={index}
                                            className={
                                                section.level === 'h2'
                                                    ? ''
                                                    : 'ml-4'
                                            }
                                        >
                                            <h4
                                                className={
                                                    section.level === 'h2'
                                                        ? 'text-base font-semibold'
                                                        : 'text-muted-foreground text-sm font-medium'
                                                }
                                            >
                                                {section.level === 'h2'
                                                    ? '## '
                                                    : '### '}
                                                {section.heading}
                                            </h4>
                                            <ul className='mt-1 space-y-1'>
                                                {section.keyPoints.map(
                                                    (point, pointIndex) => (
                                                        <li
                                                            key={pointIndex}
                                                            className='text-muted-foreground flex items-start gap-2 text-sm'
                                                        >
                                                            <span className='text-muted-foreground/50'>
                                                                •
                                                            </span>
                                                            {point}
                                                        </li>
                                                    )
                                                )}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <Separator />

                            {/* Introduction & Conclusion */}
                            <section className='grid gap-4 md:grid-cols-2'>
                                <div>
                                    <h3 className='text-muted-foreground mb-2 flex items-center gap-2 text-sm font-medium'>
                                        <BookOpen className='h-4 w-4' />
                                        Introduction Approach
                                    </h3>
                                    <p className='bg-muted/50 rounded-lg p-3 text-sm'>
                                        {brief.introduction}
                                    </p>
                                </div>
                                <div>
                                    <h3 className='text-muted-foreground mb-2 flex items-center gap-2 text-sm font-medium'>
                                        <BookOpen className='h-4 w-4' />
                                        Conclusion Approach
                                    </h3>
                                    <p className='bg-muted/50 rounded-lg p-3 text-sm'>
                                        {brief.conclusion}
                                    </p>
                                </div>
                            </section>

                            <Separator />

                            {/* CTA & Differentiation */}
                            <section className='space-y-4'>
                                <div>
                                    <h3 className='text-muted-foreground mb-2 flex items-center gap-2 text-sm font-medium'>
                                        <MousePointerClick className='h-4 w-4' />
                                        Recommended CTA
                                    </h3>
                                    <p className='text-sm'>
                                        {brief.ctaRecommendation}
                                    </p>
                                </div>
                                <div>
                                    <h3 className='text-muted-foreground mb-2 text-sm font-medium'>
                                        Differentiation Strategy
                                    </h3>
                                    <p className='text-sm'>
                                        {brief.competitorInsights}
                                    </p>
                                </div>
                            </section>
                        </div>
                    ) : null}
                </ScrollArea>

                {/* Actions */}
                {brief && (
                    <div className='flex justify-end gap-2 border-t pt-4'>
                        <Button
                            variant='outline'
                            onClick={() => generateMutation.mutate()}
                            disabled={generateMutation.isPending}
                        >
                            <RefreshCw
                                className={`mr-2 h-4 w-4 ${generateMutation.isPending ? 'animate-spin' : ''}`}
                            />
                            Regenerate
                        </Button>
                        <Button onClick={handleCopy}>
                            {copied ? (
                                <>
                                    <Check className='mr-2 h-4 w-4' />
                                    Copied!
                                </>
                            ) : (
                                <>
                                    <Copy className='mr-2 h-4 w-4' />
                                    Copy as Markdown
                                </>
                            )}
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}

/**
 * Format content brief as markdown for copying
 */
function formatBriefAsMarkdown(brief: ContentBrief): string {
    let md = `# Content Brief: ${brief.targetKeyword}\n\n`
    md += `## Suggested Title\n${brief.suggestedTitle}\n\n`
    md += `## Meta Description\n${brief.metaDescription}\n\n`
    md += `## Keywords\n`
    md += `- Primary: ${brief.targetKeyword}\n`
    md += `- Secondary: ${brief.secondaryKeywords.join(', ')}\n\n`
    md += `## Target\n`
    md += `- Word Count: ${brief.targetWordCount}\n`
    md += `- Search Intent: ${brief.searchIntent}\n\n`
    md += `## Content Outline\n\n`

    for (const section of brief.outline) {
        const prefix = section.level === 'h2' ? '##' : '###'
        md += `${prefix} ${section.heading}\n`
        for (const point of section.keyPoints) {
            md += `- ${point}\n`
        }
        md += '\n'
    }

    md += `## Introduction Approach\n${brief.introduction}\n\n`
    md += `## Conclusion Approach\n${brief.conclusion}\n\n`
    md += `## CTA Recommendation\n${brief.ctaRecommendation}\n\n`
    md += `## Differentiation Strategy\n${brief.competitorInsights}\n`

    return md
}

function BriefSkeleton() {
    return (
        <div className='space-y-6'>
            <div>
                <Skeleton className='mb-2 h-4 w-24' />
                <Skeleton className='h-6 w-3/4' />
            </div>
            <Skeleton className='h-px w-full' />
            <div>
                <Skeleton className='mb-2 h-4 w-28' />
                <div className='flex gap-2'>
                    <Skeleton className='h-6 w-24' />
                    <Skeleton className='h-6 w-20' />
                    <Skeleton className='h-6 w-28' />
                </div>
            </div>
            <div className='grid grid-cols-2 gap-4'>
                <Skeleton className='h-20' />
                <Skeleton className='h-20' />
            </div>
            <Skeleton className='h-px w-full' />
            <div>
                <Skeleton className='mb-2 h-4 w-32' />
                <Skeleton className='h-20 w-full' />
            </div>
            <Skeleton className='h-px w-full' />
            <div className='space-y-4'>
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i}>
                        <Skeleton className='mb-2 h-5 w-48' />
                        <Skeleton className='h-4 w-full' />
                        <Skeleton className='mt-1 h-4 w-3/4' />
                    </div>
                ))}
            </div>
        </div>
    )
}
