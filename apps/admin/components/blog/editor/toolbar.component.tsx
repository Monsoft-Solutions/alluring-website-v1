'use client'

import type { Editor } from '@tiptap/react'
import {
    Bold,
    Code,
    Heading1,
    Heading2,
    Heading3,
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
import type { ReactNode } from 'react'

import { Button } from '@workspace/ui/components/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu'
import { Separator } from '@workspace/ui/components/separator'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@workspace/ui/components/tooltip'
import { cn } from '@workspace/ui/lib/utils'

import { getShortcutLabel } from './editor-extensions'

type EditorToolbarProps = {
    editor: Editor
    onAddLink: () => void
    onAddImage: () => void
}

export function EditorToolbar({
    editor,
    onAddLink,
    onAddImage,
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

function ToolbarGroup({ children }: { children: ReactNode }) {
    return <div className='flex items-center gap-0.5'>{children}</div>
}

type ToolbarButtonProps = {
    onClick: () => void
    isActive?: boolean
    disabled?: boolean
    tooltip: string
    'aria-label': string
    children: ReactNode
}

function ToolbarButton({
    onClick,
    isActive,
    disabled,
    tooltip,
    'aria-label': ariaLabel,
    children,
}: ToolbarButtonProps) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    variant='ghost'
                    size='sm'
                    onClick={onClick}
                    disabled={disabled}
                    aria-label={ariaLabel}
                    className={cn(
                        'h-8 w-8 p-0 transition-colors',
                        isActive && 'bg-stone-200 text-stone-900',
                        disabled && 'opacity-40'
                    )}
                >
                    {children}
                </Button>
            </TooltipTrigger>
            <TooltipContent side='bottom' sideOffset={8}>
                <span className='text-xs'>{tooltip}</span>
            </TooltipContent>
        </Tooltip>
    )
}

function HeadingsDropdown({ editor }: { editor: Editor }) {
    const currentHeading = editor.isActive('heading', { level: 1 })
        ? 'H1'
        : editor.isActive('heading', { level: 2 })
          ? 'H2'
          : editor.isActive('heading', { level: 3 })
            ? 'H3'
            : null

    return (
        <DropdownMenu>
            <Tooltip>
                <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant='ghost'
                            size='sm'
                            className={cn(
                                'h-8 gap-1 px-2 text-xs font-medium',
                                currentHeading && 'bg-stone-200 text-stone-900'
                            )}
                        >
                            {currentHeading ?? 'Heading'}
                        </Button>
                    </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent side='bottom' sideOffset={8}>
                    <span className='text-xs'>Headings</span>
                </TooltipContent>
            </Tooltip>
            <DropdownMenuContent align='start' className='min-w-[140px]'>
                <DropdownMenuItem
                    onClick={() =>
                        editor.chain().focus().toggleHeading({ level: 1 }).run()
                    }
                    className='gap-2'
                >
                    <Heading1 className='h-4 w-4' />
                    <span className='font-bold'>Heading 1</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() =>
                        editor.chain().focus().toggleHeading({ level: 2 }).run()
                    }
                    className='gap-2'
                >
                    <Heading2 className='h-4 w-4' />
                    <span className='font-semibold'>Heading 2</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() =>
                        editor.chain().focus().toggleHeading({ level: 3 }).run()
                    }
                    className='gap-2'
                >
                    <Heading3 className='h-4 w-4' />
                    <span className='font-medium'>Heading 3</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
