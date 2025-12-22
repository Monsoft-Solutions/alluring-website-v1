'use client'

import { EditorContent, useEditor } from '@tiptap/react'
import { useCallback, useState } from 'react'

import { cn } from '@workspace/ui/lib/utils'

import { EditorBubbleMenu } from './editor/bubble-menu.component'
import { createEditorExtensions } from './editor/editor-extensions'
import { ImagePopover, LinkPopover } from './editor/link-popover.component'
import { EditorToolbar } from './editor/toolbar.component'

type PostEditorProps = {
    content: string
    onChange: (content: string) => void
    placeholder?: string
}

export function PostEditor({
    content,
    onChange,
    placeholder = 'Start writing your post...',
}: PostEditorProps) {
    const [linkPopoverOpen, setLinkPopoverOpen] = useState(false)
    const [imagePopoverOpen, setImagePopoverOpen] = useState(false)

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
            <EditorBubbleMenu editor={editor} onAddLink={handleAddLink} />

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
