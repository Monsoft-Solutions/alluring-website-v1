/**
 * Chat Admin Actions
 *
 * Server actions for chat management in admin panel.
 *
 * @module lib/actions/chat
 */
'use server'

import { db } from '@workspace/db/client'
import { chatConfig, chatSession } from '@workspace/db/schema/chat'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

import { chatConfigSchema, type ChatConfigInput } from '@workspace/chat/types'
import { revalidateWebAppCache } from '@/lib/utils/revalidate-web.util'

type ActionResult = {
    success: boolean
    error?: string
}

/**
 * Update chat configuration
 */
export async function updateChatConfig(
    data: ChatConfigInput
): Promise<ActionResult> {
    try {
        // Validate input
        const validated = chatConfigSchema.parse(data)

        // Get existing config
        const existingConfigs = await db.select().from(chatConfig).limit(1)

        if (existingConfigs.length > 0 && existingConfigs[0]) {
            // Update existing
            await db
                .update(chatConfig)
                .set({
                    agentName: validated.agentName,
                    systemPrompt: validated.systemPrompt,
                    welcomeMessage: validated.welcomeMessage,
                    modelId: validated.modelId,
                    temperature: validated.temperature,
                    maxTokens: validated.maxTokens,
                    isEnabled: validated.isEnabled,
                    buttonPosition: validated.buttonPosition,
                    primaryColor: validated.primaryColor,
                })
                .where(eq(chatConfig.id, existingConfigs[0].id))
        } else {
            // Create new
            await db.insert(chatConfig).values({
                agentName: validated.agentName,
                systemPrompt: validated.systemPrompt,
                welcomeMessage: validated.welcomeMessage,
                modelId: validated.modelId,
                temperature: validated.temperature,
                maxTokens: validated.maxTokens,
                isEnabled: validated.isEnabled,
                buttonPosition: validated.buttonPosition,
                primaryColor: validated.primaryColor,
            })
        }

        // Revalidate admin pages
        revalidatePath('/chat')

        // Revalidate web app chat config
        await revalidateWebAppCache(['chat-config'])

        return { success: true }
    } catch (error) {
        console.error('Error updating chat config:', error)
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to update configuration',
        }
    }
}

/**
 * Toggle chat enabled status
 */
export async function toggleChatEnabled(
    isEnabled: boolean
): Promise<ActionResult> {
    try {
        const existingConfigs = await db.select().from(chatConfig).limit(1)

        if (existingConfigs.length > 0 && existingConfigs[0]) {
            await db
                .update(chatConfig)
                .set({ isEnabled })
                .where(eq(chatConfig.id, existingConfigs[0].id))
        }

        revalidatePath('/chat')
        await revalidateWebAppCache(['chat-config'])

        return { success: true }
    } catch (error) {
        console.error('Error toggling chat:', error)
        return {
            success: false,
            error: 'Failed to toggle chat status',
        }
    }
}

/**
 * Delete a chat session
 */
export async function deleteChatSessionAction(
    sessionId: string
): Promise<ActionResult> {
    try {
        await db.delete(chatSession).where(eq(chatSession.id, sessionId))

        revalidatePath('/chat/conversations')

        return { success: true }
    } catch (error) {
        console.error('Error deleting session:', error)
        return {
            success: false,
            error: 'Failed to delete session',
        }
    }
}

/**
 * Create a test session for admin testing
 */
export async function createTestSession(): Promise<{
    success: boolean
    sessionId?: string
    error?: string
}> {
    try {
        const [session] = await db
            .insert(chatSession)
            .values({
                fullName: 'Admin Test',
                phone: '0000000000',
                isTestSession: true,
                status: 'active',
            })
            .returning()

        return {
            success: true,
            sessionId: session?.id,
        }
    } catch (error) {
        console.error('Error creating test session:', error)
        return {
            success: false,
            error: 'Failed to create test session',
        }
    }
}
