import { cache } from 'react'
import { db } from '@workspace/db/client'
import { chatSession } from '@workspace/db/schema/chat'
import { desc, inArray } from 'drizzle-orm'

export type HighValueLead = {
    id: string
    fullName: string
    email: string | null
    phone: string
    leadGrade: string | null
    leadScore: number
    createdAt: Date
}

/**
 * Get recent high-value leads (Grade A or B)
 */
export const getHighValueLeads = cache(
    async (limit = 5): Promise<HighValueLead[]> => {
        const leads = await db
            .select({
                id: chatSession.id,
                fullName: chatSession.fullName,
                email: chatSession.email,
                phone: chatSession.phone,
                leadGrade: chatSession.leadGrade,
                leadScore: chatSession.leadScore,
                createdAt: chatSession.createdAt,
            })
            .from(chatSession)
            .where(inArray(chatSession.leadGrade, ['A', 'B']))
            .orderBy(desc(chatSession.createdAt))
            .limit(limit)

        return leads
    }
)
