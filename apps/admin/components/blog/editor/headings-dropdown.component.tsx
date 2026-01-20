'use client'

import type { Editor } from '@tiptap/react'
import { Heading1, Heading2, Heading3 } from 'lucide-react'

import { Button } from '@workspace/ui/components/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu'
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@workspace/ui/components/tooltip'
import { cn } from '@workspace/ui/lib/utils'

type HeadingsDropdownProps = {
    editor: Editor
}

export function HeadingsDropdown({ editor }: HeadingsDropdownProps) {
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
