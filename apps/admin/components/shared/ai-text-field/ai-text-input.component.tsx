/**
 * AI Text Input Component
 *
 * An input field with AI text improvement capabilities.
 * Wraps the standard Input with AI command menu and undo functionality.
 *
 * @module components/shared/ai-text-field/ai-text-input.component
 */
'use client'

import { useCallback, useRef, useEffect } from 'react'
import { Sparkles, Undo2, Loader2 } from 'lucide-react'

import { Input } from '@workspace/ui/components/input'
import { Button } from '@workspace/ui/components/button'
import { cn } from '@workspace/ui/lib/utils'

import type { AITextInputProps } from './ai-text-field.type'
import { useAITextImprovement } from './use-ai-text-improvement.hook'
import { AICommandMenu } from './ai-command-menu.component'

/**
 * AI Text Input
 *
 * An input field with integrated AI text improvement.
 * Supports keyboard shortcut (Cmd+K) and undo functionality.
 *
 * @example
 * ```tsx
 * <AITextInput
 *   value={formData.title}
 *   onChange={(v) => handleChange('title', v)}
 *   name="title"
 *   placeholder="Enter title..."
 * />
 * ```
 */
export function AITextInput({
    value,
    onChange,
    name,
    placeholder,
    disabled,
    className,
    ...inputProps
}: AITextInputProps) {
    const inputRef = useRef<HTMLInputElement>(null)

    const ai = useAITextImprovement({
        value,
        onChange,
        fieldName: name,
    })

    // Destructure specific properties to optimize callback dependencies
    const { isStreaming, openMenu } = ai

    // Keyboard shortcut handler
    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            // Cmd+K or Ctrl+K to open menu
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault()
                if (!disabled && !isStreaming) {
                    openMenu()
                }
            }
        },
        [disabled, isStreaming, openMenu]
    )

    // Focus input when streaming completes
    useEffect(() => {
        if (!ai.isStreaming && inputRef.current) {
            inputRef.current.focus()
        }
    }, [ai.isStreaming])

    return (
        <div className='relative'>
            <div className='flex items-center gap-1'>
                <div className='relative flex-1'>
                    <Input
                        ref={inputRef}
                        value={
                            ai.isStreaming ? ai.streamingText || value : value
                        }
                        onChange={(e) => onChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder}
                        disabled={disabled || ai.isStreaming}
                        className={cn(
                            'pr-10',
                            ai.isStreaming && 'opacity-70',
                            className
                        )}
                        {...inputProps}
                    />

                    {/* AI trigger button */}
                    <AICommandMenu
                        isOpen={ai.isOpen}
                        onOpenChange={(open) =>
                            open ? ai.openMenu() : ai.closeMenu()
                        }
                        isLoading={ai.isStreaming}
                        onSelect={ai.handleOperation}
                        onCancel={ai.handleCancel}
                    >
                        <Button
                            type='button'
                            variant='ghost'
                            size='sm'
                            className='absolute top-1/2 right-1 -translate-y-1/2 p-0'
                            disabled={disabled || !value?.trim()}
                            aria-label='Improve text with AI'
                        >
                            {ai.isStreaming ? (
                                <Loader2 className='h-4 w-4 animate-spin' />
                            ) : (
                                <Sparkles className='h-4 w-4' />
                            )}
                        </Button>
                    </AICommandMenu>
                </div>

                {/* Undo button */}
                {ai.canUndo && (
                    <Button
                        type='button'
                        variant='ghost'
                        size='sm'
                        onClick={ai.handleUndo}
                        className='h-9 w-9 shrink-0 p-0'
                        aria-label='Undo AI change'
                    >
                        <Undo2 className='h-4 w-4' />
                    </Button>
                )}
            </div>

            {/* Keyboard hint */}
            {!disabled && value?.trim() && !ai.isStreaming && (
                <p className='text-muted-foreground mt-1 text-xs'>
                    Press <kbd className='bg-muted rounded px-1'>⌘K</kbd> for AI
                    assistance
                </p>
            )}
        </div>
    )
}
