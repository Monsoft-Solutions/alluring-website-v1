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
import { validateClaimTokens } from '@workspace/shared/claims/tokens'
import { findTypedPrices } from '@workspace/shared/claims/typed-prices'
import { getPricingSnapshot } from '@/lib/queries/pricing.query'
import { revalidateWebAppCache } from '@/lib/utils/revalidate-web.util'
import { requireAuth, UnauthorizedError } from '@/lib/utils/auth.util'

type ActionResult = {
    success: boolean
    error?: string
}

/**
 * The save error for claim tokens in the prompt or welcome message that
 * would resolve to nothing, or for an Alluring price typed instead of a
 * token (#354); null when both are clean. The chat prompt names prices with
 * tokens like every other DB text, so a price edit reaches Sofía too.
 */
async function claimTextError(
    fields: Pick<ChatConfigInput, 'systemPrompt' | 'welcomeMessage'>
): Promise<string | null> {
    const pricing = await getPricingSnapshot()
    const problems = (
        [
            ['System prompt', fields.systemPrompt],
            ['Welcome message', fields.welcomeMessage],
        ] as const
    ).flatMap(([field, text]) => [
        ...validateClaimTokens(text, { pricing }).errors.map(
            (error) =>
                `${field}: ${error.raw} — ${error.reason}${error.suggestion ? ` Did you mean ${error.suggestion}?` : ''}`
        ),
        ...findTypedPrices(text, { pricing }).map(
            (issue) => `${field}: ${issue.raw} — ${issue.reason}`
        ),
    ])
    return problems.length > 0
        ? `Fix these claim tokens and typed prices before saving: ${problems.join('; ')}`
        : null
}

/**
 * Update chat configuration
 */
export async function updateChatConfig(
    data: ChatConfigInput
): Promise<ActionResult> {
    try {
        await requireAuth()

        // Validate input
        const validated = chatConfigSchema.parse(data)

        const claimError = await claimTextError(validated)
        if (claimError) return { success: false, error: claimError }

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
                    agentImageUrl: validated.agentImageUrl,
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
                agentImageUrl: validated.agentImageUrl,
            })
        }

        // Revalidate admin pages
        revalidatePath('/chat')

        // Revalidate web app chat config
        await revalidateWebAppCache(['chat-config'])

        return { success: true }
    } catch (error) {
        console.error('Error updating chat config:', error)

        if (error instanceof UnauthorizedError) {
            return { success: false, error: 'Unauthorized' }
        }

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
        await requireAuth()

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

        if (error instanceof UnauthorizedError) {
            return { success: false, error: 'Unauthorized' }
        }

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
        await requireAuth()

        await db.delete(chatSession).where(eq(chatSession.id, sessionId))

        revalidatePath('/chat/conversations')

        return { success: true }
    } catch (error) {
        console.error('Error deleting session:', error)

        if (error instanceof UnauthorizedError) {
            return { success: false, error: 'Unauthorized' }
        }

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
        await requireAuth()

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

        if (error instanceof UnauthorizedError) {
            return { success: false, error: 'Unauthorized' }
        }

        return {
            success: false,
            error: 'Failed to create test session',
        }
    }
}
