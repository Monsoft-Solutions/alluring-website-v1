/**
 * AI Textarea Component
 *
 * A textarea field with AI text improvement capabilities.
 * Wraps the standard Textarea with AI command menu and undo functionality.
 *
 * @module components/shared/ai-text-field/ai-text-area.component
 */
'use client'

import { useCallback, useRef, useEffect } from 'react'
import { Sparkles, Undo2, Loader2 } from 'lucide-react'

import { Textarea } from '@workspace/ui/components/textarea'
import { Button } from '@workspace/ui/components/button'
import { cn } from '@workspace/ui/lib/utils'

import type { AITextareaProps } from './ai-text-field.type'
import { useAITextImprovement } from './use-ai-text-improvement.hook'
import { AICommandMenu } from './ai-command-menu.component'

/**
 * AI Textarea
 *
 * A textarea field with integrated AI text improvement.
 * Supports keyboard shortcut (Cmd+K) and undo functionality.
 *
 * @example
 * ```tsx
 * <AITextarea
 *   value={formData.description}
 *   onChange={(v) => handleChange('description', v)}
 *   name="description"
 *   placeholder="Enter description..."
 *   rows={4}
 * />
 * ```
 */
export function AITextarea({
    value,
    onChange,
    name,
    placeholder,
    disabled,
    className,
    ...textareaProps
}: AITextareaProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    const ai = useAITextImprovement({
        value,
        onChange,
        fieldName: name,
    })

    // Keyboard shortcut handler
    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            // Cmd+K or Ctrl+K to open menu
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault()
                if (!disabled && !ai.isStreaming) {
                    ai.openMenu()
                }
            }
        },
        [disabled, ai]
    )

    // Focus textarea when streaming completes
    useEffect(() => {
        if (!ai.isStreaming && textareaRef.current) {
            textareaRef.current.focus()
        }
    }, [ai.isStreaming])

    return (
        <div className='relative'>
            <div className='relative'>
                <Textarea
                    ref={textareaRef}
                    value={ai.isStreaming ? ai.streamingText || value : value}
                    onChange={(e) => onChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    disabled={disabled || ai.isStreaming}
                    className={cn(ai.isStreaming && 'opacity-70', className)}
                    {...textareaProps}
                />

                {/* Action buttons */}
                <div className='absolute top-2 right-2 flex items-center gap-1'>
                    {/* Undo button */}
                    {ai.canUndo && (
                        <Button
                            type='button'
                            variant='ghost'
                            size='sm'
                            onClick={ai.handleUndo}
                            className='h-7 w-7 p-0'
                            aria-label='Undo AI change'
                        >
                            <Undo2 className='h-4 w-4' />
                        </Button>
                    )}

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
                            className='h-7 w-7 p-0'
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
