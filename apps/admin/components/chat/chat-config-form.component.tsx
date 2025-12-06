/**
 * Chat Configuration Form Component
 *
 * Form for editing chat agent configuration including system prompt,
 * model settings, and appearance options.
 *
 * @module components/chat/chat-config-form
 */
'use client'

import { useState, useCallback, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { upload } from '@vercel/blob/client'
import Image from 'next/image'
import { Button } from '@workspace/ui/components/button'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card'
import { Input } from '@workspace/ui/components/input'
import { Label } from '@workspace/ui/components/label'
import { Switch } from '@workspace/ui/components/switch'
import { Textarea } from '@workspace/ui/components/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select'
import { Loader2, Save, RotateCcw, Image as ImageIcon, X } from 'lucide-react'
import { cn } from '@workspace/ui/lib/utils'

import { ImageCropperDialog } from '@/components/shared/image-cropper-dialog.component'
import { AgentAvatarPreview } from '@/components/chat/agent-avatar-preview.component'
import {
    chatConfigSchema,
    type ChatConfigInput,
    CHAT_MODELS,
    BUTTON_POSITIONS,
} from '@workspace/chat/types'
import { DEFAULT_CHAT_CONFIG } from '@workspace/chat/constants'
import { updateChatConfig } from '@/lib/actions/chat.action'

type ChatConfigFormProps = {
    initialData: ChatConfigInput & { id?: string }
}

export function ChatConfigForm({ initialData }: ChatConfigFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [message, setMessage] = useState<{
        type: 'success' | 'error'
        text: string
    } | null>(null)

    // Image cropper state
    const [cropperOpen, setCropperOpen] = useState(false)
    const [selectedImageSrc, setSelectedImageSrc] = useState<string | null>(
        null
    )
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors, isDirty },
    } = useForm<ChatConfigInput>({
        resolver: zodResolver(chatConfigSchema),
        defaultValues: initialData,
    })

    const isEnabled = watch('isEnabled')
    const modelId = watch('modelId')
    const buttonPosition = watch('buttonPosition')
    const agentImageUrl = watch('agentImageUrl')
    const agentName = watch('agentName')

    // Handle file selection - opens cropper
    const handleFileSelect = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0]
            if (file) {
                const objectUrl = URL.createObjectURL(file)
                setSelectedImageSrc(objectUrl)
                setCropperOpen(true)
            }
            // Reset input so same file can be selected again
            e.target.value = ''
        },
        []
    )

    // Handle cropped image - upload to Vercel Blob
    const handleCropComplete = useCallback(
        async (croppedBlob: Blob) => {
            setIsUploadingAvatar(true)

            try {
                // Generate filename
                const timestamp = Date.now()
                const randomStr = Math.random().toString(36).substring(2, 8)
                const pathname = `chat-agent/avatar-${timestamp}-${randomStr}.jpg`

                // Upload to Vercel Blob
                const blob = await upload(pathname, croppedBlob, {
                    access: 'public',
                    handleUploadUrl: '/api/upload',
                })

                // Update form value
                setValue('agentImageUrl', blob.url, { shouldDirty: true })

                // Close cropper and cleanup
                setCropperOpen(false)
                if (selectedImageSrc) {
                    URL.revokeObjectURL(selectedImageSrc)
                    setSelectedImageSrc(null)
                }
            } catch (error) {
                console.error('Failed to upload avatar:', error)
                setMessage({
                    type: 'error',
                    text: 'Failed to upload avatar image',
                })
            } finally {
                setIsUploadingAvatar(false)
            }
        },
        [selectedImageSrc, setValue]
    )

    // Handle avatar removal
    const handleRemoveAvatar = useCallback(async () => {
        if (!agentImageUrl) return

        try {
            // Delete from blob storage
            await fetch('/api/upload', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: agentImageUrl }),
            })
        } catch {
            // Ignore delete errors
        }

        setValue('agentImageUrl', null, { shouldDirty: true })
    }, [agentImageUrl, setValue])

    const onSubmit = async (data: ChatConfigInput) => {
        setIsSubmitting(true)
        setMessage(null)

        try {
            const result = await updateChatConfig(data)

            if (result.success) {
                setMessage({
                    type: 'success',
                    text: 'Configuration saved successfully!',
                })
                reset(data)
            } else {
                setMessage({
                    type: 'error',
                    text: result.error ?? 'Failed to save configuration',
                })
            }
        } catch {
            setMessage({ type: 'error', text: 'An error occurred' })
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleReset = () => {
        reset(DEFAULT_CHAT_CONFIG)
        setMessage(null)
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
            {/* Status Message */}
            {message && (
                <div
                    className={`rounded-lg p-4 text-sm ${
                        message.type === 'success'
                            ? 'bg-green-50 text-green-700'
                            : 'bg-red-50 text-red-700'
                    }`}
                >
                    {message.text}
                </div>
            )}

            {/* General Settings */}
            <Card>
                <CardHeader>
                    <CardTitle>General Settings</CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                    {/* Enable/Disable */}
                    <div className='flex items-center justify-between'>
                        <div>
                            <Label htmlFor='isEnabled'>
                                Enable Chat Widget
                            </Label>
                            <p className='text-muted-foreground text-sm'>
                                Show the chat widget on the website
                            </p>
                        </div>
                        <Switch
                            id='isEnabled'
                            checked={isEnabled}
                            onCheckedChange={(checked) =>
                                setValue('isEnabled', checked, {
                                    shouldDirty: true,
                                })
                            }
                        />
                    </div>

                    {/* Agent Name */}
                    <div className='space-y-2'>
                        <Label htmlFor='agentName'>Agent Name</Label>
                        <Input
                            id='agentName'
                            {...register('agentName')}
                            placeholder='Alluring Assistant'
                        />
                        {errors.agentName && (
                            <p className='text-sm text-red-500'>
                                {errors.agentName.message}
                            </p>
                        )}
                    </div>

                    {/* Welcome Message */}
                    <div className='space-y-2'>
                        <Label htmlFor='welcomeMessage'>Welcome Message</Label>
                        <Textarea
                            id='welcomeMessage'
                            {...register('welcomeMessage')}
                            placeholder='Hello! How can I help you today?'
                            rows={2}
                        />
                        {errors.welcomeMessage && (
                            <p className='text-sm text-red-500'>
                                {errors.welcomeMessage.message}
                            </p>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* AI Configuration */}
            <Card>
                <CardHeader>
                    <CardTitle>AI Configuration</CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                    {/* System Prompt */}
                    <div className='space-y-2'>
                        <Label htmlFor='systemPrompt'>System Prompt</Label>
                        <p className='text-muted-foreground text-xs'>
                            Instructions that define how the AI assistant
                            behaves
                        </p>
                        <Textarea
                            id='systemPrompt'
                            {...register('systemPrompt')}
                            placeholder='You are a helpful assistant...'
                            rows={12}
                            className='font-mono text-sm'
                        />
                        {errors.systemPrompt && (
                            <p className='text-sm text-red-500'>
                                {errors.systemPrompt.message}
                            </p>
                        )}
                    </div>

                    {/* Model Selection */}
                    <div className='grid gap-4 sm:grid-cols-2'>
                        <div className='space-y-2'>
                            <Label>AI Model</Label>
                            <Select
                                value={modelId}
                                onValueChange={(value) =>
                                    setValue(
                                        'modelId',
                                        value as typeof modelId,
                                        { shouldDirty: true }
                                    )
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder='Select model' />
                                </SelectTrigger>
                                <SelectContent>
                                    {CHAT_MODELS.map((model) => (
                                        <SelectItem key={model} value={model}>
                                            {model}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Temperature */}
                        <div className='space-y-2'>
                            <Label htmlFor='temperature'>
                                Temperature ({watch('temperature')?.toFixed(1)})
                            </Label>
                            <Input
                                id='temperature'
                                type='range'
                                min='0'
                                max='2'
                                step='0.1'
                                {...register('temperature', {
                                    valueAsNumber: true,
                                })}
                                className='h-2'
                            />
                            <p className='text-muted-foreground text-xs'>
                                Lower = more focused, Higher = more creative
                            </p>
                        </div>
                    </div>

                    {/* Max Tokens */}
                    <div className='space-y-2'>
                        <Label htmlFor='maxTokens'>Max Response Tokens</Label>
                        <Input
                            id='maxTokens'
                            type='number'
                            min={100}
                            max={4096}
                            {...register('maxTokens', { valueAsNumber: true })}
                        />
                        {errors.maxTokens && (
                            <p className='text-sm text-red-500'>
                                {errors.maxTokens.message}
                            </p>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Appearance */}
            <Card>
                <CardHeader>
                    <CardTitle>Appearance</CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                    {/* Agent Avatar */}
                    <div className='space-y-3'>
                        <div>
                            <Label>Agent Avatar</Label>
                            <p className='text-muted-foreground text-xs'>
                                Upload and crop a custom image for the chat
                                agent. Displayed in the chat header and
                                messages.
                            </p>
                        </div>

                        {/* Hidden file input */}
                        <input
                            ref={fileInputRef}
                            type='file'
                            accept='image/*'
                            onChange={handleFileSelect}
                            className='hidden'
                        />

                        {/* Upload/Preview area */}
                        {agentImageUrl ? (
                            <div className='space-y-3'>
                                {/* Current image with change/remove options */}
                                <div className='relative inline-block'>
                                    <div className='relative h-24 w-24 overflow-hidden rounded-full border-2 border-stone-200'>
                                        <Image
                                            src={agentImageUrl}
                                            alt='Agent avatar'
                                            fill
                                            className='object-cover'
                                        />
                                    </div>
                                    <Button
                                        type='button'
                                        variant='destructive'
                                        size='icon'
                                        className='absolute -top-1 -right-1 h-6 w-6'
                                        onClick={handleRemoveAvatar}
                                    >
                                        <X className='h-3 w-3' />
                                    </Button>
                                </div>
                                <div className='flex gap-2'>
                                    <Button
                                        type='button'
                                        variant='outline'
                                        size='sm'
                                        onClick={() =>
                                            fileInputRef.current?.click()
                                        }
                                    >
                                        Change Image
                                    </Button>
                                </div>

                                {/* Preview section */}
                                <AgentAvatarPreview
                                    imageUrl={agentImageUrl}
                                    agentName={agentName}
                                />
                            </div>
                        ) : (
                            <div
                                role='button'
                                tabIndex={0}
                                onClick={() => fileInputRef.current?.click()}
                                onKeyDown={(e) =>
                                    e.key === 'Enter' &&
                                    fileInputRef.current?.click()
                                }
                                className={cn(
                                    'flex h-32 cursor-pointer flex-col items-center justify-center rounded-lg',
                                    'border-2 border-dashed border-stone-300 bg-stone-50',
                                    'transition-colors hover:border-stone-400 hover:bg-stone-100'
                                )}
                            >
                                <ImageIcon className='mb-2 h-8 w-8 text-stone-400' />
                                <span className='text-sm text-stone-500'>
                                    Click to upload avatar image
                                </span>
                                <span className='text-xs text-stone-400'>
                                    Image will be cropped to a circle
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Image Cropper Dialog */}
                    <ImageCropperDialog
                        open={cropperOpen}
                        onOpenChange={(open) => {
                            setCropperOpen(open)
                            if (!open && selectedImageSrc) {
                                URL.revokeObjectURL(selectedImageSrc)
                                setSelectedImageSrc(null)
                            }
                        }}
                        imageSrc={selectedImageSrc}
                        onCropComplete={handleCropComplete}
                        isProcessing={isUploadingAvatar}
                    />

                    <div className='grid gap-4 sm:grid-cols-2'>
                        {/* Button Position */}
                        <div className='space-y-2'>
                            <Label>Button Position</Label>
                            <Select
                                value={buttonPosition}
                                onValueChange={(value) =>
                                    setValue(
                                        'buttonPosition',
                                        value as typeof buttonPosition,
                                        { shouldDirty: true }
                                    )
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder='Select position' />
                                </SelectTrigger>
                                <SelectContent>
                                    {BUTTON_POSITIONS.map((pos) => (
                                        <SelectItem key={pos} value={pos}>
                                            {pos
                                                .replace('-', ' ')
                                                .replace(/\b\w/g, (l) =>
                                                    l.toUpperCase()
                                                )}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Primary Color */}
                        <div className='space-y-2'>
                            <Label htmlFor='primaryColor'>Primary Color</Label>
                            <div className='flex gap-2'>
                                <Input
                                    id='primaryColor'
                                    type='color'
                                    {...register('primaryColor')}
                                    className='h-10 w-14 cursor-pointer p-1'
                                />
                                <Input
                                    {...register('primaryColor')}
                                    placeholder='#1c1917'
                                    className='flex-1'
                                />
                            </div>
                            {errors.primaryColor && (
                                <p className='text-sm text-red-500'>
                                    {errors.primaryColor.message}
                                </p>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Actions */}
            <div className='flex items-center justify-between'>
                <Button
                    type='button'
                    variant='outline'
                    onClick={handleReset}
                    disabled={isSubmitting}
                >
                    <RotateCcw className='mr-2 h-4 w-4' />
                    Reset to Defaults
                </Button>

                <Button type='submit' disabled={isSubmitting || !isDirty}>
                    {isSubmitting ? (
                        <>
                            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save className='mr-2 h-4 w-4' />
                            Save Changes
                        </>
                    )}
                </Button>
            </div>
        </form>
    )
}
