/**
 * @workspace/ai/prompts/chat
 *
 * Chat-related prompt templates.
 *
 * @module @workspace/ai/prompts/chat
 */

export {
    INTENT_CLASSIFICATION_SYSTEM_PROMPT,
    formatMessagesForClassification,
    getIntentClassificationPrompt,
} from './intent-classification.prompt'

export {
    DEFAULT_CHAT_SYSTEM_PROMPT,
    generateSystemPrompt,
    type SystemPromptParams,
} from './system-prompt.prompt'
