'use client'

import { useState, useCallback } from 'react'
import {
    Loader2,
    Sparkles,
    Wand2,
    Image as ImageIcon,
    Building2,
    Palmtree,
    Flower2,
    Square,
    User,
    Home,
    Heart,
    Coffee,
    Gem,
    Camera,
    Crown,
    Stethoscope,
    Sun,
    Palette,
    Sunrise,
    Lightbulb,
    CloudSun,
    Moon,
    Cloud,
    Circle,
    Waves,
    Paintbrush,
    Contrast,
    Target,
    LayoutGrid,
    ZoomIn,
    Maximize,
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
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@workspace/ui/components/tabs'
import { ScrollArea } from '@workspace/ui/components/scroll-area'
import { cn } from '@workspace/ui/lib/utils'

import {
    SCENE_OPTIONS,
    SUBJECT_OPTIONS,
    STYLE_OPTIONS,
    LIGHTING_OPTIONS,
    COLOR_OPTIONS,
    COMPOSITION_OPTIONS,
    DEFAULT_FEATURED_IMAGE_OPTIONS,
    type FeaturedImageOptions,
} from '@/lib/constants/featured-image-options.constant'
import {
    IMAGE_MODELS,
    type ImageModelId,
} from '@/lib/services/fal-image-generation.service'

/**
 * Icon mapping for featured image options
 */
const ICON_MAP = {
    // Scene icons
    Building2,
    Palmtree,
    Sparkles,
    Flower2,
    Square,
    // Subject icons
    User,
    Home,
    Heart,
    Coffee,
    Gem,
    // Style icons
    Camera,
    Crown,
    Stethoscope,
    Sun,
    Palette,
    // Lighting icons
    Sunrise,
    Lightbulb,
    CloudSun,
    Moon,
    Cloud,
    // Color icons
    Circle,
    Waves,
    Paintbrush,
    Contrast,
    // Composition icons
    Target,
    LayoutGrid,
    ZoomIn,
    Maximize,
} as const

type IconName = keyof typeof ICON_MAP

/**
 * Available image count options
 */
const IMAGE_COUNT_OPTIONS = [1, 2, 3] as const
type ImageCount = (typeof IMAGE_COUNT_OPTIONS)[number]

type FeaturedImageDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    blogPostId: string
    initialSummary?: string | null
    onImagesGenerated?: (count: number) => void
    onSummaryChange?: (summary: string) => void
}

