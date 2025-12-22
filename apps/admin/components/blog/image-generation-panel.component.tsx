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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select'

import {
    IMAGE_MODELS,
    type ImageModelId,
} from '@/lib/services/fal-image-generation.service'

/**
 * Available image count options
 */
const IMAGE_COUNT_OPTIONS = [1, 2, 3] as const

type ImageCount = (typeof IMAGE_COUNT_OPTIONS)[number]

type ImageGenerationPanelProps = {
    blogPostId?: string
    initialSummary?: string | null
    onImagesGenerated?: (count: number) => void
}

export function ImageGenerationPanel({
    blogPostId,
    initialSummary,
    onImagesGenerated,
}: ImageGenerationPanelProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [summary, setSummary] = useState(initialSummary || '')
    const [prompt, setPrompt] = useState('')
    const [selectedModel, setSelectedModel] =
        useState<ImageModelId>('gpt-image-1.5')
    const [numImages, setNumImages] = useState<ImageCount>(1)
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

            const data = (await response.json()) as {
                success: boolean
                summary: string
                error?: string
            }

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

            const data = (await response.json()) as {
                success: boolean
                prompt: string
                error?: string
            }

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
                    model: selectedModel,
                    numImages,
                }),
            })

            const data = (await response.json()) as {
                success: boolean
                images?: unknown[]
                model: string
                summary?: string
                prompt?: string
                error?: string
            }

            if (data.success) {
                const imageCount = data.images?.length || 1
                toast.success(
                    `${imageCount} image${imageCount > 1 ? 's' : ''} generated with ${data.model}!`
                )

                // Update summary if it was generated
                if (data.summary) {
                    setSummary(data.summary)
                }

                // Update prompt if it was generated
                if (data.prompt && !prompt) {
                    setPrompt(data.prompt)
                }

                // Notify parent component to refresh gallery
                if (onImagesGenerated) {
                    onImagesGenerated(imageCount)
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
                                A content summary of your post for image prompt
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

                        {/* Model and Count Selection */}
                        <div className='grid gap-4 sm:grid-cols-2'>
                            <div className='space-y-2'>
                                <Label htmlFor='model-select'>3. Model</Label>
                                <Select
                                    value={selectedModel}
                                    onValueChange={(value) =>
                                        setSelectedModel(value as ImageModelId)
                                    }
                                >
                                    <SelectTrigger id='model-select'>
                                        <SelectValue placeholder='Select model' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {IMAGE_MODELS.map((model) => (
                                            <SelectItem
                                                key={model.id}
                                                value={model.id}
                                            >
                                                {model.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className='space-y-2'>
                                <Label htmlFor='count-select'>
                                    Images to Generate
                                </Label>
                                <Select
                                    value={numImages.toString()}
                                    onValueChange={(value) =>
                                        setNumImages(
                                            parseInt(value) as ImageCount
                                        )
                                    }
                                >
                                    <SelectTrigger id='count-select'>
                                        <SelectValue placeholder='Select count' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {IMAGE_COUNT_OPTIONS.map((count) => (
                                            <SelectItem
                                                key={count}
                                                value={count.toString()}
                                            >
                                                {count}{' '}
                                                {count === 1
                                                    ? 'image'
                                                    : 'images'}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
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
                                        Generating {numImages} Image
                                        {numImages > 1 ? 's' : ''}...
                                    </>
                                ) : (
                                    <>
                                        <ImageIcon className='mr-2 h-5 w-5' />
                                        Generate {numImages} Featured Image
                                        {numImages > 1 ? 's' : ''}
                                    </>
                                )}
                            </Button>
                            <p className='text-muted-foreground mt-2 text-center text-xs'>
                                {isGeneratingImage
                                    ? `This may take ${30 + numImages * 20}-${60 + numImages * 30} seconds...`
                                    : `Creates ${numImages} professional image${numImages > 1 ? 's' : ''} using ${IMAGE_MODELS.find((m) => m.id === selectedModel)?.name}`}
                            </p>
                        </div>
                    </CardContent>
                </CollapsibleContent>
            </Card>
        </Collapsible>
    )
}
