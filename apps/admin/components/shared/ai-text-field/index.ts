/**
 * AI Text Field Components
 *
 * Reusable AI-powered text input components with improvement capabilities.
 *
 * @module components/shared/ai-text-field
 */

export { AITextInput } from './ai-text-input.component'
export { AITextarea } from './ai-text-area.component'
export { AICommandMenu } from './ai-command-menu.component'
export { useAITextImprovement } from './use-ai-text-improvement.hook'
export {
    type TextOperation,
    type AITextInputProps,
    type AITextareaProps,
    type AITextImprovementState,
    OPERATIONS,
    getOperationsByGroup,
} from './ai-text-field.type'
