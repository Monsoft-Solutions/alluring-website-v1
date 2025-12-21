'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

import { Button } from '@workspace/ui/components/button'
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from '@workspace/ui/components/dialog'

type ImageData = {
    id: string
    url: string
    prompt?: string
}

type ImagePreviewDialogProps = {
    images: ImageData[]
    initialIndex?: number
    isOpen: boolean
    onClose: () => void
}

export function ImagePreviewDialog({
    images,
    initialIndex = 0,
    isOpen,
    onClose,
}: ImagePreviewDialogProps) {
    const [currentIndex, setCurrentIndex] = useState(initialIndex)

    // Reset to initial index when dialog opens
    useEffect(() => {
        if (isOpen) {
            // Use requestAnimationFrame to avoid cascading render lint error
            // while still ensuring the state is updated when the dialog opens
            const handle = requestAnimationFrame(() => {
                setCurrentIndex(initialIndex)
            })
            return () => cancelAnimationFrame(handle)
        }
    }, [isOpen, initialIndex])

    const currentImage = images[currentIndex]
    const hasMultiple = images.length > 1

    const goToPrevious = useCallback(() => {
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))
    }, [images.length])

    const goToNext = useCallback(() => {
        setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))
    }, [images.length])

    // Keyboard navigation
    useEffect(() => {
        if (!isOpen) return

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') {
                goToPrevious()
            } else if (e.key === 'ArrowRight') {
                goToNext()
            } else if (e.key === 'Escape') {
                onClose()
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, goToPrevious, goToNext, onClose])

    if (!currentImage) return null

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className='flex h-[90vh] max-w-[95vw] flex-col gap-0 overflow-hidden p-0'>
                <DialogTitle className='sr-only'>Image Preview</DialogTitle>

                {/* Close button */}
                <Button
                    variant='ghost'
                    size='icon'
                    className='absolute top-2 right-2 z-50 h-10 w-10 rounded-full bg-black/50 text-white hover:bg-black/70'
                    onClick={onClose}
                >
                    <X className='h-5 w-5' />
                </Button>

                {/* Image container */}
                <div className='relative flex flex-1 items-center justify-center bg-black'>
                    {/* Navigation arrows */}
                    {hasMultiple && (
                        <>
                            <Button
                                variant='ghost'
                                size='icon'
                                className='absolute left-4 z-50 h-12 w-12 rounded-full bg-black/50 text-white hover:bg-black/70'
                                onClick={goToPrevious}
                            >
                                <ChevronLeft className='h-8 w-8' />
                            </Button>
                            <Button
                                variant='ghost'
                                size='icon'
                                className='absolute right-4 z-50 h-12 w-12 rounded-full bg-black/50 text-white hover:bg-black/70'
                                onClick={goToNext}
                            >
                                <ChevronRight className='h-8 w-8' />
                            </Button>
                        </>
                    )}

                    {/* Main image */}
                    <div className='relative h-full w-full'>
                        <Image
                            src={currentImage.url}
                            alt='Generated image preview'
                            fill
                            className='object-contain'
                            sizes='95vw'
                            priority
                        />
                    </div>
                </div>

                {/* Footer with prompt and pagination */}
                <div className='bg-background border-t p-4'>
                    <div className='flex flex-col gap-2'>
                        {/* Pagination indicator */}
                        {hasMultiple && (
                            <div className='flex items-center justify-center gap-2'>
                                {images.map((_, index) => (
                                    <button
                                        key={index}
                                        className={`h-2 w-2 rounded-full transition-colors ${
                                            index === currentIndex
                                                ? 'bg-primary'
                                                : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                                        }`}
                                        onClick={() => setCurrentIndex(index)}
                                        aria-label={`Go to image ${index + 1}`}
                                    />
                                ))}
                                <span className='text-muted-foreground ml-2 text-sm'>
                                    {currentIndex + 1} / {images.length}
                                </span>
                            </div>
                        )}

                        {/* Prompt */}
                        {currentImage.prompt && (
                            <div className='text-muted-foreground max-h-20 overflow-y-auto text-center text-sm'>
                                <span className='font-medium'>Prompt: </span>
                                {currentImage.prompt}
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
