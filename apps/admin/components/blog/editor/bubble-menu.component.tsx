'use client'

import type { Editor } from '@tiptap/react'
import { BubbleMenu } from '@tiptap/react/menus'
import {
    Bold,
    Code,
    Italic,
    Link as LinkIcon,
    Strikethrough,
} from 'lucide-react'
import type { ReactNode } from 'react'

import { Button } from '@workspace/ui/components/button'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@workspace/ui/components/tooltip'
import { cn } from '@workspace/ui/lib/utils'

import { getShortcutLabel } from './editor-extensions'

type EditorBubbleMenuProps = {
    editor: Editor
    onAddLink: () => void
}

export function EditorBubbleMenu({ editor, onAddLink }: EditorBubbleMenuProps) {
    return (
        <BubbleMenu
            editor={editor}
            shouldShow={({
                editor: bubbleEditor,
                state,
            }: {
                editor: Editor
                state: { selection: { empty: boolean } }
            }) => {
                // Don't show if selection is empty
                if (state.selection.empty) return false
                // Don't show in code blocks
                if (bubbleEditor.isActive('codeBlock')) return false
                // Don't show when selecting images
                if (bubbleEditor.isActive('image')) return false

                return true
            }}
            className='flex items-center gap-0.5 rounded-lg border bg-white p-1 shadow-lg'
        >
            <TooltipProvider delayDuration={300}>
                <BubbleButton
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    isActive={editor.isActive('bold')}
                    tooltip={getShortcutLabel('bold')}
                    aria-label='Bold'
                >
                    <Bold className='h-4 w-4' />
                </BubbleButton>
                <BubbleButton
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    isActive={editor.isActive('italic')}
                    tooltip={getShortcutLabel('italic')}
                    aria-label='Italic'
                >
                    <Italic className='h-4 w-4' />
                </BubbleButton>
                <BubbleButton
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    isActive={editor.isActive('strike')}
                    tooltip={getShortcutLabel('strike')}
                    aria-label='Strikethrough'
                >
                    <Strikethrough className='h-4 w-4' />
                </BubbleButton>
                <BubbleButton
                    onClick={() => editor.chain().focus().toggleCode().run()}
                    isActive={editor.isActive('code')}
                    tooltip={getShortcutLabel('code')}
                    aria-label='Inline Code'
                >
                    <Code className='h-4 w-4' />
                </BubbleButton>

                <div className='mx-1 h-5 w-px bg-stone-200' />

                <BubbleButton
                    onClick={onAddLink}
                    isActive={editor.isActive('link')}
                    tooltip={getShortcutLabel('link')}
                    aria-label='Add Link'
                >
                    <LinkIcon className='h-4 w-4' />
                </BubbleButton>
            </TooltipProvider>
        </BubbleMenu>
    )
}

type BubbleButtonProps = {
    onClick: () => void
    isActive?: boolean
    tooltip: string
    'aria-label': string
    children: ReactNode
}

function BubbleButton({
    onClick,
    isActive,
    tooltip,
    'aria-label': ariaLabel,
    children,
}: BubbleButtonProps) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    variant='ghost'
                    size='sm'
                    onClick={onClick}
                    aria-label={ariaLabel}
                    className={cn(
                        'h-7 w-7 p-0 transition-colors',
                        isActive && 'bg-stone-100 text-stone-900'
                    )}
                >
                    {children}
                </Button>
            </TooltipTrigger>
            <TooltipContent side='top' sideOffset={8}>
                <span className='text-xs'>{tooltip}</span>
            </TooltipContent>
        </Tooltip>
    )
}
