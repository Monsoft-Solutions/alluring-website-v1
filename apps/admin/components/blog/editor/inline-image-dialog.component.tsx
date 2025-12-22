'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
    Loader2,
    Sparkles,
    Wand2,
    Image as ImageIcon,
    BarChart,
    Megaphone,
    Palette,
    Camera,
} from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@workspace/ui/components/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@workspace/ui/components/dialog'
import { Textarea } from '@workspace/ui/components/textarea'
import { Label } from '@workspace/ui/components/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select'
import { cn } from '@workspace/ui/lib/utils'

import {
    INLINE_IMAGE_TYPES,
    type InlineImageTypeId,
} from '@/lib/constants/inline-image-types.constant'
import {
    IMAGE_MODELS,
    type ImageModelId,
} from '@/lib/services/fal-image-generation.service'

type InlineImageDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    selectedText: string
    blogPostId?: string
    onImageGenerated: (imageUrl: string, altText: string) => void
}

const ICON_MAP = {
    BarChart,
    Megaphone,
    Palette,
    Camera,
} as const

export function InlineImageDialog({
    open,
    onOpenChange,
    selectedText,
    blogPostId,
    onImageGenerated,
}: InlineImageDialogProps) {
    const [selectedType, setSelectedType] = useState<InlineImageTypeId>(
        INLINE_IMAGE_TYPES[0].id
    )
    const [prompt, setPrompt] = useState('')
    const [selectedModel, setSelectedModel] =
        useState<ImageModelId>('gpt-image-1.5')
    const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false)
    const [isGeneratingImage, setIsGeneratingImage] = useState(false)

    // Ref to track previous open state for auto-generation
    const wasOpenRef = useRef(false)

    const handleGeneratePrompt = useCallback(async () => {
        if (!selectedText) {
            toast.error('No text selected')
            return
        }

        setIsGeneratingPrompt(true)
        try {
            const response = await fetch(
                '/api/blog/generate-inline-image-prompt',
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        selectedText,
                        imageType: selectedType,
                        blogPostId,
                    }),
                }
            )

            const data = (await response.json()) as {
                success: boolean
                prompt?: string
                error?: string
            }

            if (data.success && data.prompt) {
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
    }, [selectedText, selectedType, blogPostId])

    // Auto-generate prompt when dialog opens with selected text
    useEffect(() => {
        // Only trigger when dialog transitions from closed to open
        if (open && !wasOpenRef.current && selectedText && !prompt) {
            void handleGeneratePrompt()
        }
        wasOpenRef.current = open
    }, [open, selectedText, prompt, handleGeneratePrompt])

    const handleTypeChange = useCallback(
        (newType: InlineImageTypeId) => {
            setSelectedType(newType)
            // Auto-regenerate prompt when type changes
            if (selectedText && !isGeneratingPrompt) {
                setPrompt('')
                // Delay slightly so state updates properly
                setTimeout(() => {
                    void handleGeneratePrompt()
                }, 100)
            }
        },
        [selectedText, isGeneratingPrompt, handleGeneratePrompt]
    )

    const handleGenerateImage = useCallback(async () => {
        if (!blogPostId) {
            toast.error('Please save the post first before generating images')
            return
        }

        if (!prompt) {
            toast.error('Please generate or enter a prompt first')
            return
        }

        setIsGeneratingImage(true)
        try {
            const response = await fetch('/api/blog/generate-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    blogPostId,
                    prompt,
                    model: selectedModel,
                    numImages: 1,
                }),
            })

            const data = (await response.json()) as {
                success: boolean
                images?: Array<{ imageUrl: string; alt: string }>
                model?: string
                error?: string
            }

            if (data.success && data.images && data.images.length > 0) {
                const image = data.images[0]
                if (image) {
                    toast.success(`Image generated with ${data.model}!`)

                    // Insert image into editor
                    onImageGenerated(image.imageUrl, image.alt)

                    // Close dialog and reset
                    onOpenChange(false)
                    setPrompt('')
                } else {
                    toast.error('Image data is missing')
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
    }, [blogPostId, prompt, selectedModel, onImageGenerated, onOpenChange])

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='max-h-[90vh] max-w-3xl overflow-y-auto'>
                <DialogHeader>
                    <DialogTitle className='flex items-center gap-2'>
                        <Sparkles className='h-5 w-5' />
                        Generate Inline Image
                    </DialogTitle>
                    <DialogDescription>
                        Create an AI-generated image based on your selected text
                    </DialogDescription>
                </DialogHeader>

                <div className='space-y-6 py-4'>
                    {/* Selected Text Preview */}
                    <div className='space-y-2'>
                        <Label className='text-sm font-medium'>
                            Selected Text
                        </Label>
                        <div className='max-h-24 overflow-y-auto rounded-lg border bg-stone-50 p-3 text-sm text-stone-700'>
                            {selectedText || 'No text selected'}
                        </div>
                    </div>

                    {/* Image Type Selection */}
                    <div className='space-y-2'>
                        <Label className='text-sm font-medium'>
                            Image Type
                        </Label>
                        <div className='grid grid-cols-2 gap-3'>
                            {INLINE_IMAGE_TYPES.map((type) => {
                                const Icon = ICON_MAP[type.icon]
                                return (
                                    <button
                                        key={type.id}
                                        type='button'
                                        onClick={() =>
                                            handleTypeChange(type.id)
                                        }
                                        className={cn(
                                            'flex flex-col items-start gap-2 rounded-lg border-2 p-4 text-left transition-all hover:border-stone-300',
                                            selectedType === type.id
                                                ? 'border-stone-900 bg-stone-50'
                                                : 'border-stone-200 bg-white'
                                        )}
                                    >
                                        <div className='flex items-center gap-2'>
                                            <Icon className='h-5 w-5' />
                                            <span className='font-medium'>
                                                {type.name}
                                            </span>
                                        </div>
                                        <p className='text-xs text-stone-600'>
                                            {type.description}
                                        </p>
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Image Prompt */}
                    <div className='space-y-2'>
                        <div className='flex items-center justify-between'>
                            <Label htmlFor='inline-image-prompt'>
                                Image Prompt
                            </Label>
                            <Button
                                type='button'
                                variant='outline'
                                size='sm'
                                onClick={handleGeneratePrompt}
                                disabled={isGeneratingPrompt || !selectedText}
                            >
                                {isGeneratingPrompt ? (
                                    <>
                                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Wand2 className='mr-2 h-4 w-4' />
                                        Regenerate Prompt
                                    </>
                                )}
                            </Button>
                        </div>
                        <Textarea
                            id='inline-image-prompt'
                            placeholder='AI-generated prompt will appear here...'
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            rows={6}
                            className='resize-none font-mono text-sm'
                        />
                        <p className='text-xs text-stone-500'>
                            Optimized prompt for{' '}
                            {
                                INLINE_IMAGE_TYPES.find(
                                    (t) => t.id === selectedType
                                )?.name
                            }{' '}
                            style. Edit as needed before generating.
                        </p>
                    </div>

                    {/* Model Selection */}
                    <div className='space-y-2'>
                        <Label htmlFor='model-select'>AI Model</Label>
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
                                    <SelectItem key={model.id} value={model.id}>
                                        {model.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <p className='text-xs text-stone-500'>
                            Choose the AI model for image generation
                        </p>
                    </div>

                    {/* Generate Button */}
                    <div className='flex justify-end gap-3 pt-2'>
                        <Button
                            type='button'
                            variant='outline'
                            onClick={() => onOpenChange(false)}
                            disabled={isGeneratingImage}
                        >
                            Cancel
                        </Button>
                        <Button
                            type='button'
                            onClick={handleGenerateImage}
                            disabled={
                                isGeneratingImage || !prompt || !blogPostId
                            }
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
                                    Generate & Insert Image
                                </>
                            )}
                        </Button>
                    </div>
                    {isGeneratingImage && (
                        <p className='text-center text-xs text-stone-500'>
                            This may take 30-60 seconds...
                        </p>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
