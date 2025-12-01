/**
 * SubmitButton Component
 *
 * A submit button with loading state and customizable variants.
 * Wraps shadcn Button with form-specific functionality.
 *
 * @module components/shared/forms/submit-button
 */
import { Button } from '@workspace/ui/components/button'
import type { ComponentProps } from 'react'
import { cn } from '@workspace/ui/lib/utils'
import { Loader2, Send, Sparkles } from 'lucide-react'
import type { ReactNode } from 'react'

/**
 * Props for the SubmitButton component
 */
export type SubmitButtonProps = Omit<ComponentProps<typeof Button>, 'type'> & {
    /** Whether the form is currently submitting */
    readonly isSubmitting?: boolean
    /** Text to display while submitting */
    readonly loadingText?: string
    /** Text to display when idle */
    readonly children: ReactNode
    /** Show decorative icon (sparkles) after text */
    readonly showSparkles?: boolean
    /** Show send icon before text */
    readonly showSendIcon?: boolean
    /** Full width button */
    readonly fullWidth?: boolean
}

/**
 * SubmitButton provides a consistent submit button experience
 *
 * @example
 * ```tsx
 * // Basic usage
 * <SubmitButton isSubmitting={isSubmitting}>
 *   Submit
 * </SubmitButton>
 *
 * // With icons and full width
 * <SubmitButton
 *   isSubmitting={isSubmitting}
 *   showSendIcon
 *   showSparkles
 *   fullWidth
 *   variant="gold"
 * >
 *   Request Consultation
 * </SubmitButton>
 * ```
 */
export function SubmitButton({
    isSubmitting = false,
    loadingText = 'Sending...',
    children,
    showSparkles = false,
    showSendIcon = false,
    fullWidth = false,
    disabled,
    className,
    ...props
}: SubmitButtonProps) {
    return (
        <Button
            type='submit'
            disabled={disabled ?? isSubmitting}
            className={cn('group relative', fullWidth && 'w-full', className)}
            {...props}
        >
            {isSubmitting ? (
                <>
                    <Loader2 className='mr-2 h-5 w-5 animate-spin' />
                    <span>{loadingText}</span>
                </>
            ) : (
                <>
                    {showSendIcon && (
                        <Send className='mr-2 h-5 w-5 transition-transform duration-200 group-hover:translate-x-0.5' />
                    )}
                    <span>{children}</span>
                    {showSparkles && (
                        <Sparkles className='ml-2 h-4 w-4 opacity-60 transition-opacity duration-200 group-hover:opacity-100' />
                    )}
                </>
            )}
        </Button>
    )
}
