'use client'

import type { Editor } from '@tiptap/react'
import {
    Bold,
    Code,
    ImageIcon,
    Italic,
    Link as LinkIcon,
    List,
    ListOrdered,
    Minus,
    Quote,
    Redo,
    Strikethrough,
    TerminalSquare,
    Undo,
} from 'lucide-react'

import { Separator } from '@workspace/ui/components/separator'
import { TooltipProvider } from '@workspace/ui/components/tooltip'

import { AutoInlineImagesButton } from './auto-inline-images-button.component'
import { ToolbarButton } from './toolbar-button.component'
import { ToolbarGroup } from './toolbar-group.component'
import { HeadingsDropdown } from './headings-dropdown.component'
import { getShortcutLabel } from './editor-extensions'

type EditorToolbarProps = {
    editor: Editor
    onAddLink: () => void
    onAddImage: () => void
    onAutoInlineImages?: () => void
    autoInlineImagesDisabled?: boolean
}

export function EditorToolbar({
    editor,
    onAddLink,
    onAddImage,
    onAutoInlineImages,
    autoInlineImagesDisabled = false,
}: EditorToolbarProps) {
    return (
        <TooltipProvider delayDuration={300}>
            <div className='flex flex-wrap items-center gap-0.5 border-b bg-stone-50/80 p-1.5'>
                {/* Text Formatting Group */}
                <ToolbarGroup>
                    <ToolbarButton
                        onClick={() =>
                            editor.chain().focus().toggleBold().run()
                        }
                        isActive={editor.isActive('bold')}
                        tooltip={getShortcutLabel('bold')}
                        aria-label='Bold'
                    >
                        <Bold className='h-4 w-4' />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() =>
                            editor.chain().focus().toggleItalic().run()
                        }
                        isActive={editor.isActive('italic')}
                        tooltip={getShortcutLabel('italic')}
                        aria-label='Italic'
                    >
                        <Italic className='h-4 w-4' />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() =>
                            editor.chain().focus().toggleStrike().run()
                        }
                        isActive={editor.isActive('strike')}
                        tooltip={getShortcutLabel('strike')}
                        aria-label='Strikethrough'
                    >
                        <Strikethrough className='h-4 w-4' />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() =>
                            editor.chain().focus().toggleCode().run()
                        }
                        isActive={editor.isActive('code')}
                        tooltip={getShortcutLabel('code')}
                        aria-label='Inline Code'
                    >
                        <Code className='h-4 w-4' />
                    </ToolbarButton>
                </ToolbarGroup>

                <Separator orientation='vertical' className='mx-1 h-6' />

                {/* Headings Dropdown */}
                <ToolbarGroup>
                    <HeadingsDropdown editor={editor} />
                </ToolbarGroup>

                <Separator orientation='vertical' className='mx-1 h-6' />

                {/* Lists Group */}
                <ToolbarGroup>
                    <ToolbarButton
                        onClick={() =>
                            editor.chain().focus().toggleBulletList().run()
                        }
                        isActive={editor.isActive('bulletList')}
                        tooltip={getShortcutLabel('bulletList')}
                        aria-label='Bullet List'
                    >
                        <List className='h-4 w-4' />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() =>
                            editor.chain().focus().toggleOrderedList().run()
                        }
                        isActive={editor.isActive('orderedList')}
                        tooltip={getShortcutLabel('orderedList')}
                        aria-label='Ordered List'
                    >
                        <ListOrdered className='h-4 w-4' />
                    </ToolbarButton>
                </ToolbarGroup>

                <Separator orientation='vertical' className='mx-1 h-6' />

                {/* Block Elements Group */}
                <ToolbarGroup>
                    <ToolbarButton
                        onClick={() =>
                            editor.chain().focus().toggleBlockquote().run()
                        }
                        isActive={editor.isActive('blockquote')}
                        tooltip={getShortcutLabel('blockquote')}
                        aria-label='Quote'
                    >
                        <Quote className='h-4 w-4' />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() =>
                            editor.chain().focus().toggleCodeBlock().run()
                        }
                        isActive={editor.isActive('codeBlock')}
                        tooltip={getShortcutLabel('codeBlock')}
                        aria-label='Code Block'
                    >
                        <TerminalSquare className='h-4 w-4' />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() =>
                            editor.chain().focus().setHorizontalRule().run()
                        }
                        tooltip='Horizontal Rule'
                        aria-label='Horizontal Rule'
                    >
                        <Minus className='h-4 w-4' />
                    </ToolbarButton>
                </ToolbarGroup>

                <Separator orientation='vertical' className='mx-1 h-6' />

                {/* Insert Group */}
                <ToolbarGroup>
                    <ToolbarButton
                        onClick={onAddLink}
                        isActive={editor.isActive('link')}
                        tooltip={getShortcutLabel('link')}
                        aria-label='Add Link'
                    >
                        <LinkIcon className='h-4 w-4' />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={onAddImage}
                        tooltip='Add Image'
                        aria-label='Add Image'
                    >
                        <ImageIcon className='h-4 w-4' />
                    </ToolbarButton>
                    {onAutoInlineImages && (
                        <AutoInlineImagesButton
                            onClick={onAutoInlineImages}
                            disabled={autoInlineImagesDisabled}
                        />
                    )}
                </ToolbarGroup>

                <Separator orientation='vertical' className='mx-1 h-6' />

                {/* History Group */}
                <ToolbarGroup>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().undo().run()}
                        disabled={!editor.can().undo()}
                        tooltip={getShortcutLabel('undo')}
                        aria-label='Undo'
                    >
                        <Undo className='h-4 w-4' />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().redo().run()}
                        disabled={!editor.can().redo()}
                        tooltip={getShortcutLabel('redo')}
                        aria-label='Redo'
                    >
                        <Redo className='h-4 w-4' />
                    </ToolbarButton>
                </ToolbarGroup>
            </div>
        </TooltipProvider>
    )
}
