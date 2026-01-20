'use client'

import { useCallback, useEffect, useMemo } from 'react'
import { AlertCircle, Check, ImageIcon, Sparkles } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@workspace/ui/components/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@workspace/ui/components/dialog'
import { Progress } from '@workspace/ui/components/progress'
import { ScrollArea } from '@workspace/ui/components/scroll-area'
import { Badge } from '@workspace/ui/components/badge'
import type { GeneratedInlineImage } from '@workspace/ai'

import { useAutoInlineImages } from '@/lib/hooks/use-auto-inline-images.hook'
import type { GeneratedImageWithUIState } from '@/lib/hooks/auto-inline-images.type'
import { ImageGenerationItem } from './image-generation-item.component'

type AutoInlineImagesDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    content: string
    title: string
    blogPostId?: string
    onImagesGenerated: (images: GeneratedInlineImage[]) => void
}

/**
 * Dialog component for auto inline image generation.
 * Shows real-time progress via SSE streaming and allows users to
 * insert generated images into the editor.
 */
export function AutoInlineImagesDialog({
    open,
    onOpenChange,
    content,
    title,
    blogPostId,
    onImagesGenerated,
}: AutoInlineImagesDialogProps) {
    const {
        isGenerating,
        progress,
        analysis,
        generatedImages,
        result,
        error,
        generate,
        cancel,
        reset,
    } = useAutoInlineImages()

    // Start generation when dialog opens
    useEffect(() => {
        if (open && blogPostId && !isGenerating && !result) {
            void generate({
                content,
                title,
                blogPostId,
                maxImages: 5,
            })
        }
    }, [open, blogPostId, content, title, generate, isGenerating, result])

    // Reset state when dialog closes
    useEffect(() => {
        if (!open) {
            reset()
        }
    }, [open, reset])

    const handleClose = useCallback(() => {
        if (isGenerating) {
            cancel()
        }
        onOpenChange(false)
    }, [isGenerating, cancel, onOpenChange])

    const handleInsertAll = useCallback(() => {
        const successfulImages = generatedImages.filter(
            (img) => img.status === 'success' && img.imageUrl
        )

        if (successfulImages.length === 0) {
            toast.error('No images to insert')
            return
        }

        onImagesGenerated(successfulImages)
        toast.success(`${successfulImages.length} image(s) inserted`)
        onOpenChange(false)
    }, [generatedImages, onImagesGenerated, onOpenChange])

    const handleInsertSingle = useCallback(
        (image: GeneratedImageWithUIState) => {
            if (image.status !== 'success' || !image.imageUrl) {
                toast.error('Image not ready')
                return
            }

            onImagesGenerated([image])
            toast.success('Image inserted')
        },
        [onImagesGenerated]
    )

    const successCount = useMemo(
        () => generatedImages.filter((img) => img.status === 'success').length,
        [generatedImages]
    )

    const showInsertButton = result?.success && successCount > 0

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className='max-h-[90vh] max-w-2xl overflow-hidden'>
                <DialogHeader>
                    <DialogTitle className='flex items-center gap-2'>
                        <Sparkles className='h-5 w-5' />
                        Auto Generate Inline Images
                    </DialogTitle>
                    <DialogDescription>
                        AI-powered image generation for optimal content
                        placement
                    </DialogDescription>
                </DialogHeader>

                <div className='flex flex-col gap-4 py-4'>
                    {/* Progress Section */}
                    {isGenerating && progress && (
                        <div className='space-y-2'>
                            <div className='flex items-center justify-between'>
                                <span className='text-sm font-medium'>
                                    {progress.message}
                                </span>
                                <span className='text-muted-foreground text-xs'>
                                    {progress.progress}%
                                </span>
                            </div>
                            <Progress
                                value={progress.progress}
                                className='h-2'
                            />
                        </div>
                    )}

                    {/* Error Display */}
                    {error && !isGenerating && (
                        <div className='flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-red-700'>
                            <AlertCircle className='h-4 w-4 shrink-0' />
                            <span className='text-sm'>{error}</span>
                        </div>
                    )}

                    {/* Analysis Summary */}
                    {analysis && (
                        <div className='space-y-2'>
                            <div className='flex items-center justify-between'>
                                <span className='text-sm font-medium'>
                                    Content Analysis
                                </span>
                                <Badge variant='secondary'>
                                    {analysis.contentAssessment.contentLength}{' '}
                                    words
                                </Badge>
                            </div>
                            <p className='text-muted-foreground text-xs'>
                                Theme: {analysis.contentAssessment.primaryTheme}
                                {analysis.contentAssessment.existingImageCount >
                                    0 &&
                                    ` • ${analysis.contentAssessment.existingImageCount} existing image(s)`}
                            </p>
                            {analysis.notes && (
                                <p className='text-muted-foreground text-xs italic'>
                                    {analysis.notes}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Image Generation List */}
                    {generatedImages.length > 0 && (
                        <div className='space-y-2'>
                            <div className='flex items-center justify-between'>
                                <span className='text-sm font-medium'>
                                    Image Generation
                                </span>
                                <span className='text-muted-foreground text-xs'>
                                    {successCount}/{generatedImages.length}{' '}
                                    complete
                                </span>
                            </div>
                            <ScrollArea className='h-[300px] rounded-lg border'>
                                <div className='space-y-2 p-3'>
                                    {generatedImages.map((image, index) => (
                                        <ImageGenerationItem
                                            key={image.opportunityId}
                                            image={image}
                                            index={index}
                                            analysis={analysis}
                                            onInsert={() =>
                                                handleInsertSingle(image)
                                            }
                                        />
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>
                    )}

                    {/* No Opportunities Message */}
                    {result?.success && result.generatedImages.length === 0 && (
                        <div className='flex flex-col items-center gap-2 rounded-lg border bg-stone-50 py-8'>
                            <ImageIcon className='text-muted-foreground h-8 w-8' />
                            <p className='text-muted-foreground text-sm'>
                                No suitable locations found for inline images
                            </p>
                            <p className='text-muted-foreground text-xs'>
                                The content may be too short or already has good
                                image coverage
                            </p>
                        </div>
                    )}

                    {/* Metrics Summary */}
                    {result?.metrics && (
                        <div className='flex flex-wrap gap-4 text-xs text-stone-500'>
                            <span>
                                Analysis:{' '}
                                {(result.metrics.analysisTimeMs / 1000).toFixed(
                                    1
                                )}
                                s
                            </span>
                            <span>
                                Prompts:{' '}
                                {(
                                    result.metrics.promptGenerationTimeMs / 1000
                                ).toFixed(1)}
                                s
                            </span>
                            <span>
                                Images:{' '}
                                {(
                                    result.metrics.imageGenerationTimeMs / 1000
                                ).toFixed(1)}
                                s
                            </span>
                            <span>
                                Total:{' '}
                                {(result.metrics.totalTimeMs / 1000).toFixed(1)}
                                s
                            </span>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className='flex justify-end gap-3 border-t pt-4'>
                    <Button
                        variant='outline'
                        onClick={handleClose}
                        disabled={isGenerating}
                    >
                        {isGenerating ? 'Cancel' : 'Close'}
                    </Button>
                    {showInsertButton && (
                        <Button onClick={handleInsertAll}>
                            <Check className='mr-2 h-4 w-4' />
                            Insert {successCount} Image
                            {successCount !== 1 ? 's' : ''}
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
