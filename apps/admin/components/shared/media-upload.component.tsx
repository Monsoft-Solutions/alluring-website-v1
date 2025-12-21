'use client'

import { useCallback, useRef, useState } from 'react'
import { upload } from '@vercel/blob/client'
import { X, Loader2, Video, Image as ImageIcon } from 'lucide-react'

import { Button } from '@workspace/ui/components/button'
import { cn } from '@workspace/ui/lib/utils'
import Image from 'next/image'

type MediaUploadProps = {
    /** Current URL value */
    value: string | null | undefined
    /** Callback when URL changes */
    onChange: (url: string | null) => void
    /** Accepted file types (e.g., "image/*", "video/*") */
    accept?: string
    /** Maximum file size in bytes */
    maxSize?: number
    /** Folder path in blob storage */
    folder?: string
    /** Placeholder text */
    placeholder?: string
    /** Whether this is for video upload */
    isVideo?: boolean
    /** Additional class name */
    className?: string
}

type UploadState = 'idle' | 'uploading' | 'error'

/**
 * Media upload component with drag-and-drop support
 * Uses Vercel Blob client upload for direct browser-to-storage uploads
 * This approach supports large files without server body size limits
 */
export function MediaUpload({
    value,
    onChange,
    accept = 'image/*',
    maxSize = 5 * 1024 * 1024, // 5MB default
    folder = 'uploads',
    placeholder = 'Drop file here or click to upload',
    isVideo = false,
    className,
}: MediaUploadProps) {
    const [uploadState, setUploadState] = useState<UploadState>('idle')
    const [error, setError] = useState<string | null>(null)
    const [progress, setProgress] = useState(0)
    const [isDragging, setIsDragging] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    const handleUpload = useCallback(
        async (file: File) => {
            // Validate file size
            if (file.size > maxSize) {
                const maxSizeMB = maxSize / (1024 * 1024)
                setError(`File too large. Maximum size is ${maxSizeMB}MB`)
                setUploadState('error')
                return
            }

            setUploadState('uploading')
            setError(null)
            setProgress(0)

            try {
                // Generate unique filename with folder structure
                const extension = file.name.split('.').pop() || 'bin'
                const timestamp = Date.now()
                const randomStr = Math.random().toString(36).substring(2, 8)
                const sanitizedName = file.name
                    .replace(/\.[^/.]+$/, '')
                    .replace(/[^a-zA-Z0-9-_]/g, '-')
                    .substring(0, 50)
                const pathname = `${folder}/${sanitizedName}-${timestamp}-${randomStr}.${extension}`

                // Use Vercel Blob client upload - uploads directly from browser
                const blob = await upload(pathname, file, {
                    access: 'public',
                    handleUploadUrl: '/api/upload',
                    onUploadProgress: (progressEvent) => {
                        const percent = Math.round(
                            (progressEvent.loaded / progressEvent.total) * 100
                        )
                        setProgress(percent)
                    },
                })

                onChange(blob.url)
                setUploadState('idle')
            } catch (err) {
                console.error('Upload error:', err)
                setError(
                    err instanceof Error ? err.message : 'Failed to upload file'
                )
                setUploadState('error')
            }
        },
        [folder, maxSize, onChange]
    )

    const handleDelete = useCallback(async () => {
        if (!value) return

        try {
            // Delete from blob storage
            await fetch('/api/upload', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: value }),
            })
        } catch {
            // Ignore delete errors, still clear the value
        }

        onChange(null)
    }, [value, onChange])

    const handleDrop = useCallback(
        (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault()
            setIsDragging(false)

            const file = e.dataTransfer.files[0]
            if (file) {
                void handleUpload(file)
            }
        },
        [handleUpload]
    )

    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        setIsDragging(true)
    }, [])

    const handleDragLeave = useCallback(
        (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault()
            setIsDragging(false)
        },
        []
    )

    const handleFileSelect = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0]
            if (file) {
                void handleUpload(file)
            }
            // Reset input so same file can be selected again
            e.target.value = ''
        },
        [handleUpload]
    )

    const handleClick = useCallback(() => {
        inputRef.current?.click()
    }, [])

    // Show preview if value exists
    if (value) {
        return (
            <div className={cn('relative', className)}>
                <div className='relative overflow-hidden rounded-lg border bg-stone-50'>
                    {isVideo ? (
                        <div className='flex h-32 items-center justify-center bg-stone-100'>
                            <Video className='h-12 w-12 text-stone-400' />
                        </div>
                    ) : (
                        <div className='relative h-32 w-full'>
                            <Image
                                src={value}
                                alt='Uploaded media'
                                fill
                                sizes='(max-width: 768px) 100vw, 400px'
                                className='object-cover'
                            />
                        </div>
                    )}
                    <Button
                        type='button'
                        variant='destructive'
                        size='icon'
                        className='absolute top-2 right-2 h-6 w-6'
                        onClick={handleDelete}
                    >
                        <X className='h-4 w-4' />
                    </Button>
                </div>
                <p className='mt-1 truncate text-xs text-stone-500'>{value}</p>
            </div>
        )
    }

    // Show upload zone
    return (
        <div className={className}>
            <div
                role='button'
                tabIndex={0}
                onClick={handleClick}
                onKeyDown={(e) => e.key === 'Enter' && handleClick()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={cn(
                    'relative flex h-32 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors',
                    isDragging
                        ? 'border-gold-500 bg-gold-50'
                        : 'border-stone-300 bg-stone-50 hover:border-stone-400 hover:bg-stone-100',
                    uploadState === 'error' && 'border-red-300 bg-red-50',
                    uploadState === 'uploading' &&
                        'pointer-events-none border-stone-300'
                )}
            >
                <input
                    ref={inputRef}
                    type='file'
                    accept={accept}
                    onChange={handleFileSelect}
                    className='hidden'
                />

                {uploadState === 'uploading' ? (
                    <div className='flex flex-col items-center gap-2'>
                        <Loader2 className='h-8 w-8 animate-spin text-stone-500' />
                        <div className='w-32'>
                            <div className='h-1 overflow-hidden rounded-full bg-stone-200'>
                                <div
                                    className='bg-gold-500 h-full transition-all duration-300'
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                        <span className='text-xs text-stone-500'>
                            Uploading... {progress}%
                        </span>
                    </div>
                ) : (
                    <div className='flex flex-col items-center gap-2'>
                        {isVideo ? (
                            <Video className='h-8 w-8 text-stone-400' />
                        ) : (
                            <ImageIcon className='h-8 w-8 text-stone-400' />
                        )}
                        <span className='text-sm text-stone-500'>
                            {placeholder}
                        </span>
                        <span className='text-xs text-stone-400'>
                            Max {(maxSize / (1024 * 1024)).toFixed(0)}MB
                        </span>
                    </div>
                )}
            </div>

            {error && (
                <p className='mt-1 text-xs text-red-600'>
                    {error}
                    <button
                        type='button'
                        onClick={() => {
                            setError(null)
                            setUploadState('idle')
                        }}
                        className='ml-2 underline'
                    >
                        Dismiss
                    </button>
                </p>
            )}
        </div>
    )
}
