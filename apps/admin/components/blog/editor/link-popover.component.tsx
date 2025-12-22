'use client'

import type { Editor } from '@tiptap/react'
import { ExternalLink, Link, Trash2, X } from 'lucide-react'
import { useCallback, useState } from 'react'

import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { Label } from '@workspace/ui/components/label'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@workspace/ui/components/popover'

type LinkPopoverProps = {
    editor: Editor
    open: boolean
    onOpenChange: (open: boolean) => void
    children: React.ReactNode
}

export function LinkPopover({
    editor,
    open,
    onOpenChange,
    children,
}: LinkPopoverProps) {
    const previousUrl = editor.getAttributes('link').href as string | undefined

    return (
        <Popover open={open} onOpenChange={onOpenChange}>
            <PopoverTrigger asChild>{children}</PopoverTrigger>
            <PopoverContent className='w-80' align='start' sideOffset={8}>
                {open && (
                    <LinkPopoverContent
                        editor={editor}
                        previousUrl={previousUrl}
                        onClose={() => onOpenChange(false)}
                    />
                )}
            </PopoverContent>
        </Popover>
    )
}

type LinkPopoverContentProps = {
    editor: Editor
    previousUrl: string | undefined
    onClose: () => void
}

function LinkPopoverContent({
    editor,
    previousUrl,
    onClose,
}: LinkPopoverContentProps) {
    const [url, setUrl] = useState(previousUrl ?? '')

    const handleSetLink = useCallback(() => {
        if (!url) {
            // Remove link if URL is empty
            editor.chain().focus().extendMarkRange('link').unsetLink().run()
        } else {
            // Set or update link
            const normalizedUrl = url.startsWith('http')
                ? url
                : `https://${url}`
            editor
                .chain()
                .focus()
                .extendMarkRange('link')
                .setLink({ href: normalizedUrl })
                .run()
        }
        onClose()
    }, [editor, url, onClose])

    const handleRemoveLink = useCallback(() => {
        editor.chain().focus().extendMarkRange('link').unsetLink().run()
        onClose()
    }, [editor, onClose])

    const handleOpenInNewTab = useCallback(() => {
        if (previousUrl) {
            window.open(previousUrl, '_blank', 'noopener,noreferrer')
        }
    }, [previousUrl])

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            handleSetLink()
        }
        if (e.key === 'Escape') {
            e.preventDefault()
            onClose()
        }
    }

    return (
        <div className='space-y-4'>
            <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                    <Link className='h-4 w-4 text-stone-500' />
                    <h4 className='text-sm font-medium'>
                        {previousUrl ? 'Edit Link' : 'Add Link'}
                    </h4>
                </div>
                <Button
                    variant='ghost'
                    size='sm'
                    className='h-6 w-6 p-0'
                    onClick={onClose}
                >
                    <X className='h-4 w-4' />
                </Button>
            </div>

            <div className='space-y-2'>
                <Label htmlFor='link-url' className='text-xs'>
                    URL
                </Label>
                <Input
                    id='link-url'
                    placeholder='https://example.com'
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyDown={handleKeyDown}
                    autoFocus
                    className='h-9'
                />
            </div>

            <div className='flex items-center justify-between'>
                <div className='flex items-center gap-1'>
                    {previousUrl && (
                        <>
                            <Button
                                variant='ghost'
                                size='sm'
                                onClick={handleRemoveLink}
                                className='h-8 gap-1.5 text-red-600 hover:bg-red-50 hover:text-red-700'
                            >
                                <Trash2 className='h-3.5 w-3.5' />
                                Remove
                            </Button>
                            <Button
                                variant='ghost'
                                size='sm'
                                onClick={handleOpenInNewTab}
                                className='h-8 gap-1.5'
                            >
                                <ExternalLink className='h-3.5 w-3.5' />
                                Open
                            </Button>
                        </>
                    )}
                </div>
                <Button size='sm' onClick={handleSetLink} className='h-8'>
                    {previousUrl ? 'Update' : 'Add Link'}
                </Button>
            </div>
        </div>
    )
}

type ImagePopoverProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    onAddImage: (url: string) => void
    children: React.ReactNode
}

export function ImagePopover({
    open,
    onOpenChange,
    onAddImage,
    children,
}: ImagePopoverProps) {
    return (
        <Popover open={open} onOpenChange={onOpenChange}>
            <PopoverTrigger asChild>{children}</PopoverTrigger>
            <PopoverContent className='w-80' align='start' sideOffset={8}>
                {open && (
                    <ImagePopoverContent
                        onAddImage={onAddImage}
                        onClose={() => onOpenChange(false)}
                    />
                )}
            </PopoverContent>
        </Popover>
    )
}

type ImagePopoverContentProps = {
    onAddImage: (url: string) => void
    onClose: () => void
}

function ImagePopoverContent({
    onAddImage,
    onClose,
}: ImagePopoverContentProps) {
    const [url, setUrl] = useState('')

    const handleAddImage = useCallback(() => {
        if (url) {
            onAddImage(url)
            onClose()
        }
    }, [url, onAddImage, onClose])

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            handleAddImage()
        }
        if (e.key === 'Escape') {
            e.preventDefault()
            onClose()
        }
    }

    return (
        <div className='space-y-4'>
            <div className='flex items-center justify-between'>
                <h4 className='text-sm font-medium'>Add Image</h4>
                <Button
                    variant='ghost'
                    size='sm'
                    className='h-6 w-6 p-0'
                    onClick={onClose}
                >
                    <X className='h-4 w-4' />
                </Button>
            </div>

            <div className='space-y-2'>
                <Label htmlFor='image-url' className='text-xs'>
                    Image URL
                </Label>
                <Input
                    id='image-url'
                    placeholder='https://example.com/image.jpg'
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyDown={handleKeyDown}
                    autoFocus
                    className='h-9'
                />
                <p className='text-xs text-stone-500'>
                    Enter a direct link to an image file
                </p>
            </div>

            <div className='flex justify-end'>
                <Button
                    size='sm'
                    onClick={handleAddImage}
                    disabled={!url}
                    className='h-8'
                >
                    Add Image
                </Button>
            </div>
        </div>
    )
}
