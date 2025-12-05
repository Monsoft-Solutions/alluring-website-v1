/**
 * Chat Configuration Types
 *
 * @module @workspace/chat/types/chat-config
 */
import { z } from 'zod'

/**
 * Available AI models for chat
 */
export const CHAT_MODELS = [
    'gpt-4.1',
    'gpt-4.1-mini',
    'gpt-4-turbo',
    'gpt-4o',
    'gpt-4o-mini',
] as const

export type ChatModel = (typeof CHAT_MODELS)[number]

/**
 * Button position options
 */
export const BUTTON_POSITIONS = [
    'bottom-right',
    'bottom-left',
    'top-right',
    'top-left',
] as const

export type ButtonPosition = (typeof BUTTON_POSITIONS)[number]

/**
 * Chat configuration schema for validation
 */
export const chatConfigSchema = z.object({
    id: z.string().uuid().optional(),
    agentName: z.string().min(1).max(100),
    systemPrompt: z.string().min(10).max(10000),
    welcomeMessage: z.string().min(1).max(500),
    modelId: z.enum(CHAT_MODELS),
    temperature: z.number().min(0).max(2),
    maxTokens: z.number().int().min(100).max(4096),
    isEnabled: z.boolean(),
    buttonPosition: z.enum(BUTTON_POSITIONS),
    primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
})

export type ChatConfigInput = z.infer<typeof chatConfigSchema>

/**
 * Chat configuration for display/API responses
 */
export type ChatConfigResponse = {
    id: string
    agentName: string
    systemPrompt: string
    welcomeMessage: string
    modelId: ChatModel
    temperature: number
    maxTokens: number
    isEnabled: boolean
    buttonPosition: ButtonPosition
    primaryColor: string
    createdAt: Date
    updatedAt: Date
}
