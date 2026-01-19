'use client'

import type { ReactNode } from 'react'

import { Button } from '@workspace/ui/components/button'
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@workspace/ui/components/tooltip'
import { cn } from '@workspace/ui/lib/utils'

type ToolbarButtonProps = {
    onClick: () => void
    isActive?: boolean
    disabled?: boolean
    tooltip: string
    'aria-label': string
    children: ReactNode
}

export function ToolbarButton({
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
