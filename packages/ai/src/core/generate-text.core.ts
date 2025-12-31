/**
 * Core Generate Text Function
 *
 * Wrapper for AI SDK generateText with centralized configuration.
 * Provides a single point for telemetry, error handling, and other cross-cutting concerns.
 * Supports agentic tool calling with maxSteps for multi-step workflows.
 *
 * @module @workspace/ai/core/generate-text
 */
import { generateText } from 'ai'
import { openai } from '@ai-sdk/openai'

import type { CoreGenerateTextOptions, CoreToolSet } from './types.core'
import { DEFAULT_CHAT_MODEL_ID } from '../models/available-models.constant'
import { telemetryConfig } from '../telemetry'

// Re-export result type for consumers
export type { GenerateTextResult } from 'ai'

/**
 * Convert CoreToolSet to AI SDK tools format
 * Uses explicit any typing due to AI SDK's complex nested generics
 */
function convertTools(coreTools?: CoreToolSet) {
    if (!coreTools) return undefined

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const aiSdkTools: Record<string, any> = {}

    for (const [name, coreTool] of Object.entries(coreTools)) {
        // Build tool object directly to avoid TypeScript issues with the tool() helper
        aiSdkTools[name] = {
            description: coreTool.description,
            inputSchema: coreTool.parameters, // AI SDK v5 expects inputSchema
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            execute: async (params: any) => coreTool.execute(params),
        }
    }

    return aiSdkTools
}

/**
 * Generate text using AI
 *
 * Wraps the AI SDK generateText function with consistent configuration
 * and a centralized extension point for telemetry.
 * Supports agentic tool calling with maxSteps for multi-step workflows.
 *
 * @param options - Generation options including prompts, tools, and model config
 * @returns The generation result with text and metadata
 *
 * @example
 * ```typescript
 * // Simple prompt-based generation
 * const result = await coreGenerateText({
 *   system: 'You are a helpful assistant',
 *   prompt: 'Write a haiku about coding',
 *   modelId: 'gpt-4.1-mini',
 * })
 * console.log(result.text)
 *
 * // Chat-based generation with messages
 * const chatResult = await coreGenerateText({
 *   system: 'You are a helpful assistant',
 *   messages: [
 *     { role: 'user', content: 'Hello!' },
 *     { role: 'assistant', content: 'Hi there!' },
 *     { role: 'user', content: 'How are you?' },
 *   ],
 * })
 *
 * // Agentic generation with tools
 * const agentResult = await coreGenerateText({
 *   system: 'You are a research assistant',
 *   prompt: 'Find the latest statistics on plastic surgery',
 *   tools: {
 *     web_search: {
 *       description: 'Search the web for information',
 *       parameters: z.object({ query: z.string() }),
 *       execute: async ({ query }) => await searchWeb(query),
 *     },
 *   },
 *   maxSteps: 10,
 *   onStepFinish: (step) => console.log('Step:', step),
 * })
 * ```
 */
export async function coreGenerateText(options: CoreGenerateTextOptions) {
    const {
        modelId = DEFAULT_CHAT_MODEL_ID,
        temperature = 0.7,
        system,
        maxTokens,
        tools,
        maxSteps,
        onStepFinish,
    } = options

    // Convert our tool format to AI SDK format
    const aiSdkTools = convertTools(tools)

    // Build base config - note: we pass onStepFinish directly as the AI SDK accepts any function
    const baseConfig = {
        model: openai(modelId),
        system,
        temperature,
        experimental_telemetry: telemetryConfig,
        ...(maxTokens && { maxOutputTokens: maxTokens }),
        ...(aiSdkTools && { tools: aiSdkTools }),
        ...(maxSteps && { maxSteps }),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
        ...(onStepFinish && { onStepFinish: onStepFinish as any }),
    }

    // Handle discriminated union - either prompt or messages
    const result =
        'prompt' in options
            ? await generateText({ ...baseConfig, prompt: options.prompt })
            : await generateText({ ...baseConfig, messages: options.messages })

    return result
}
