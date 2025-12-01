/**
 * FormFeedback Component
 *
 * Displays success or error feedback messages for form submissions.
 * Supports both light and dark theme variants.
 *
 * @module components/shared/forms/form-feedback
 */
import { cn } from '@workspace/ui/lib/utils'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

/**
 * Theme variant for the feedback component
 */
export type FormFeedbackVariant = 'light' | 'dark'

/**
 * Feedback status type
 */
export type FormFeedbackStatus = 'success' | 'error'

/**
 * Props for the FormFeedback component
 */
export type FormFeedbackProps = {
    /** The feedback status */
    readonly status: FormFeedbackStatus
    /** The message to display */
    readonly message: string
    /** Optional title for the feedback */
    readonly title?: string
    /** Theme variant */
    readonly variant?: FormFeedbackVariant
    /** Additional class names */
    readonly className?: string
}

/**
 * Get styles based on status and variant
 */
function getStyles(status: FormFeedbackStatus, variant: FormFeedbackVariant) {
    if (status === 'success') {
        return variant === 'dark'
            ? {
                  container: 'border-green-500/30 bg-green-500/10',
                  icon: 'text-green-400',
                  iconBg: 'bg-green-500/20',
                  title: 'text-white',
                  message: 'text-green-300',
              }
            : {
                  container:
                      'border-green-200/60 bg-gradient-to-r from-green-50 to-emerald-50',
                  icon: 'text-green-600',
                  iconBg: 'bg-green-100',
                  title: 'text-green-800',
                  message: 'text-green-700',
              }
    }

    return variant === 'dark'
        ? {
              container: 'border-red-500/30 bg-red-500/10',
              icon: 'text-red-400',
              iconBg: 'bg-red-500/20',
              title: 'text-white',
              message: 'text-red-300',
          }
        : {
              container:
                  'border-red-200/60 bg-gradient-to-r from-red-50 to-rose-50',
              icon: 'text-red-600',
              iconBg: 'bg-red-100',
              title: 'text-red-800',
              message: 'text-red-700',
          }
}

/**
 * FormFeedback displays success or error messages with consistent styling
 *
 * @example
 * ```tsx
 * // Success message with dark theme
 * <FormFeedback
 *   status="success"
 *   message="Thank you! We'll contact you within 24 hours."
 *   variant="dark"
 * />
 *
 * // Error message with light theme
 * <FormFeedback
 *   status="error"
 *   title="Error"
 *   message="Something went wrong. Please try again."
 *   variant="light"
 * />
 * ```
 */
export function FormFeedback({
    status,
    message,
    title,
    variant = 'light',
    className,
}: FormFeedbackProps) {
    const styles = getStyles(status, variant)
    const Icon = status === 'success' ? CheckCircle2 : AlertCircle

    // Compact variant for dark theme (inline style)
    if (variant === 'dark') {
        return (
            <div
                className={cn(
                    'flex items-center gap-3 rounded-lg border p-4',
                    'animate-in slide-in-from-bottom-2 duration-300',
                    styles.container,
                    className
                )}
                role='alert'
                aria-live={status === 'error' ? 'assertive' : 'polite'}
            >
                <Icon className={cn('h-5 w-5 shrink-0', styles.icon)} />
                <div className='flex-1'>
                    {title && (
                        <h4
                            className={cn(
                                'text-sm font-semibold',
                                styles.title
                            )}
                        >
                            {title}
                        </h4>
                    )}
                    <p className={cn('text-sm', styles.message)}>{message}</p>
                </div>
            </div>
        )
    }

    // Expanded variant for light theme (card style)
    return (
        <div
            className={cn(
                'flex items-start gap-4 rounded-xl border p-6 shadow-sm',
                'animate-in slide-in-from-bottom-2 duration-300',
                styles.container,
                className
            )}
            role='alert'
            aria-live={status === 'error' ? 'assertive' : 'polite'}
        >
            <div className={cn('rounded-full p-2', styles.iconBg)}>
                <Icon className={cn('h-5 w-5 shrink-0', styles.icon)} />
            </div>
            <div className='space-y-1'>
                {title && (
                    <h4 className={cn('text-sm font-semibold', styles.title)}>
                        {title}
                    </h4>
                )}
                <p className={cn('text-sm leading-relaxed', styles.message)}>
                    {message}
                </p>
            </div>
        </div>
    )
}

/**
 * FormSuccessMessage - Convenience component for success messages
 */
export function FormSuccessMessage({
    message,
    title = 'Success!',
    variant = 'light',
    className,
}: Omit<FormFeedbackProps, 'status'>) {
    return (
        <FormFeedback
            status='success'
            message={message}
            title={title}
            variant={variant}
            className={className}
        />
    )
}

/**
 * FormErrorMessage - Convenience component for error messages
 */
export function FormErrorMessage({
    message,
    title,
    variant = 'light',
    className,
}: Omit<FormFeedbackProps, 'status'>) {
    return (
        <FormFeedback
            status='error'
            message={message}
            title={title}
            variant={variant}
            className={className}
        />
    )
}
