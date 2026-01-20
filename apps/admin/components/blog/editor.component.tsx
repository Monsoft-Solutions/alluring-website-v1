'use client'

import { EditorContent, useEditor } from '@tiptap/react'
import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import type { GeneratedInlineImage } from '@workspace/ai'

import { cn } from '@workspace/ui/lib/utils'

import { trackInlineImages } from '@/lib/actions/blog.action'

import { AutoInlineImagesDialog } from './editor/auto-inline-images-dialog.component'
import { EditorBubbleMenu } from './editor/bubble-menu.component'
import { createEditorExtensions } from './editor/editor-extensions'
import { InlineImageDialog } from './editor/inline-image-dialog.component'
import { ImagePopover, LinkPopover } from './editor/link-popover.component'
import { EditorToolbar } from './editor/toolbar.component'
import { insertGeneratedInlineImages } from './editor/insert-generated-inline-images.util'

type PostEditorProps = {
    content: string
    onChange: (content: string) => void
    placeholder?: string
    blogPostId?: string
    /** Blog post title for AI context in auto inline images */
    blogPostTitle?: string
    /** Callback when images are generated (to refresh gallery) */
    onImagesGenerated?: () => void
}

export function PostEditor({
    content,
    onChange,
    placeholder = 'Start writing your post...',
    blogPostId,
    blogPostTitle = 'Blog Post',
    onImagesGenerated,
}: PostEditorProps) {
    const [linkPopoverOpen, setLinkPopoverOpen] = useState(false)
    const [imagePopoverOpen, setImagePopoverOpen] = useState(false)
    const [inlineImageDialogOpen, setInlineImageDialogOpen] = useState(false)
    const [autoInlineImagesDialogOpen, setAutoInlineImagesDialogOpen] =
        useState(false)
    const [selectedText, setSelectedText] = useState('')
    const [selectionPosition, setSelectionPosition] = useState<number | null>(
        null
    )

    const editor = useEditor({
        extensions: createEditorExtensions({ placeholder }),
        content,
        contentType: 'markdown', // Parse content as Markdown
        immediatelyRender: false, // Required for SSR compatibility
        onUpdate: ({ editor }) => {
            // Use the correct Markdown API
            const markdown = editor.getMarkdown()
            onChange(markdown)
        },
        editorProps: {
            attributes: {
                class: cn(
                    // Typography
                    'prose prose-stone prose-sm sm:prose-base max-w-none',
                    // Sizing and spacing
                    'min-h-[400px] p-4',
                    // Focus states
                    'focus:outline-none',
                    // Custom prose overrides for better editing
                    'prose-headings:font-semibold',
                    'prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg',
                    'prose-p:my-2 prose-p:leading-relaxed',
                    'prose-blockquote:border-l-4 prose-blockquote:border-stone-300 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-stone-600',
                    'prose-code:rounded prose-code:bg-stone-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:font-mono prose-code:text-sm prose-code:before:content-none prose-code:after:content-none',
                    'prose-pre:bg-stone-900 prose-pre:text-stone-100',
                    'prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline',
                    'prose-img:rounded-lg prose-img:mx-auto',
                    'prose-ul:my-2 prose-ol:my-2',
                    'prose-li:my-0.5'
                ),
            },
        },
    })

    const handleAddLink = useCallback(() => {
        setLinkPopoverOpen(true)
    }, [])

    const handleAddImage = useCallback(
        (url: string) => {
            if (editor && url) {
                editor.chain().focus().setImage({ src: url }).run()
            }
        },
        [editor]
    )

    const handleOpenImagePopover = useCallback(() => {
        setImagePopoverOpen(true)
    }, [])

    const handleGenerateImage = useCallback(() => {
        if (editor) {
            const { from, to } = editor.state.selection
            const text = editor.state.doc.textBetween(from, to, ' ')

            if (!text || text.trim().length < 10) {
                toast.error(
                    'Please select at least 10 characters to generate an image'
                )
                return
            }

            setSelectedText(text)
            setSelectionPosition(to) // Store the end position
            setInlineImageDialogOpen(true)
        }
    }, [editor])

    const handleImageGenerated = useCallback(
        (imageUrl: string, altText: string) => {
            if (editor && selectionPosition !== null) {
                editor
                    .chain()
                    .focus()
                    .insertContentAt(selectionPosition, {
                        type: 'image',
                        attrs: { src: imageUrl, alt: altText },
                    })
                    .run()

                setSelectionPosition(null) // Reset after use

                // Notify parent to refresh the gallery
                // Note: trackInlineImages is NOT called here because the
                // /api/blog/generate-image endpoint already creates the
                // blogPostImages record. Calling it here would create duplicates.
                onImagesGenerated?.()
            }
        },
        [editor, selectionPosition, onImagesGenerated]
    )

    const handleAutoInlineImages = useCallback(() => {
        if (!blogPostId) {
            toast.error('Please save the post first before generating images')
            return
        }
        setAutoInlineImagesDialogOpen(true)
    }, [blogPostId])

    const handleAutoImagesGenerated = useCallback(
        (images: GeneratedInlineImage[]) => {
            if (!editor) return

            // Insert images into the editor
            const insertedCount = insertGeneratedInlineImages(editor, images)

            // Track successfully inserted images in the database (non-blocking)
            // Failure to track should not affect the image insertion
            if (blogPostId && insertedCount > 0) {
                const successfulImages = images
                    .filter((img) => img.status === 'success' && img.imageUrl)
                    .map((img) => ({
                        imageUrl: img.imageUrl!,
                        altText: img.altText || 'Generated inline image',
                        prompt: img.prompt,
                    }))

                if (successfulImages.length > 0) {
                    void trackInlineImages(blogPostId, successfulImages).catch(
                        (error) => {
                            console.error(
                                'Failed to track inline images:',
                                error
                            )
                        }
                    )

                    // Notify parent to refresh the gallery
                    onImagesGenerated?.()
                }
            }
        },
        [editor, blogPostId, onImagesGenerated]
    )

    if (!editor) {
        return (
            <div className='flex h-[500px] items-center justify-center rounded-lg border bg-stone-50'>
                <div className='flex flex-col items-center gap-2'>
                    <div className='h-5 w-5 animate-spin rounded-full border-2 border-stone-300 border-t-stone-600' />
                    <p className='text-muted-foreground text-sm'>
                        Loading editor...
                    </p>
                </div>
            </div>
        )
    }

    const characterCount = editor.storage.characterCount?.characters?.() ?? 0
    const wordCount = editor.storage.characterCount?.words?.() ?? 0

    return (
        <div className='overflow-hidden rounded-lg border bg-white shadow-sm'>
            {/* Toolbar */}
            <EditorToolbar
                editor={editor}
                onAddLink={handleAddLink}
                onAddImage={handleOpenImagePopover}
                onAutoInlineImages={handleAutoInlineImages}
                autoInlineImagesDisabled={!blogPostId}
            />

            {/* Link Popover - attached to a hidden trigger */}
            <LinkPopover
                editor={editor}
                open={linkPopoverOpen}
                onOpenChange={setLinkPopoverOpen}
            >
                <span />
            </LinkPopover>

            {/* Image Popover - attached to a hidden trigger */}
            <ImagePopover
                open={imagePopoverOpen}
                onOpenChange={setImagePopoverOpen}
                onAddImage={handleAddImage}
            >
                <span />
            </ImagePopover>

            {/* Bubble Menu for inline formatting */}
            <EditorBubbleMenu
                editor={editor}
                onAddLink={handleAddLink}
                onGenerateImage={handleGenerateImage}
            />

            {/* Inline Image Generation Dialog */}
            <InlineImageDialog
                open={inlineImageDialogOpen}
                onOpenChange={setInlineImageDialogOpen}
                selectedText={selectedText}
                blogPostId={blogPostId}
                onImageGenerated={handleImageGenerated}
            />

            {/* Auto Inline Images Dialog */}
            <AutoInlineImagesDialog
                open={autoInlineImagesDialogOpen}
                onOpenChange={setAutoInlineImagesDialogOpen}
                content={content}
                title={blogPostTitle}
                blogPostId={blogPostId}
                onImagesGenerated={handleAutoImagesGenerated}
            />

            {/* Editor Content */}
            <EditorContent
                editor={editor}
                className='cursor-text'
                onClick={() => editor.chain().focus().run()}
            />

            {/* Footer with character/word count */}
            <div className='flex items-center justify-between border-t bg-stone-50/80 px-4 py-2'>
                <div className='flex items-center gap-4 text-xs text-stone-500'>
                    <span>
                        {wordCount.toLocaleString()}{' '}
                        {wordCount === 1 ? 'word' : 'words'}
                    </span>
                    <span>
                        {characterCount.toLocaleString()}{' '}
                        {characterCount === 1 ? 'character' : 'characters'}
                    </span>
                </div>
                <div className='text-xs text-stone-400'>Markdown supported</div>
            </div>
        </div>
    )
}
