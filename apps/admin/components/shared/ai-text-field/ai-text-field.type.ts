/**
 * AI Text Field Types
 *
 * Type definitions for AI-powered text input and textarea components.
 *
 * @module components/shared/ai-text-field/ai-text-field.type
 */

import type { TextOperation } from '@workspace/shared/schemas/text'

/**
 * Base props shared by AITextInput and AITextarea
 */
export type AITextFieldBaseProps = {
    /** Current field value */
    value: string
    /** Change handler */
    onChange: (value: string) => void
    /** Field name for AI context (e.g., "title", "description") */
    name: string
    /** Placeholder text */
    placeholder?: string
    /** Disabled state */
    disabled?: boolean
    /** Additional CSS classes */
    className?: string
}

/**
 * Props for AITextInput component
 */
export type AITextInputProps = AITextFieldBaseProps &
    Omit<React.ComponentProps<'input'>, 'value' | 'onChange' | 'name'>

/**
 * Props for AITextarea component
 */
export type AITextareaProps = AITextFieldBaseProps &
    Omit<React.ComponentProps<'textarea'>, 'value' | 'onChange' | 'name'>

/**
 * State returned by the useAITextImprovement hook
 */
export type AITextImprovementState = {
    /** Whether the command menu is open */
    isOpen: boolean
    /** Whether text is currently streaming */
    isStreaming: boolean
    /** Whether undo is available */
    canUndo: boolean
    /** Text being streamed (partial result) */
    streamingText: string
    /** Error message if any */
    error: string | null
    /** Open the command menu */
    openMenu: () => void
    /** Close the command menu */
    closeMenu: () => void
    /** Execute an operation */
    handleOperation: (
        operation: TextOperation,
        customInstruction?: string
    ) => Promise<void>
    /** Undo the last operation */
    handleUndo: () => void
    /** Cancel the current streaming operation */
    handleCancel: () => void
}
