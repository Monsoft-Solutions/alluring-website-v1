'use client'

import { cn } from '@workspace/ui/lib/utils'
import Placeholder from '@tiptap/extension-placeholder'
import { EditorContent, useEditor, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import {
    Bold,
    Italic,
    Strikethrough,
    Code,
    List,
    ListOrdered,
    Quote,
    Heading1,
    Heading2,
    Heading3,
    Undo,
    Redo,
    Link as LinkIcon,
    ImageIcon,
    Minus,
} from 'lucide-react'

import { Button } from '@workspace/ui/components/button'
import { Separator } from '@workspace/ui/components/separator'

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
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3],
                },
            }),
            Placeholder.configure({
                placeholder,
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-blue-600 underline cursor-pointer',
                },
            }),
            Image.configure({
                HTMLAttributes: {
                    class: 'rounded-lg max-w-full',
                },
            }),
        ],
        content,
        immediatelyRender: false,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML())
        },
        editorProps: {
            attributes: {
                class: 'prose prose-stone max-w-none min-h-[400px] focus:outline-none p-4',
            },
        },
    })

    if (!editor) {
        return (
            <div className='flex h-[500px] items-center justify-center rounded-lg border'>
                <p className='text-muted-foreground'>Loading editor...</p>
            </div>
        )
    }

    return (
        <div className='rounded-lg border'>
            <EditorToolbar editor={editor} />
            <EditorContent editor={editor} />
        </div>
    )
}

function EditorToolbar({ editor }: { editor: Editor }) {
    const addLink = () => {
        const url = window.prompt('Enter URL:')
        if (url) {
            editor.chain().focus().setLink({ href: url }).run()
        }
    }

    const addImage = () => {
        const url = window.prompt('Enter image URL:')
        if (url) {
            editor.chain().focus().setImage({ src: url }).run()
        }
    }

    return (
        <div className='flex flex-wrap items-center gap-1 border-b bg-stone-50 p-2'>
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleBold().run()}
                isActive={editor.isActive('bold')}
                title='Bold'
            >
                <Bold className='h-4 w-4' />
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleItalic().run()}
                isActive={editor.isActive('italic')}
                title='Italic'
            >
                <Italic className='h-4 w-4' />
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleStrike().run()}
                isActive={editor.isActive('strike')}
                title='Strikethrough'
            >
                <Strikethrough className='h-4 w-4' />
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleCode().run()}
                isActive={editor.isActive('code')}
                title='Inline Code'
            >
                <Code className='h-4 w-4' />
            </ToolbarButton>

            <Separator orientation='vertical' className='mx-1 h-6' />

            <ToolbarButton
                onClick={() =>
                    editor.chain().focus().toggleHeading({ level: 1 }).run()
                }
                isActive={editor.isActive('heading', { level: 1 })}
                title='Heading 1'
            >
                <Heading1 className='h-4 w-4' />
            </ToolbarButton>
            <ToolbarButton
                onClick={() =>
                    editor.chain().focus().toggleHeading({ level: 2 }).run()
                }
                isActive={editor.isActive('heading', { level: 2 })}
                title='Heading 2'
            >
                <Heading2 className='h-4 w-4' />
            </ToolbarButton>
            <ToolbarButton
                onClick={() =>
                    editor.chain().focus().toggleHeading({ level: 3 }).run()
                }
                isActive={editor.isActive('heading', { level: 3 })}
                title='Heading 3'
            >
                <Heading3 className='h-4 w-4' />
            </ToolbarButton>

            <Separator orientation='vertical' className='mx-1 h-6' />

            <ToolbarButton
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                isActive={editor.isActive('bulletList')}
                title='Bullet List'
            >
                <List className='h-4 w-4' />
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                isActive={editor.isActive('orderedList')}
                title='Numbered List'
            >
                <ListOrdered className='h-4 w-4' />
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                isActive={editor.isActive('blockquote')}
                title='Quote'
            >
                <Quote className='h-4 w-4' />
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.chain().focus().setHorizontalRule().run()}
                title='Horizontal Rule'
            >
                <Minus className='h-4 w-4' />
            </ToolbarButton>

            <Separator orientation='vertical' className='mx-1 h-6' />

            <ToolbarButton
                onClick={addLink}
                isActive={editor.isActive('link')}
                title='Add Link'
            >
                <LinkIcon className='h-4 w-4' />
            </ToolbarButton>
            <ToolbarButton onClick={addImage} title='Add Image'>
                <ImageIcon className='h-4 w-4' />
            </ToolbarButton>

            <Separator orientation='vertical' className='mx-1 h-6' />

            <ToolbarButton
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().undo()}
                title='Undo'
            >
                <Undo className='h-4 w-4' />
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().redo()}
                title='Redo'
            >
                <Redo className='h-4 w-4' />
            </ToolbarButton>
        </div>
    )
}

type ToolbarButtonProps = {
    onClick: () => void
    isActive?: boolean
    disabled?: boolean
    title: string
    children: React.ReactNode
}

function ToolbarButton({
    onClick,
    isActive,
    disabled,
    title,
    children,
}: ToolbarButtonProps) {
    return (
        <Button
            variant='ghost'
            size='sm'
            onClick={onClick}
            disabled={disabled}
            title={title}
            className={cn(
                'h-8 w-8 p-0',
                isActive && 'bg-stone-200 text-stone-900'
            )}
        >
            {children}
        </Button>
    )
}
