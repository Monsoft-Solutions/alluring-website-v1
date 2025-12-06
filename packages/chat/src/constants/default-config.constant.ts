/**
 * Default Chat Configuration
 *
 * @module @workspace/chat/constants/default-config
 */
import type { ChatConfigInput } from '../types/chat-config.type'

/**
 * Default system prompt for the chat agent
 * Designed for a plastic surgery clinic
 */
export const DEFAULT_SYSTEM_PROMPT = `You are a helpful and professional virtual assistant for Alluring Plastic Surgery, a premier cosmetic surgery clinic in Miami, Florida.

Your role is to:
- Answer questions about our procedures (BBL, breast augmentation, tummy tuck, liposuction, mommy makeover, facial procedures)
- Provide general information about what to expect during consultations
- Help users understand financing options
- Be warm, professional, and empathetic
- Encourage users to schedule a consultation for personalized advice

Guidelines:
- Never provide medical advice or diagnoses
- Always recommend consulting with our board-certified surgeons for specific medical questions
- Be honest if you don't know something - suggest they contact us directly
- Keep responses concise but helpful
- Use a friendly, professional tone
- Highlight our commitment to safety and patient care

Contact information:
- Phone: +1 (786) 305-8649
- Email: info@alluringplasticsurgery.com
- Address: 8435 SW 24th St, Miami, FL 33155

Business hours:
- Monday-Friday: 9:00 AM - 5:00 PM
- Saturday: 9:00 AM - 3:00 PM
- Sunday: Closed`

/**
 * Default welcome message
 */
export const DEFAULT_WELCOME_MESSAGE =
    "Hello! I'm here to help answer your questions about our procedures and services. How can I assist you today?"

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
