'use client'

import { useState, useEffect, useRef } from 'react'
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@workspace/ui/components/sheet'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import { Separator } from '@workspace/ui/components/separator'
import {
    FileText,
    Pencil,
    Target,
    Users,
    Lightbulb,
    ListTree,
    Link2,
    Sparkles,
    ExternalLink,
    AlertTriangle,
} from 'lucide-react'

import { useIdeaDetail } from '@/hooks/use-ideas.hook'
import {
    PRIORITY_CONFIG,
    STAGE_CONFIG,
    CONTENT_TYPE_LABELS,
} from '@/lib/constants/blog-ideas.constant'
import { GenerateDraftDialog } from './generate-draft-dialog.component'
import { Section } from './idea-section.component'
import { DrawerSkeleton } from './idea-drawer-skeleton.component'

type IdeaDetailDrawerProps = {
    ideaId: string
    open: boolean
    onOpenChange: (open: boolean) => void
    autoOpenGenerateDraft?: boolean
}

/**
 * Slide-out drawer showing full idea details
 */
export function IdeaDetailDrawer({
    ideaId,
    open,
    onOpenChange,
    autoOpenGenerateDraft = false,
}: IdeaDetailDrawerProps) {
    const { data: idea, isLoading, error } = useIdeaDetail(ideaId)
    const [isGenerateDraftOpen, setIsGenerateDraftOpen] = useState(false)
    const hasAutoOpenedRef = useRef(false)

    // Auto-open generate draft dialog when flag is set
    useEffect(() => {
        if (
            open &&
            autoOpenGenerateDraft &&
            idea &&
            !isLoading &&
            !hasAutoOpenedRef.current
        ) {
            hasAutoOpenedRef.current = true
            // Use setTimeout to defer the state update and avoid cascading renders
            const timer = setTimeout(() => {
                setIsGenerateDraftOpen(true)
            }, 0)
            return () => clearTimeout(timer)
        }

        // Reset the flag when drawer closes
        if (!open) {
            hasAutoOpenedRef.current = false
        }
    }, [open, autoOpenGenerateDraft, idea, isLoading])

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className='w-full overflow-y-auto sm:max-w-lg'>
                {isLoading ? (
                    <DrawerSkeleton />
                ) : error ? (
                    <div className='flex flex-col items-center justify-center py-12'>
                        <AlertTriangle className='mb-4 h-12 w-12 text-red-500' />
                        <p className='text-muted-foreground'>
                            Failed to load idea details
                        </p>
                    </div>
                ) : idea ? (
                    <>
                        <SheetHeader>
                            <div className='flex items-start justify-between'>
                                <div className='flex-1'>
                                    <div className='mb-2 flex flex-wrap gap-2'>
                                        <Badge
                                            variant='secondary'
                                            className={
                                                STAGE_CONFIG[idea.stage].class
                                            }
                                        >
                                            {STAGE_CONFIG[idea.stage].label}
                                        </Badge>
                                        <Badge
                                            variant='secondary'
                                            className={
                                                PRIORITY_CONFIG[idea.priority]
                                                    .class
                                            }
                                        >
                                            {
                                                PRIORITY_CONFIG[idea.priority]
                                                    .label
                                            }
                                        </Badge>
                                    </div>
                                    <SheetTitle className='text-lg'>
                                        {idea.title}
                                    </SheetTitle>
                                    <SheetDescription className='mt-1'>
                                        {idea.topic || 'No topic set'}
                                    </SheetDescription>
                                </div>
                            </div>
                        </SheetHeader>

                        <div className='mt-6 space-y-6'>
                            {/* Actions */}
                            <div className='flex gap-2'>
                                {idea.blogPostId ? (
                                    <Button className='flex-1' asChild>
                                        <a
                                            href={`/blog/posts/${idea.blogPostId}/edit`}
                                        >
                                            <FileText className='mr-2 h-4 w-4' />
                                            View Draft
                                        </a>
                                    </Button>
                                ) : (
                                    <Button
                                        className='flex-1'
                                        onClick={() =>
                                            setIsGenerateDraftOpen(true)
                                        }
                                    >
                                        <Sparkles className='mr-2 h-4 w-4' />
                                        Generate Draft
                                    </Button>
                                )}
                                <Button variant='outline'>
                                    <Pencil className='mr-2 h-4 w-4' />
                                    Edit
                                </Button>
                            </div>

                            <Separator />

                            {/* SEO Keywords */}
                            {(idea.primaryKeyword ||
                                idea.secondaryKeywords?.length) && (
                                <Section icon={Target} title='Target Keywords'>
                                    {idea.primaryKeyword && (
                                        <div className='mb-2'>
                                            <span className='text-muted-foreground text-xs'>
                                                Primary:
                                            </span>
                                            <Badge
                                                variant='outline'
                                                className='ml-2'
                                            >
                                                {idea.primaryKeyword}
                                            </Badge>
                                        </div>
                                    )}
                                    {idea.secondaryKeywords &&
                                        idea.secondaryKeywords.length > 0 && (
                                            <div>
                                                <span className='text-muted-foreground text-xs'>
                                                    Secondary:
                                                </span>
                                                <div className='mt-1 flex flex-wrap gap-1'>
                                                    {idea.secondaryKeywords.map(
                                                        (kw, i) => (
                                                            <Badge
                                                                key={i}
                                                                variant='secondary'
                                                                className='text-xs'
                                                            >
                                                                {kw}
                                                            </Badge>
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                </Section>
                            )}

                            {/* Target Audience */}
                            {idea.targetAudience && (
                                <Section icon={Users} title='Target Audience'>
                                    <p className='text-sm'>
                                        {idea.targetAudience}
                                    </p>
                                </Section>
                            )}

                            {/* Pain Points */}
                            {idea.painPoints && idea.painPoints.length > 0 && (
                                <Section
                                    icon={AlertTriangle}
                                    title='Pain Points'
                                >
                                    <ul className='list-inside list-disc space-y-1 text-sm'>
                                        {idea.painPoints.map((point, i) => (
                                            <li key={i}>{point}</li>
                                        ))}
                                    </ul>
                                </Section>
                            )}

                            {/* Unique Angle */}
                            {idea.uniqueAngle && (
                                <Section icon={Lightbulb} title='Unique Angle'>
                                    <p className='text-sm'>
                                        {idea.uniqueAngle}
                                    </p>
                                </Section>
                            )}

                            {/* Outline */}
                            {idea.outline && idea.outline.length > 0 && (
                                <Section icon={ListTree} title='Outline'>
                                    <ul className='space-y-2 text-sm'>
                                        {idea.outline.map((section) => (
                                            <li key={section.id}>
                                                <span className='font-medium'>
                                                    {section.title}
                                                </span>
                                                {section.description && (
                                                    <p className='text-muted-foreground mt-0.5 text-xs'>
                                                        {section.description}
                                                    </p>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </Section>
                            )}

                            {/* Competitor URLs */}
                            {idea.competitorUrls &&
                                idea.competitorUrls.length > 0 && (
                                    <Section
                                        icon={Link2}
                                        title='Reference URLs'
                                    >
                                        <ul className='space-y-1 text-sm'>
                                            {idea.competitorUrls.map(
                                                (url, i) => (
                                                    <li key={i}>
                                                        <a
                                                            href={url}
                                                            target='_blank'
                                                            rel='noopener noreferrer'
                                                            className='flex items-center gap-1 text-blue-600 hover:underline'
                                                        >
                                                            <ExternalLink className='h-3 w-3' />
                                                            <span className='truncate'>
                                                                {url}
                                                            </span>
                                                        </a>
                                                    </li>
                                                )
                                            )}
                                        </ul>
                                    </Section>
                                )}

                            {/* AI Score */}
                            {idea.aiGeneratedScore !== null && (
                                <Section
                                    icon={Sparkles}
                                    title='SEO Opportunity Score'
                                >
                                    <div className='flex items-center gap-3'>
                                        <div className='relative h-16 w-16'>
                                            <svg
                                                className='h-full w-full -rotate-90'
                                                viewBox='0 0 36 36'
                                            >
                                                <circle
                                                    cx='18'
                                                    cy='18'
                                                    r='16'
                                                    fill='none'
                                                    strokeWidth='3'
                                                    className='stroke-stone-200'
                                                />
                                                <circle
                                                    cx='18'
                                                    cy='18'
                                                    r='16'
                                                    fill='none'
                                                    strokeWidth='3'
                                                    strokeDasharray={`${idea.aiGeneratedScore} 100`}
                                                    className='stroke-violet-500'
                                                    strokeLinecap='round'
                                                />
                                            </svg>
                                            <span className='absolute inset-0 flex items-center justify-center text-sm font-semibold'>
                                                {idea.aiGeneratedScore}
                                            </span>
                                        </div>
                                        <div className='text-sm'>
                                            <p className='font-medium'>
                                                {idea.aiGeneratedScore >= 70
                                                    ? 'High Opportunity'
                                                    : idea.aiGeneratedScore >=
                                                        40
                                                      ? 'Medium Opportunity'
                                                      : 'Low Opportunity'}
                                            </p>
                                            <p className='text-muted-foreground text-xs'>
                                                Based on keyword competition and
                                                search volume
                                            </p>
                                        </div>
                                    </div>
                                </Section>
                            )}

                            {/* Linked Blog Post */}
                            {idea.blogPostId && (
                                <Section
                                    icon={FileText}
                                    title='Linked Blog Post'
                                >
                                    <a
                                        href={`/blog/posts/${idea.blogPostId}/edit`}
                                        className='text-sm text-blue-600 hover:underline'
                                    >
                                        {idea.blogPostTitle || 'View Post'}
                                    </a>
                                </Section>
                            )}

                            {/* Content Type & Word Count */}
                            <div className='text-muted-foreground flex items-center justify-between border-t pt-4 text-xs'>
                                <span>
                                    Type:{' '}
                                    {idea.contentType
                                        ? CONTENT_TYPE_LABELS[idea.contentType]
                                        : 'Not set'}
                                </span>
                                <span>
                                    Est. Words:{' '}
                                    {idea.estimatedWordCount?.toLocaleString() ||
                                        'Not set'}
                                </span>
                            </div>
                        </div>
                    </>
                ) : null}

                {/* Generate Draft Dialog */}
                {idea && (
                    <GenerateDraftDialog
                        idea={idea}
                        open={isGenerateDraftOpen}
                        onOpenChange={setIsGenerateDraftOpen}
                    />
                )}
            </SheetContent>
        </Sheet>
    )
}
