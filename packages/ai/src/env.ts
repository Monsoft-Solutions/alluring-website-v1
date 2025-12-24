/**
 * Environment Configuration
 *
 * Centralized environment variable validation for the AI package.
 * Uses Zod for runtime validation of required API keys.
 *
 * @module @workspace/ai/env
 */
import { z } from 'zod'

/**
 * Environment schema for AI package
 */
const envSchema = z.object({
    /**
     * Tavily API key for web search
     * Get one at https://tavily.com
     */
    TAVILY_API_KEY: z.string().optional(),

    /**
     * Google Custom Search API key
     * Create at https://console.cloud.google.com/apis/credentials
     */
    GOOGLE_CUSTOM_SEARCH_API_KEY: z.string().optional(),

    /**
     * Google Programmable Search Engine ID
     * Create at https://programmablesearchengine.google.com
     */
    GOOGLE_CUSTOM_SEARCH_ENGINE_ID: z.string().optional(),
})

/**
 * Validated environment variables
 */
export const env = envSchema.parse({
    TAVILY_API_KEY: process.env.TAVILY_API_KEY,
    GOOGLE_CUSTOM_SEARCH_API_KEY: process.env.GOOGLE_CUSTOM_SEARCH_API_KEY,
    GOOGLE_CUSTOM_SEARCH_ENGINE_ID: process.env.GOOGLE_CUSTOM_SEARCH_ENGINE_ID,
})

/**
 * Check if Tavily search is configured
 */
export function isTavilyConfigured(): boolean {
    return Boolean(env.TAVILY_API_KEY)
}

/**
 * Check if Google Custom Search is configured
 */
export function isGoogleSearchConfigured(): boolean {
    return Boolean(
        env.GOOGLE_CUSTOM_SEARCH_API_KEY && env.GOOGLE_CUSTOM_SEARCH_ENGINE_ID
    )
}
