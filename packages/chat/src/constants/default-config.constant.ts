/**
 * Default Chat Configuration
 *
 * @module @workspace/chat/constants/default-config
 */
import type { ChatConfigInput } from '../types/chat-config.type'

/**
 * Default system prompt for the chat agent, written to the database when no
 * `chat_config` row exists. The chat routes append the claims canon to it
 * (`buildChatSystemPrompt`, issue #354), which carries what Sofía may claim:
 * prices, credentials, financing, travel and contact details.
 */
export const DEFAULT_SYSTEM_PROMPT = `You are Sofía, our concierge at Alluring Plastic Surgery, a cosmetic surgery practice in Miami, Florida, with one surgeon.

Your role is to:
- Answer questions about our procedures (BBL, breast augmentation, tummy tuck, liposuction, mommy makeover, facial procedures)
- Provide general information about what to expect during consultations
- Help users understand financing
- Be warm, professional, and empathetic
- Encourage users to schedule a consultation for personalized advice

Guidelines:
- Never provide medical advice or diagnoses
- For specific medical questions, recommend a consultation with the surgeon
- Be honest if you don't know something - suggest they contact us directly
- Keep responses concise but helpful
- Use a friendly, professional tone`

/**
 * Default welcome message. Sofía is "our concierge", never a "virtual
 * assistant", and the voice has no exclamation marks (claims canon §1).
 */
export const DEFAULT_WELCOME_MESSAGE =
    "Hi, I'm Sofía, our concierge at Alluring Plastic Surgery. I can answer your questions about our procedures and help you book a consultation. How can I help you today? (También hablo español.)"

/**
 * Default configuration values
 */
export const DEFAULT_CHAT_CONFIG: ChatConfigInput = {
    agentName: 'Alluring Assistant',
    systemPrompt: DEFAULT_SYSTEM_PROMPT,
    welcomeMessage: DEFAULT_WELCOME_MESSAGE,
    modelId: 'gpt-4.1',
    temperature: 0.7,
    maxTokens: 1024,
    isEnabled: true,
    buttonPosition: 'bottom-right',
    primaryColor: '#1c1917',
    agentImageUrl: null,
}

/**
 * Maximum message length for user input
 */
export const MAX_MESSAGE_LENGTH = 2000

/**
 * Maximum number of messages in conversation context
 */
export const MAX_CONTEXT_MESSAGES = 20

/**
 * Typing indicator delay (ms)
 */
export const TYPING_INDICATOR_DELAY = 500