export function FeaturedImageDialog({
    open,
    onOpenChange,
    blogPostId,
    initialSummary,
    onImagesGenerated,
    onSummaryChange,
}: FeaturedImageDialogProps) {
    // Customization options state
    const [options, setOptions] = useState<FeaturedImageOptions>(
        DEFAULT_FEATURED_IMAGE_OPTIONS
    )

    // Generated content state
    const [summary, setSummary] = useState(initialSummary || '')
    const [prompt, setPrompt] = useState('')

    // Generation settings
    const [selectedModel, setSelectedModel] =
        useState<ImageModelId>('gpt-image-1.5')
    const [numImages, setNumImages] = useState<ImageCount>(1)

    // Loading states
    const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false)
    const [isGeneratingImage, setIsGeneratingImage] = useState(false)

    const updateOption = useCallback(
        <K extends keyof FeaturedImageOptions>(
            key: K,
            value: FeaturedImageOptions[K]
        ) => {
            setOptions((prev) => ({ ...prev, [key]: value }))
            // Clear prompt when options change to encourage regeneration
            setPrompt('')
        },
        []
    )

    const handleGeneratePrompt = useCallback(async () => {
        setIsGeneratingPrompt(true)
        try {
            const response = await fetch(
                '/api/blog/generate-featured-image-prompt',
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        blogPostId,
                        ...options,
                    }),
                }
            )

            const data = (await response.json()) as {
                success: boolean
                prompt?: string
                summary?: string
                wasGeneratedSummary?: boolean
                error?: string
            }

            if (data.success && data.prompt) {
                setPrompt(data.prompt)
                if (data.summary) {
                    setSummary(data.summary)
                    onSummaryChange?.(data.summary)
                }
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
    }, [blogPostId, options, onSummaryChange])

    const handleGenerateImage = useCallback(async () => {
        if (!prompt) {
            toast.error('Please generate a prompt first')
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
                    numImages,
                }),
            })

            const data = (await response.json()) as {
                success: boolean
                images?: unknown[]
                model?: string
                error?: string
            }

            if (data.success) {
                const imageCount = data.images?.length || 1
                toast.success(
                    `${imageCount} image${imageCount > 1 ? 's' : ''} generated with ${data.model}!`
                )

                // Notify parent component to refresh gallery
                onImagesGenerated?.(imageCount)

                // Close dialog
                onOpenChange(false)
            } else {
                toast.error(data.error || 'Failed to generate image')
            }
        } catch (error) {
            console.error('Error generating image:', error)
            toast.error('Failed to generate image')
        } finally {
            setIsGeneratingImage(false)
        }
    }, [
        blogPostId,
        prompt,
        selectedModel,
        numImages,
        onImagesGenerated,
        onOpenChange,
    ])

    const renderOptionCards = <T extends string>(
        optionsList: ReadonlyArray<{
            id: T
            name: string
            icon: string
            description: string
        }>,
        selectedValue: T,
        onSelect: (value: T) => void
    ) => {
        return (
            <div className='grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3'>
                {optionsList.map((option) => {
                    const Icon = ICON_MAP[option.icon as IconName] || Square
                    const isSelected = selectedValue === option.id
                    return (
                        <button
                            key={option.id}
                            type='button'
                            onClick={() => onSelect(option.id)}
                            className={cn(
                                'flex flex-col items-start gap-1 rounded-lg border-2 p-3 text-left transition-all hover:border-stone-300',
                                isSelected
                                    ? 'border-stone-900 bg-stone-50'
                                    : 'border-stone-200 bg-white'
                            )}
                        >
                            <div className='flex items-center gap-2'>
                                <Icon className='h-4 w-4 text-stone-600' />
                                <span className='text-sm font-medium'>
                                    {option.name}
                                </span>
                            </div>
                            <p className='line-clamp-2 text-xs text-stone-500'>
                                {option.description}
                            </p>
                        </button>
                    )
                })}
            </div>
        )
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className='max-h-[90vh] max-w-4xl overflow-hidden p-0'
                size='xl'
            >
                <DialogHeader className='border-b px-6 py-4'>
                    <DialogTitle className='flex items-center gap-2'>
                        <Sparkles className='h-5 w-5' />
                        Generate Featured Image
                    </DialogTitle>
                    <DialogDescription>
                        Customize your image by selecting options below, then
                        generate a tailored prompt
                    </DialogDescription>
                </DialogHeader>

                <div className='grid gap-6 lg:grid-cols-2'>
                    {/* Left Column - Customization Options */}
                    <div className='border-r'>
                        <Tabs defaultValue='scene' className='w-full'>
                            <div className='border-b px-4'>
                                <TabsList className='h-auto w-full flex-wrap justify-start gap-1 bg-transparent p-2'>
                                    <TabsTrigger
                                        value='scene'
                                        className='text-xs'
                                    >
                                        Scene
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value='subject'
                                        className='text-xs'
                                    >
                                        Subject
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value='style'
                                        className='text-xs'
                                    >
                                        Style
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value='lighting'
                                        className='text-xs'
                                    >
                                        Lighting
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value='color'
                                        className='text-xs'
                                    >
                                        Colors
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value='composition'
                                        className='text-xs'
                                    >
                                        Composition
                                    </TabsTrigger>
                                </TabsList>
                            </div>

                            <ScrollArea className='h-[400px] px-4 py-4'>
                                <TabsContent value='scene' className='mt-0'>
                                    <div className='space-y-2'>
                                        <Label className='text-sm font-medium'>
                                            Scene / Environment
                                        </Label>
                                        <p className='text-xs text-stone-500'>
                                            Choose the setting and background
                                            for your image
                                        </p>
                                        {renderOptionCards(
                                            SCENE_OPTIONS,
                                            options.scene,
                                            (v) => updateOption('scene', v)
                                        )}
                                    </div>
                                </TabsContent>

                                <TabsContent value='subject' className='mt-0'>
                                    <div className='space-y-2'>
                                        <Label className='text-sm font-medium'>
                                            Subject Type
                                        </Label>
                                        <p className='text-xs text-stone-500'>
                                            Choose the main focus of your image
                                        </p>
                                        {renderOptionCards(
                                            SUBJECT_OPTIONS,
                                            options.subject,
                                            (v) => updateOption('subject', v)
                                        )}
                                    </div>
                                </TabsContent>

                                <TabsContent value='style' className='mt-0'>
                                    <div className='space-y-2'>
                                        <Label className='text-sm font-medium'>
                                            Image Style
                                        </Label>
                                        <p className='text-xs text-stone-500'>
                                            Choose the visual style and
                                            aesthetic
                                        </p>
                                        {renderOptionCards(
                                            STYLE_OPTIONS,
                                            options.style,
                                            (v) => updateOption('style', v)
                                        )}
                                    </div>
                                </TabsContent>

                                <TabsContent value='lighting' className='mt-0'>
                                    <div className='space-y-2'>
                                        <Label className='text-sm font-medium'>
                                            Lighting / Mood
                                        </Label>
                                        <p className='text-xs text-stone-500'>
                                            Choose the lighting conditions and
                                            atmosphere
                                        </p>
                                        {renderOptionCards(
                                            LIGHTING_OPTIONS,
                                            options.lighting,
                                            (v) => updateOption('lighting', v)
                                        )}
                                    </div>
                                </TabsContent>

                                <TabsContent value='color' className='mt-0'>
                                    <div className='space-y-2'>
                                        <Label className='text-sm font-medium'>
                                            Color Palette
                                        </Label>
                                        <p className='text-xs text-stone-500'>
                                            Choose the dominant colors for your
                                            image
                                        </p>
                                        {renderOptionCards(
                                            COLOR_OPTIONS,
                                            options.colorPalette,
                                            (v) =>
                                                updateOption('colorPalette', v)
                                        )}
                                    </div>
                                </TabsContent>

                                <TabsContent
                                    value='composition'
                                    className='mt-0'
                                >
                                    <div className='space-y-2'>
                                        <Label className='text-sm font-medium'>
                                            Composition
                                        </Label>
                                        <p className='text-xs text-stone-500'>
                                            Choose how the image is framed
                                        </p>
                                        {renderOptionCards(
                                            COMPOSITION_OPTIONS,
                                            options.composition,
                                            (v) =>
                                                updateOption('composition', v)
                                        )}
                                    </div>
                                </TabsContent>
                            </ScrollArea>
                        </Tabs>
                    </div>

                    {/* Right Column - Summary, Prompt, and Generation */}
                    <ScrollArea className='h-[500px] px-6 py-4'>
                        <div className='space-y-6'>
                            {/* Summary Preview */}
                            {summary && (
                                <div className='space-y-2'>
                                    <Label className='text-sm font-medium'>
                                        Post Summary
                                    </Label>
                                    <div className='max-h-20 overflow-y-auto rounded-lg border bg-stone-50 p-3 text-xs text-stone-700'>
                                        {summary}
                                    </div>
                                </div>
                            )}

                            {/* Selected Options Summary */}
                            <div className='space-y-2'>
                                <Label className='text-sm font-medium'>
                                    Selected Options
                                </Label>
                                <div className='flex flex-wrap gap-1'>
                                    {[
                                        SCENE_OPTIONS.find(
                                            (o) => o.id === options.scene
                                        )?.name,
                                        SUBJECT_OPTIONS.find(
                                            (o) => o.id === options.subject
                                        )?.name,
                                        STYLE_OPTIONS.find(
                                            (o) => o.id === options.style
                                        )?.name,
                                        LIGHTING_OPTIONS.find(
                                            (o) => o.id === options.lighting
                                        )?.name,
                                        COLOR_OPTIONS.find(
                                            (o) => o.id === options.colorPalette
                                        )?.name,
                                        COMPOSITION_OPTIONS.find(
                                            (o) => o.id === options.composition
                                        )?.name,
                                    ]
                                        .filter(Boolean)
                                        .map((name) => (
                                            <span
                                                key={name}
                                                className='rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-700'
                                            >
                                                {name}
                                            </span>
                                        ))}
                                </div>
                            </div>

                            {/* Generate Prompt Button */}
                            <div className='space-y-2'>
                                <Button
                                    type='button'
                                    variant='outline'
                                    onClick={handleGeneratePrompt}
                                    disabled={isGeneratingPrompt}
                                    className='w-full'
                                >
                                    {isGeneratingPrompt ? (
                                        <>
                                            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                            Generating Prompt...
                                        </>
                                    ) : (
                                        <>
                                            <Wand2 className='mr-2 h-4 w-4' />
                                            {prompt
                                                ? 'Regenerate Prompt'
                                                : 'Generate Prompt'}
                                        </>
                                    )}
                                </Button>
                            </div>

                            {/* Image Prompt */}
                            <div className='space-y-2'>
                                <Label htmlFor='featured-image-prompt'>
                                    Image Prompt
                                </Label>
                                <Textarea
                                    id='featured-image-prompt'
                                    placeholder='Click "Generate Prompt" to create an optimized prompt based on your selections...'
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    rows={6}
                                    className='resize-none font-mono text-xs'
                                />
                                <p className='text-xs text-stone-500'>
                                    Edit the prompt as needed before generating
                                </p>
                            </div>

                            {/* Model and Count Selection */}
                            <div className='grid gap-4 sm:grid-cols-2'>
                                <div className='space-y-2'>
                                    <Label htmlFor='model-select'>
                                        AI Model
                                    </Label>
                                    <Select
                                        value={selectedModel}
                                        onValueChange={(value) =>
                                            setSelectedModel(
                                                value as ImageModelId
                                            )
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
                                            {IMAGE_COUNT_OPTIONS.map(
                                                (count) => (
                                                    <SelectItem
                                                        key={count}
                                                        value={count.toString()}
                                                    >
                                                        {count}{' '}
                                                        {count === 1
                                                            ? 'image'
                                                            : 'images'}
                                                    </SelectItem>
                                                )
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Generate Image Button */}
                            <div className='space-y-2 pt-2'>
                                <Button
                                    type='button'
                                    onClick={handleGenerateImage}
                                    disabled={
                                        isGeneratingImage ||
                                        !prompt ||
                                        !blogPostId
                                    }
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
                                <p className='text-center text-xs text-stone-500'>
                                    {isGeneratingImage
                                        ? `This may take ${30 + numImages * 20}-${60 + numImages * 30} seconds...`
                                        : `Creates ${numImages} professional image${numImages > 1 ? 's' : ''} using ${IMAGE_MODELS.find((m) => m.id === selectedModel)?.name}`}
                                </p>
                            </div>
                        </div>
                    </ScrollArea>
                </div>

                {/* Footer */}
                <div className='flex justify-end gap-3 border-t px-6 py-4'>
                    <Button
                        type='button'
                        variant='outline'
                        onClick={() => onOpenChange(false)}
                        disabled={isGeneratingImage}
                    >
                        Cancel
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
