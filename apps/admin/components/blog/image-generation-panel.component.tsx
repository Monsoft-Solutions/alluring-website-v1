'use client'

import { useState } from 'react'
import { Loader2, Sparkles, Wand2, Image as ImageIcon } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@workspace/ui/components/button'
import { Textarea } from '@workspace/ui/components/textarea'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card'
import { Label } from '@workspace/ui/components/label'
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@workspace/ui/components/collapsible'

type ImageGenerationPanelProps = {
    blogPostId?: string
    initialSummary?: string | null
    onImageGenerated?: (imageId: string, imageUrl: string) => void
}

export function ImageGenerationPanel({
    blogPostId,
    initialSummary,
    onImageGenerated,
}: ImageGenerationPanelProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [summary, setSummary] = useState(initialSummary || '')
    const [prompt, setPrompt] = useState('')
    const [isGeneratingSummary, setIsGeneratingSummary] = useState(false)
    const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false)
    const [isGeneratingImage, setIsGeneratingImage] = useState(false)

    const handleGenerateSummary = async () => {
        if (!blogPostId) {
            toast.error(
                'Please save the post first before generating a summary'
            )
            return
        }

        setIsGeneratingSummary(true)
        try {
            const response = await fetch('/api/blog/generate-summary', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ blogPostId }),
            })

            const data = await response.json()

            if (data.success) {
                setSummary(data.summary)
                toast.success('Summary generated!')
            } else {
                toast.error(data.error || 'Failed to generate summary')
            }
        } catch (error) {
            console.error('Error generating summary:', error)
            toast.error('Failed to generate summary')
        } finally {
            setIsGeneratingSummary(false)
        }
    }

    const handleGeneratePrompt = async () => {
        if (!blogPostId) {
            toast.error('Please save the post first before generating a prompt')
            return
        }

        if (!summary) {
            toast.error('Please generate a summary first')
            return
        }

        setIsGeneratingPrompt(true)
        try {
            const response = await fetch('/api/blog/generate-image-prompt', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ blogPostId }),
            })

            const data = await response.json()

            if (data.success) {
                setPrompt(data.prompt)
                toast.success('Prompt generated!')
            } else {
                toast.error(data.error || 'Failed to generate prompt')
            }
        } catch (error) {
            console.error('Error generating prompt:', error)
            toast.error('Failed to generate prompt')
        } finally {
            setIsGeneratingPrompt(false)
        }
    }

    const handleGenerateImage = async () => {
        if (!blogPostId) {
            toast.error('Please save the post first before generating an image')
            return
        }

        setIsGeneratingImage(true)
        try {
            const response = await fetch('/api/blog/generate-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    blogPostId,
                    prompt: prompt || undefined,
                }),
            })

            const data = await response.json()

            if (data.success) {
                toast.success('Image generated successfully!')

                // Update summary if it was generated
                if (data.summary) {
                    setSummary(data.summary)
                }

                // Update prompt if it was generated
                if (data.prompt && !prompt) {
                    setPrompt(data.prompt)
                }

                // Notify parent component
                if (onImageGenerated) {
                    onImageGenerated(data.imageId, data.imageUrl)
                }
            } else {
                toast.error(data.error || 'Failed to generate image')
            }
        } catch (error) {
            console.error('Error generating image:', error)
            toast.error('Failed to generate image')
        } finally {
            setIsGeneratingImage(false)
        }
    }

    if (!blogPostId) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className='flex items-center gap-2 text-lg'>
                        <Sparkles className='h-5 w-5' />
                        AI Image Generation
                    </CardTitle>
                    <CardDescription>
                        Save the post first to enable AI image generation
                    </CardDescription>
                </CardHeader>
            </Card>
        )
    }

    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <Card>
                <CollapsibleTrigger asChild>
                    <CardHeader className='hover:bg-muted/50 cursor-pointer'>
                        <CardTitle className='flex items-center gap-2 text-lg'>
                            <Sparkles className='h-5 w-5' />
                            AI Image Generation
                            <span className='text-muted-foreground ml-auto text-sm font-normal'>
                                {isOpen ? 'Hide' : 'Show'}
                            </span>
                        </CardTitle>
                        <CardDescription>
                            Generate featured images using AI based on your post
                            content
                        </CardDescription>
                    </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <CardContent className='space-y-6 pt-6'>
                        {/* Summary Section */}
                        <div className='space-y-2'>
                            <div className='flex items-center justify-between'>
                                <Label htmlFor='ai-summary'>
                                    1. Content Summary
                                </Label>
                                <Button
                                    type='button'
                                    variant='outline'
                                    size='sm'
                                    onClick={handleGenerateSummary}
                                    disabled={isGeneratingSummary}
                                >
                                    {isGeneratingSummary ? (
                                        <>
                                            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className='mr-2 h-4 w-4' />
                                            Generate Summary
                                        </>
                                    )}
                                </Button>
                            </div>
                            <Textarea
                                id='ai-summary'
                                placeholder='AI-generated summary will appear here...'
                                value={summary}
                                onChange={(e) => setSummary(e.target.value)}
                                rows={3}
                                className='resize-none'
                            />
                            <p className='text-muted-foreground text-xs'>
                                A visual summary of your post content for image
                                generation
                            </p>
                        </div>

                        {/* Prompt Section */}
                        <div className='space-y-2'>
                            <div className='flex items-center justify-between'>
                                <Label htmlFor='image-prompt'>
                                    2. Image Prompt
                                </Label>
                                <Button
                                    type='button'
                                    variant='outline'
                                    size='sm'
                                    onClick={handleGeneratePrompt}
                                    disabled={isGeneratingPrompt || !summary}
                                >
                                    {isGeneratingPrompt ? (
                                        <>
                                            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            <Wand2 className='mr-2 h-4 w-4' />
                                            Generate Prompt
                                        </>
                                    )}
                                </Button>
                            </div>
                            <Textarea
                                id='image-prompt'
                                placeholder='AI-generated image prompt will appear here...'
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                rows={4}
                                className='resize-none'
                            />
                            <p className='text-muted-foreground text-xs'>
                                Optimized prompt for AI image generation
                            </p>
                        </div>

                        {/* Generate Button */}
                        <div className='pt-2'>
                            <Button
                                type='button'
                                onClick={handleGenerateImage}
                                disabled={isGeneratingImage}
                                className='w-full'
                                size='lg'
                            >
                                {isGeneratingImage ? (
                                    <>
                                        <Loader2 className='mr-2 h-5 w-5 animate-spin' />
                                        Generating Image...
                                    </>
                                ) : (
                                    <>
                                        <ImageIcon className='mr-2 h-5 w-5' />
                                        Generate Featured Image
                                    </>
                                )}
                            </Button>
                            <p className='text-muted-foreground mt-2 text-center text-xs'>
                                {isGeneratingImage
                                    ? 'This may take 30-60 seconds...'
                                    : 'Creates a professional image for your blog post'}
                            </p>
                        </div>
                    </CardContent>
                </CollapsibleContent>
            </Card>
        </Collapsible>
    )
}
