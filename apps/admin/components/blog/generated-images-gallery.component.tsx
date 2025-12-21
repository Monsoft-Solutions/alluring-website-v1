'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Check, Loader2, Trash2, RefreshCw, Expand } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@workspace/ui/components/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card'
import { Badge } from '@workspace/ui/components/badge'
import { ImagePreviewDialog } from './image-preview-dialog.component'

type GeneratedImage = {
    id: string
    url: string
    prompt: string
    createdAt: string
}

type GeneratedImagesGalleryProps = {
    blogPostId?: string
    currentFeaturedImageUrl?: string | null
    onSelectImage?: (imageId: string, imageUrl: string) => void
    refreshTrigger?: number // Used to trigger refresh from parent
}

export function GeneratedImagesGallery({
    blogPostId,
    currentFeaturedImageUrl,
    onSelectImage,
    refreshTrigger,
}: GeneratedImagesGalleryProps) {
    const [images, setImages] = useState<GeneratedImage[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [previewOpen, setPreviewOpen] = useState(false)
    const [previewIndex, setPreviewIndex] = useState(0)

    const fetchImages = async () => {
        if (!blogPostId) return

        setIsLoading(true)
        try {
            const response = await fetch(
                `/api/blog/${blogPostId}/generated-images`
            )
            const data = (await response.json()) as {
                success: boolean
                images?: GeneratedImage[]
            }

            if (data.success) {
                setImages(data.images || [])
            }
        } catch (error) {
            console.error('Error fetching generated images:', error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        void fetchImages()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [blogPostId, refreshTrigger])

    const handleSelectImage = (image: GeneratedImage) => {
        if (onSelectImage) {
            onSelectImage(image.id, image.url)
            toast.success('Featured image updated!')
        }
    }

    const handleDeleteImage = async (imageId: string) => {
        if (!blogPostId) return

        if (!confirm('Are you sure you want to delete this generated image?')) {
            return
        }

        setDeletingId(imageId)
        try {
            const response = await fetch(
                `/api/blog/${blogPostId}/generated-images/${imageId}`,
                {
                    method: 'DELETE',
                }
            )

            const data = (await response.json()) as { success: boolean }

            if (data.success) {
                setImages((prev) => prev.filter((img) => img.id !== imageId))
                toast.success('Image deleted')
            } else {
                toast.error('Failed to delete image')
            }
        } catch (error) {
            console.error('Error deleting image:', error)
            toast.error('Failed to delete image')
        } finally {
            setDeletingId(null)
        }
    }

    const openPreview = (index: number) => {
        setPreviewIndex(index)
        setPreviewOpen(true)
    }

    if (!blogPostId) {
        return null
    }

    return (
        <>
            <Card>
                <CardHeader>
                    <div className='flex items-center justify-between'>
                        <div>
                            <CardTitle className='text-lg'>
                                Generated Images
                            </CardTitle>
                            <CardDescription>
                                Select an image to use as the featured image
                            </CardDescription>
                        </div>
                        <Button
                            variant='outline'
                            size='sm'
                            onClick={fetchImages}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <Loader2 className='h-4 w-4 animate-spin' />
                            ) : (
                                <RefreshCw className='h-4 w-4' />
                            )}
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading && images.length === 0 ? (
                        <div className='flex h-32 items-center justify-center'>
                            <Loader2 className='text-muted-foreground h-6 w-6 animate-spin' />
                        </div>
                    ) : images.length === 0 ? (
                        <div className='flex h-32 items-center justify-center'>
                            <p className='text-muted-foreground text-sm'>
                                No generated images yet. Use the AI Image
                                Generation panel above to create one.
                            </p>
                        </div>
                    ) : (
                        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
                            {images.map((image, index) => {
                                const isCurrentFeatured =
                                    image.url === currentFeaturedImageUrl

                                return (
                                    <div
                                        key={image.id}
                                        className={`group relative overflow-hidden rounded-lg border-2 transition-all ${
                                            isCurrentFeatured
                                                ? 'border-primary ring-primary ring-2 ring-offset-2'
                                                : 'border-border hover:border-primary'
                                        }`}
                                    >
                                        {/* Image - clickable for preview */}
                                        <button
                                            type='button'
                                            className='bg-muted relative aspect-square w-full cursor-pointer overflow-hidden focus:outline-none focus-visible:ring-2'
                                            onClick={() => openPreview(index)}
                                            aria-label='View full size image'
                                        >
                                            <Image
                                                src={image.url}
                                                alt='Generated image'
                                                fill
                                                className='object-cover transition-transform group-hover:scale-105'
                                                sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
                                            />

                                            {/* Expand icon overlay */}
                                            <div className='absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20'>
                                                <Expand className='h-8 w-8 text-white opacity-0 transition-opacity group-hover:opacity-100' />
                                            </div>
                                        </button>

                                        {/* Featured Badge */}
                                        {isCurrentFeatured && (
                                            <div className='absolute top-2 right-2 z-10'>
                                                <Badge className='bg-primary text-primary-foreground'>
                                                    <Check className='mr-1 h-3 w-3' />
                                                    Featured
                                                </Badge>
                                            </div>
                                        )}

                                        {/* Action buttons below image */}
                                        <div className='bg-muted flex items-center justify-between gap-2 p-2'>
                                            <Button
                                                size='sm'
                                                variant={
                                                    isCurrentFeatured
                                                        ? 'secondary'
                                                        : 'default'
                                                }
                                                onClick={() =>
                                                    handleSelectImage(image)
                                                }
                                                disabled={isCurrentFeatured}
                                                className='flex-1'
                                            >
                                                <Check className='mr-1 h-4 w-4' />
                                                {isCurrentFeatured
                                                    ? 'Selected'
                                                    : 'Use This'}
                                            </Button>
                                            <Button
                                                size='sm'
                                                variant='ghost'
                                                onClick={() =>
                                                    handleDeleteImage(image.id)
                                                }
                                                disabled={
                                                    deletingId === image.id
                                                }
                                                className='text-destructive hover:text-destructive hover:bg-destructive/10'
                                            >
                                                {deletingId === image.id ? (
                                                    <Loader2 className='h-4 w-4 animate-spin' />
                                                ) : (
                                                    <Trash2 className='h-4 w-4' />
                                                )}
                                            </Button>
                                        </div>

                                        {/* Prompt text */}
                                        <div className='border-t bg-white p-2'>
                                            <p className='text-muted-foreground line-clamp-2 text-xs'>
                                                {image.prompt}
                                            </p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Fullscreen preview dialog */}
            <ImagePreviewDialog
                images={images}
                initialIndex={previewIndex}
                isOpen={previewOpen}
                onClose={() => setPreviewOpen(false)}
            />
        </>
    )
}
