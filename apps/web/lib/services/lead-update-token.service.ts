/**
 * Lead update tokens (#274).
 *
 * `/api/contact` hands the thank-you page a token with the id of the lead it
 * just saved, so the visitor's optional answers can be added to that lead —
 * and to no other. The token is an HMAC of the id and an expiry, signed with
 * `LEAD_UPDATE_SECRET`; without the secret no token is issued and the
 * thank-you page skips its questions.
 *
 * @module lib/services/lead-update-token.service
 */
import { createHmac, timingSafeEqual } from 'node:crypto'

import { env } from '@/env'

/** Long enough to answer on the thank-you page, short enough to be useless later. */
const TOKEN_TTL_MS = 6 * 60 * 60 * 1000

function sign(secret: string, id: string, expiresAt: number): string {
    return createHmac('sha256', secret)
        .update(`lead-update:${id}:${expiresAt}`)
        .digest('base64url')
}

/** `<expiresAt>.<signature>`, or null when updates are not configured. */
export function createLeadUpdateToken(
    id: string,
    now: number = Date.now()
): string | null {
    const secret = env.LEAD_UPDATE_SECRET
    if (!secret) return null
    const expiresAt = now + TOKEN_TTL_MS
    return `${expiresAt}.${sign(secret, id, expiresAt)}`
}

export function verifyLeadUpdateToken(
    id: string,
    token: string,
    now: number = Date.now()
): boolean {
    const secret = env.LEAD_UPDATE_SECRET
    if (!secret) return false

    const [expiresRaw, signature] = token.split('.')
    const expiresAt = Number(expiresRaw)
    if (!signature || !Number.isSafeInteger(expiresAt) || expiresAt < now) {
        return false
    }

    const expected = Buffer.from(sign(secret, id, expiresAt))
    const given = Buffer.from(signature)
    return expected.length === given.length && timingSafeEqual(expected, given)
}
