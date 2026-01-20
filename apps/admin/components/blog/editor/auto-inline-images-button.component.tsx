'use client'

import { Sparkles, Wand2 } from 'lucide-react'

import { Button } from '@workspace/ui/components/button'
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@workspace/ui/components/tooltip'

type AutoInlineImagesButtonProps = {
    onClick: () => void
    disabled?: boolean
}

/**
 * Toolbar button that triggers the auto inline image generation dialog.
 * Displays a sparkles + wand icon to indicate AI-powered functionality.
 */
export function AutoInlineImagesButton({
    onClick,
    disabled = false,
}: AutoInlineImagesButtonProps) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    variant='ghost'
                    size='sm'
                    onClick={onClick}
                    disabled={disabled}
                    aria-label='Auto Generate Inline Images'
                    className='h-8 gap-1 px-2 transition-colors'
                >
                    <Sparkles className='h-4 w-4' />
                    <Wand2 className='h-3 w-3' />
                </Button>
            </TooltipTrigger>
            <TooltipContent side='bottom' sideOffset={8}>
                <span className='text-xs'>
                    Auto Generate Inline Images (AI)
                </span>
            </TooltipContent>
        </Tooltip>
    )
}
