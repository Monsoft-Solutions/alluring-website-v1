/**
 * Quick Reply Server Actions
 *
 * Server actions for managing quick replies in the admin panel.
 *
 * @module lib/actions/quick-replies
 */
'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import {
    createQuickReply,
    updateQuickReply,
    deleteQuickReply,
} from '@/lib/queries/chat.query'
import { QUICK_REPLY_CATEGORIES } from '@workspace/db/schema/chat'
import { requireAuth, UnauthorizedError } from '@/lib/utils/auth.util'

/**
 * Quick reply form schema
 */
const quickReplySchema = z.object({
    label: z.string().min(1, 'Label is required').max(100),
    message: z.string().min(1, 'Message is required').max(500),
    category: z.enum(QUICK_REPLY_CATEGORIES),
    sortOrder: z.coerce.number().int().min(0).default(0),
    isActive: z.boolean().default(true),
})

export type QuickReplyFormData = z.infer<typeof quickReplySchema>

type ActionResult = {
    success: boolean
    error?: string
}

/**
 * Create a new quick reply
 */
export async function createQuickReplyAction(
    data: QuickReplyFormData
): Promise<ActionResult> {
    try {
        await requireAuth()

        const validated = quickReplySchema.parse(data)

        await createQuickReply({
            label: validated.label,
            message: validated.message,
            category: validated.category,
            sortOrder: validated.sortOrder,
            isActive: validated.isActive,
        })

        revalidatePath('/chat')
        revalidatePath('/chat/quick-replies')

        return { success: true }
    } catch (error) {
        if (error instanceof UnauthorizedError) {
            return { success: false, error: 'Unauthorized' }
        }
        if (error instanceof z.ZodError) {
            return { success: false, error: error.issues[0]?.message }
        }
        console.error('Failed to create quick reply:', error)
        return { success: false, error: 'Failed to create quick reply' }
    }
}

/**
 * Update an existing quick reply
 */
export async function updateQuickReplyAction(
    id: string,
    data: Partial<QuickReplyFormData>
): Promise<ActionResult> {
    try {
        await requireAuth()

        const validated = quickReplySchema.partial().parse(data)

        await updateQuickReply(id, validated)

        revalidatePath('/chat')
        revalidatePath('/chat/quick-replies')

        return { success: true }
    } catch (error) {
        if (error instanceof UnauthorizedError) {
            return { success: false, error: 'Unauthorized' }
        }
        if (error instanceof z.ZodError) {
            return { success: false, error: error.issues[0]?.message }
        }
        console.error('Failed to update quick reply:', error)
        return { success: false, error: 'Failed to update quick reply' }
    }
}

/**
 * Delete a quick reply
 */
export async function deleteQuickReplyAction(
    id: string
): Promise<ActionResult> {
    try {
        await requireAuth()

        const success = await deleteQuickReply(id)

        if (!success) {
            return { success: false, error: 'Quick reply not found' }
        }

        revalidatePath('/chat')
        revalidatePath('/chat/quick-replies')

        return { success: true }
    } catch (error) {
        if (error instanceof UnauthorizedError) {
            return { success: false, error: 'Unauthorized' }
        }
        console.error('Failed to delete quick reply:', error)
        return { success: false, error: 'Failed to delete quick reply' }
    }
}

/**
 * Toggle quick reply active status
 */
export async function toggleQuickReplyAction(
    id: string,
    isActive: boolean
): Promise<ActionResult> {
    try {
        await requireAuth()

        await updateQuickReply(id, { isActive })

        revalidatePath('/chat')
        revalidatePath('/chat/quick-replies')

        return { success: true }
    } catch (error) {
        if (error instanceof UnauthorizedError) {
            return { success: false, error: 'Unauthorized' }
        }
        console.error('Failed to toggle quick reply:', error)
        return { success: false, error: 'Failed to toggle quick reply' }
    }
}
