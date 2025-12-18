/**
 * Contact Submission Queries
 *
 * Database queries for contact_submission table.
 *
 * @module lib/queries/contact
 */
import { db } from '@workspace/db/client'
import {
    contactSubmission,
    type ContactSubmission,
} from '@workspace/db/schema/contact'
import { eq } from 'drizzle-orm'

/**
 * Get a contact submission by ID
 *
 * Used by chat session creation to fetch full contact data
 * when a contactSubmissionId is provided (thank-you page flow).
 *
 * @param id - The contact submission UUID
 * @returns The contact submission or null if not found
 */
export async function getContactSubmissionById(
    id: string
): Promise<ContactSubmission | null> {
    const results = await db
        .select()
        .from(contactSubmission)
        .where(eq(contactSubmission.id, id))
        .limit(1)

    return results[0] ?? null
}
