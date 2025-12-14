'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Upload, Loader2, X } from 'lucide-react'
import Image from 'next/image'

import { Button } from '@workspace/ui/components/button'

import {
    bulkUploadAndAssignToGroup,
    bulkUploadMedia,
} from '@/lib/actions/gallery-bulk.action'

type BulkUploadSectionProps = {
    groupId?: string
}

type FileWithPreview = {
    file: File
    preview: string
}

export function BulkUploadSection({ groupId }: BulkUploadSectionProps) {
    const router = useRouter()
    const [selectedFiles, setSelectedFiles] = useState<FileWithPreview[]>([])
    const [isUploading, setIsUploading] = useState(false)

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || [])
        handleFiles(files)
    }

    const handleFiles = (files: File[]) => {
        const imageFiles = files.filter((file) =>
            file.type.startsWith('image/')
        )

        if (imageFiles.length === 0) {
            toast.error('Please select image files only')
            return
        }

        if (selectedFiles.length + imageFiles.length > 20) {
            toast.error('Maximum 20 files allowed per upload')
            return
        }

        const newFiles = imageFiles.map((file) => ({
            file,
            preview: URL.createObjectURL(file),
        }))

        setSelectedFiles((prev) => [...prev, ...newFiles])
    }

    const removeFile = (preview: string) => {
        setSelectedFiles((prev) => prev.filter((f) => f.preview !== preview))
        URL.revokeObjectURL(preview)
    }

    const handleBulkUpload = async () => {
        if (selectedFiles.length === 0) {
            toast.error('Please select files to upload')
            return
        }

        setIsUploading(true)

        try {
            const formData = new FormData()
            selectedFiles.forEach((f, index) => {
                formData.append(`file-${index}`, f.file)
            })

            // Use appropriate upload function based on whether groupId is provided
            const result = groupId
                ? await bulkUploadAndAssignToGroup(groupId, formData)
                : await bulkUploadMedia(formData)

            if (result.success && result.results) {
                const successCount = result.results.filter(
                    (r) => !r.error
                ).length
                const errorCount = result.results.filter((r) => r.error).length

                if (errorCount > 0) {
                    toast.error(`${errorCount} file(s) failed to upload`)
                } else {
                    toast.success(
                        `${successCount} file(s) uploaded successfully`
                    )
                }

                // Clear selected files
                selectedFiles.forEach((f) => URL.revokeObjectURL(f.preview))
                setSelectedFiles([])

                // Refresh page to show new media
                router.refresh()
            } else {
                toast.error(result.error || 'Upload failed')
            }
        } catch (error) {
            console.error('Upload error:', error)
            toast.error('An unexpected error occurred')
        } finally {
            setIsUploading(false)
        }
    }

    return (
        <div className='space-y-4'>
            <div className='rounded-lg border-2 border-dashed border-stone-300 p-8 text-center'>
                <input
                    type='file'
                    id='file-upload'
                    className='hidden'
                    multiple
                    accept='image/*'
                    onChange={handleFileSelect}
                    disabled={isUploading}
                />
                <label
                    htmlFor='file-upload'
                    className='flex cursor-pointer flex-col items-center gap-2'
                >
                    <Upload className='text-muted-foreground h-12 w-12' />
                    <div>
                        <p className='font-medium'>Click to select images</p>
                        <p className='text-muted-foreground text-sm'>
                            or drag and drop (max 20 files)
                        </p>
                    </div>
                </label>
            </div>

            {selectedFiles.length > 0 && (
                <>
                    <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
                        {selectedFiles.map((fileWithPreview) => (
                            <div
                                key={fileWithPreview.preview}
                                className='relative overflow-hidden rounded-lg border'
                            >
                                <div className='relative aspect-square'>
                                    <Image
                                        src={fileWithPreview.preview}
                                        alt={fileWithPreview.file.name}
                                        fill
                                        className='object-cover'
                                        sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw'
                                    />
                                    <button
                                        onClick={() =>
                                            removeFile(fileWithPreview.preview)
                                        }
                                        className='absolute top-2 right-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600'
                                        disabled={isUploading}
                                    >
                                        <X className='h-4 w-4' />
                                    </button>
                                </div>
                                <div className='p-2'>
                                    <p className='truncate text-xs'>
                                        {fileWithPreview.file.name}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className='flex justify-end gap-2'>
                        <Button
                            variant='outline'
                            onClick={() => {
                                selectedFiles.forEach((f) =>
                                    URL.revokeObjectURL(f.preview)
                                )
                                setSelectedFiles([])
                            }}
                            disabled={isUploading}
                        >
                            Clear All
                        </Button>
                        <Button
                            onClick={handleBulkUpload}
                            disabled={isUploading}
                        >
                            {isUploading && (
                                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                            )}
                            Upload {selectedFiles.length} File(s)
                        </Button>
                    </div>
                </>
            )}
        </div>
    )
}
