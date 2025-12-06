'use client'

import { useState, useCallback } from 'react'
import Cropper, { type Area, type Point } from 'react-easy-crop'
import { Loader2, ZoomIn, ZoomOut, RotateCw } from 'lucide-react'

import { Button } from '@workspace/ui/components/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@workspace/ui/components/dialog'
import { cn } from '@workspace/ui/lib/utils'

type ImageCropperDialogProps = {
    /** Whether the dialog is open */
    open: boolean
    /** Callback when dialog closes */
    onOpenChange: (open: boolean) => void
    /** Image source URL (object URL from file selection) */
    imageSrc: string | null
    /** Callback with cropped image blob */
    onCropComplete: (croppedImageBlob: Blob) => void
    /** Whether currently processing */
    isProcessing?: boolean
    /** Aspect ratio (default 1 for square/circular) */
    aspectRatio?: number
    /** Crop shape */
    cropShape?: 'round' | 'rect'
}

/**
 * Creates a cropped image from the source and crop area
 */
async function getCroppedImage(
    imageSrc: string,
    pixelCrop: Area,
    rotation: number = 0
): Promise<Blob> {
    const image = await createImage(imageSrc)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
        throw new Error('No 2d context')
    }

    const rotRad = getRadianAngle(rotation)

    // Calculate bounding box of the rotated image
    const { width: bBoxWidth, height: bBoxHeight } = rotateSize(
        image.width,
        image.height,
        rotation
    )

    // Set canvas size to match the bounding box
    canvas.width = bBoxWidth
    canvas.height = bBoxHeight

    // Translate canvas context to center before rotating
    ctx.translate(bBoxWidth / 2, bBoxHeight / 2)
    ctx.rotate(rotRad)
    ctx.translate(-image.width / 2, -image.height / 2)

    // Draw rotated image
    ctx.drawImage(image, 0, 0)

    // Extract the cropped area
    const croppedCanvas = document.createElement('canvas')
    const croppedCtx = croppedCanvas.getContext('2d')

    if (!croppedCtx) {
        throw new Error('No 2d context')
    }

    // Set output size (we'll use 256x256 for avatars - good quality for all sizes)
    const outputSize = 256
    croppedCanvas.width = outputSize
    croppedCanvas.height = outputSize

    // Draw the cropped area scaled to output size
    croppedCtx.drawImage(
        canvas,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        outputSize,
        outputSize
    )

    // Convert to blob
    return new Promise((resolve, reject) => {
        croppedCanvas.toBlob(
            (blob) => {
                if (blob) {
                    resolve(blob)
                } else {
                    reject(new Error('Canvas is empty'))
                }
            },
            'image/jpeg',
            0.9
        )
    })
}

function createImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const image = new Image()
        image.addEventListener('load', () => resolve(image))
        image.addEventListener('error', (error) => reject(error))
        image.crossOrigin = 'anonymous'
        image.src = url
    })
}

function getRadianAngle(degreeValue: number): number {
    return (degreeValue * Math.PI) / 180
}

function rotateSize(
    width: number,
    height: number,
    rotation: number
): { width: number; height: number } {
    const rotRad = getRadianAngle(rotation)
    return {
        width:
            Math.abs(Math.cos(rotRad) * width) +
            Math.abs(Math.sin(rotRad) * height),
        height:
            Math.abs(Math.sin(rotRad) * width) +
            Math.abs(Math.cos(rotRad) * height),
    }
}

/**
 * Image Cropper Dialog Component
 *
 * Provides a modal interface for cropping images with zoom and rotation controls.
 * Optimized for circular avatar cropping.
 */
export function ImageCropperDialog({
    open,
    onOpenChange,
    imageSrc,
    onCropComplete,
    isProcessing = false,
    aspectRatio = 1,
    cropShape = 'round',
}: ImageCropperDialogProps) {
    const [crop, setCrop] = useState<Point>({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(1)
    const [rotation, setRotation] = useState(0)
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(
        null
    )

    const onCropAreaChange = useCallback(
        (_croppedArea: Area, croppedAreaPixels: Area) => {
            setCroppedAreaPixels(croppedAreaPixels)
        },
        []
    )

    const handleApply = useCallback(async () => {
        if (!imageSrc || !croppedAreaPixels) return

        try {
            const croppedBlob = await getCroppedImage(
                imageSrc,
                croppedAreaPixels,
                rotation
            )
            onCropComplete(croppedBlob)
        } catch (error) {
            console.error('Error cropping image:', error)
        }
    }, [imageSrc, croppedAreaPixels, rotation, onCropComplete])

    const handleCancel = useCallback(() => {
        // Reset state
        setCrop({ x: 0, y: 0 })
        setZoom(1)
        setRotation(0)
        setCroppedAreaPixels(null)
        onOpenChange(false)
    }, [onOpenChange])

    const handleZoomIn = () => setZoom((z) => Math.min(z + 0.1, 3))
    const handleZoomOut = () => setZoom((z) => Math.max(z - 0.1, 1))
    const handleRotate = () => setRotation((r) => (r + 90) % 360)

    if (!imageSrc) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='sm:max-w-lg'>
                <DialogHeader>
                    <DialogTitle>Crop Avatar Image</DialogTitle>
                    <DialogDescription>
                        Adjust the crop area to select the portion of the image
                        you want to use as the agent avatar.
                    </DialogDescription>
                </DialogHeader>

                {/* Cropper Area */}
                <div className='relative h-64 w-full overflow-hidden rounded-lg bg-stone-900'>
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        rotation={rotation}
                        aspect={aspectRatio}
                        cropShape={cropShape}
                        showGrid={false}
                        onCropChange={setCrop}
                        onZoomChange={setZoom}
                        onCropComplete={onCropAreaChange}
                        classes={{
                            containerClassName: 'rounded-lg',
                            cropAreaClassName: cn(
                                cropShape === 'round' && 'rounded-full'
                            ),
                        }}
                    />
                </div>

                {/* Controls */}
                <div className='flex items-center justify-center gap-2'>
                    <Button
                        type='button'
                        variant='outline'
                        size='icon'
                        onClick={handleZoomOut}
                        disabled={zoom <= 1}
                        title='Zoom out'
                    >
                        <ZoomOut className='h-4 w-4' />
                    </Button>

                    <div className='flex h-9 w-32 items-center rounded-md border bg-stone-50 px-3'>
                        <input
                            type='range'
                            min={1}
                            max={3}
                            step={0.1}
                            value={zoom}
                            onChange={(e) =>
                                setZoom(parseFloat(e.target.value))
                            }
                            className='w-full accent-stone-900'
                        />
                    </div>

                    <Button
                        type='button'
                        variant='outline'
                        size='icon'
                        onClick={handleZoomIn}
                        disabled={zoom >= 3}
                        title='Zoom in'
                    >
                        <ZoomIn className='h-4 w-4' />
                    </Button>

                    <div className='mx-2 h-6 w-px bg-stone-200' />

                    <Button
                        type='button'
                        variant='outline'
                        size='icon'
                        onClick={handleRotate}
                        title='Rotate 90°'
                    >
                        <RotateCw className='h-4 w-4' />
                    </Button>
                </div>

                <DialogFooter>
                    <Button
                        type='button'
                        variant='outline'
                        onClick={handleCancel}
                        disabled={isProcessing}
                    >
                        Cancel
                    </Button>
                    <Button
                        type='button'
                        onClick={handleApply}
                        disabled={isProcessing || !croppedAreaPixels}
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                Processing...
                            </>
                        ) : (
                            'Apply Crop'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
