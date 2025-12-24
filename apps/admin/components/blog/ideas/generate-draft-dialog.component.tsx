'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@workspace/ui/components/dialog'
import { Button } from '@workspace/ui/components/button'
import { Progress } from '@workspace/ui/components/progress'
import {
    Loader2,
    FileText,
    Check,
    AlertTriangle,
    Sparkles,
    ListTree,
    BookOpen,
} from 'lucide-react'

import type { BlogIdeaDetail } from '@/lib/queries/ideas.query'
import { createBlogPost } from '@/lib/actions/blog.action'
import { linkIdeaToBlogPost } from '@/lib/actions/idea.action'
import { StepIndicator } from './step-indicator.component'

type GenerateDraftDialogProps = {
    idea: BlogIdeaDetail
    open: boolean
    onOpenChange: (open: boolean) => void
}

type GenerationStep =
    | 'idle'
    | 'outline'
    | 'content'
    | 'saving'
    | 'complete'
    | 'error'

/**
 * Dialog for generating a full blog post draft from an idea
 */
export function GenerateDraftDialog({
    idea,
    open,
    onOpenChange,
}: GenerateDraftDialogProps) {
    const router = useRouter()
    const [step, setStep] = useState<GenerationStep>('idle')
    const [progress, setProgress] = useState(0)
    const [error, setError] = useState<string | null>(null)
    const [generatedContent, setGeneratedContent] = useState<{
        content: string
        metaDescription: string
        excerpt: string
    } | null>(null)
    const [postId, setPostId] = useState<string | null>(null)

    const handleGenerate = async () => {
        setStep('outline')
        setProgress(10)
        setError(null)

        try {
            // Step 1: Generate outline if not present
            let outline = idea.outline
            if (!outline || outline.length === 0) {
                const outlineResponse = await fetch(
                    '/api/blog/generate-outline',
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            title: idea.title,
                            topic: idea.topic || idea.title,
                            primaryKeyword: idea.primaryKeyword || '',
                            secondaryKeywords: idea.secondaryKeywords || [],
                            contentType: idea.contentType || 'guide',
                            targetAudience: idea.targetAudience,
                            uniqueAngle: idea.uniqueAngle,
                            estimatedWordCount: idea.estimatedWordCount || 1500,
                        }),
                    }
                )

                const outlineData = await outlineResponse.json()
                if (!outlineData.success) {
                    throw new Error(
                        outlineData.error || 'Failed to generate outline'
                    )
                }

                outline = outlineData.sections
                setProgress(35)
            } else {
                setProgress(35)
            }

            // Step 2: Generate content
            setStep('content')

            // Build outline structure for content generation
            const outlineForContent = {
                tldr: idea.outline?.slice(0, 3).map((s) => s.title) || [
                    'Key takeaway 1',
                    'Key takeaway 2',
                ],
                introduction: {
                    hook: `Learn everything you need to know about ${idea.topic || idea.title}`,
                    preview: `This guide covers ${idea.title}`,
                },
                sections: (idea.outline || []).map((s) => ({
                    title: s.title,
                    description: s.description || s.title,
                    keyPoints: [],
                    subsections:
                        s.subsections?.map((sub) => ({
                            title: sub.title,
                            description: sub.description,
                        })) || [],
                })),
                conclusion: {
                    summaryPoints: ['Summary point 1', 'Summary point 2'],
                    nextSteps: 'Contact us to learn more',
                },
            }

            // If outline is empty, create a basic structure
            if (outlineForContent.sections.length === 0) {
                outlineForContent.sections = [
                    {
                        title: 'Introduction',
                        description: 'Overview of the topic',
                        keyPoints: [],
                        subsections: [],
                    },
                    {
                        title: 'Key Information',
                        description: 'Main content',
                        keyPoints: [],
                        subsections: [],
                    },
                    {
                        title: 'What to Expect',
                        description: 'Expectations and outcomes',
                        keyPoints: [],
                        subsections: [],
                    },
                ]
            }

            const contentResponse = await fetch(
                '/api/blog/generate-post-content',
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        title: idea.title,
                        topic: idea.topic || idea.title,
                        primaryKeyword: idea.primaryKeyword || '',
                        secondaryKeywords: idea.secondaryKeywords || [],
                        targetAudience: idea.targetAudience,
                        uniqueAngle: idea.uniqueAngle,
                        outline: outlineForContent,
                        estimatedWordCount: idea.estimatedWordCount || 1500,
                    }),
                }
            )

            const contentData = await contentResponse.json()
            if (!contentData.success) {
                throw new Error(
                    contentData.error || 'Failed to generate content'
                )
            }

            setGeneratedContent({
                content: contentData.content,
                metaDescription: contentData.metaDescription,
                excerpt: contentData.excerpt,
            })
            setProgress(70)

            // Step 3: Save as draft blog post
            setStep('saving')

            // Generate slug from title
            const slug = idea.title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '')

            const createResult = await createBlogPost({
                title: idea.title,
                slug,
                content: contentData.content,
                metaDescription: contentData.metaDescription,
                excerpt: contentData.excerpt,
                primaryKeyword: idea.primaryKeyword,
                secondaryKeywords: idea.secondaryKeywords,
                authorId: idea.assignedAuthorId,
                status: 'draft',
            })

            if (!createResult.success) {
                throw new Error(
                    createResult.error || 'Failed to create blog post'
                )
            }

            setProgress(85)

            // Step 4: Link idea to blog post
            if (createResult.id) {
                await linkIdeaToBlogPost(idea.id, createResult.id)
                setPostId(createResult.id)
            }

            setProgress(100)
            setStep('complete')
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
            setStep('error')
        }
    }

    const handleViewPost = () => {
        if (postId) {
            router.push(`/blog/posts/${postId}/edit`)
        }
    }

    const handleClose = () => {
        if (step === 'complete') {
            // Refresh the page to update the idea status
            router.refresh()
        }
        onOpenChange(false)
        // Reset state
        setTimeout(() => {
            setStep('idle')
            setProgress(0)
            setError(null)
            setGeneratedContent(null)
            setPostId(null)
        }, 300)
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className='sm:max-w-md'>
                <DialogHeader>
                    <DialogTitle className='flex items-center gap-2'>
                        <Sparkles className='h-5 w-5 text-amber-500' />
                        Generate Draft
                    </DialogTitle>
                    <DialogDescription>
                        {step === 'idle' &&
                            'Generate a full blog post from this idea'}
                        {step === 'outline' && 'Generating outline...'}
                        {step === 'content' && 'Writing content...'}
                        {step === 'saving' && 'Saving draft...'}
                        {step === 'complete' && 'Draft created successfully!'}
                        {step === 'error' && 'An error occurred'}
                    </DialogDescription>
                </DialogHeader>

                <div className='py-6'>
                    {step === 'idle' && (
                        <div className='space-y-4'>
                            <div className='rounded-lg border bg-stone-50 p-4'>
                                <h4 className='mb-2 font-medium'>
                                    {idea.title}
                                </h4>
                                <p className='text-muted-foreground text-sm'>
                                    {idea.topic || 'No topic set'}
                                </p>
                            </div>
                            <p className='text-muted-foreground text-sm'>
                                This will generate an outline (if needed) and
                                create a complete blog post draft based on this
                                idea.
                            </p>
                        </div>
                    )}

                    {(step === 'outline' ||
                        step === 'content' ||
                        step === 'saving') && (
                        <div className='space-y-4'>
                            <div className='space-y-2'>
                                <div className='flex items-center justify-between text-sm'>
                                    <span>
                                        {step === 'outline' &&
                                            'Generating outline...'}
                                        {step === 'content' &&
                                            'Writing content...'}
                                        {step === 'saving' && 'Saving draft...'}
                                    </span>
                                    <span className='text-muted-foreground'>
                                        {progress}%
                                    </span>
                                </div>
                                <Progress value={progress} className='h-2' />
                            </div>

                            <div className='space-y-2'>
                                <StepIndicator
                                    icon={ListTree}
                                    label='Generate Outline'
                                    status={
                                        step === 'outline'
                                            ? 'loading'
                                            : progress >= 35
                                              ? 'complete'
                                              : 'pending'
                                    }
                                />
                                <StepIndicator
                                    icon={BookOpen}
                                    label='Write Content'
                                    status={
                                        step === 'content'
                                            ? 'loading'
                                            : progress >= 70
                                              ? 'complete'
                                              : 'pending'
                                    }
                                />
                                <StepIndicator
                                    icon={FileText}
                                    label='Save Draft'
                                    status={
                                        step === 'saving'
                                            ? 'loading'
                                            : progress >= 100
                                              ? 'complete'
                                              : 'pending'
                                    }
                                />
                            </div>
                        </div>
                    )}

                    {step === 'complete' && (
                        <div className='flex flex-col items-center py-4 text-center'>
                            <div className='mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100'>
                                <Check className='h-8 w-8 text-green-600' />
                            </div>
                            <h3 className='mb-2 text-lg font-medium'>
                                Draft Created!
                            </h3>
                            <p className='text-muted-foreground text-sm'>
                                Your blog post draft is ready for review and
                                editing.
                            </p>
                            {generatedContent && (
                                <p className='text-muted-foreground mt-2 text-xs'>
                                    ~
                                    {Math.round(
                                        generatedContent.content.split(' ')
                                            .length
                                    )}{' '}
                                    words generated
                                </p>
                            )}
                        </div>
                    )}

                    {step === 'error' && (
                        <div className='flex flex-col items-center py-4 text-center'>
                            <div className='mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100'>
                                <AlertTriangle className='h-8 w-8 text-red-600' />
                            </div>
                            <h3 className='mb-2 text-lg font-medium'>
                                Generation Failed
                            </h3>
                            <p className='text-muted-foreground text-sm'>
                                {error || 'An unexpected error occurred'}
                            </p>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    {step === 'idle' && (
                        <>
                            <Button variant='outline' onClick={handleClose}>
                                Cancel
                            </Button>
                            <Button onClick={handleGenerate}>
                                <Sparkles className='mr-2 h-4 w-4' />
                                Generate Draft
                            </Button>
                        </>
                    )}

                    {(step === 'outline' ||
                        step === 'content' ||
                        step === 'saving') && (
                        <Button disabled>
                            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                            Generating...
                        </Button>
                    )}

                    {step === 'complete' && (
                        <>
                            <Button variant='outline' onClick={handleClose}>
                                Close
                            </Button>
                            <Button onClick={handleViewPost}>
                                <FileText className='mr-2 h-4 w-4' />
                                Edit Draft
                            </Button>
                        </>
                    )}

                    {step === 'error' && (
                        <>
                            <Button variant='outline' onClick={handleClose}>
                                Close
                            </Button>
                            <Button onClick={handleGenerate}>Try Again</Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
