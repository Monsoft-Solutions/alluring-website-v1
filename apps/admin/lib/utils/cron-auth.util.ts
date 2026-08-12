/**
 * Cron Authentication Utility
 *
 * Validates the `Authorization: Bearer <CRON_SECRET>` header Vercel sends on
 * scheduled invocations (and that the local trigger script sends in dev).
 * Timing-safe comparison ported from apps/web's withApiAuth middleware.
 *
 * @module @/lib/utils/cron-auth.util
 */
import crypto from 'node:crypto'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { env } from '@/env'

/**
 * Returns null when the request is authorized; otherwise the error response
 * to send. Kept as a helper (not a wrapper) so the cron route can combine it
 * with its own dispatch logic.
 */
export function verifyCronRequest(request: NextRequest): NextResponse | null {
    const secret = env.CRON_SECRET
    if (!secret) {
        console.error('[Cron] CRON_SECRET is not configured')
        return NextResponse.json(
            { success: false, error: 'Cron is not configured' },
            { status: 503 }
        )
    }

    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json(
            {
                success: false,
                error: 'Missing or invalid authorization header',
            },
            { status: 401 }
        )
    }

    const token = authHeader.substring(7)

    // Constant-time comparison to prevent timing attacks; pad to equal
    // length because timingSafeEqual requires it.
    const tokenBuffer = Buffer.from(token, 'utf8')
    const secretBuffer = Buffer.from(secret, 'utf8')
    const maxLength = Math.max(tokenBuffer.length, secretBuffer.length)
    const paddedToken = Buffer.concat([
        tokenBuffer,
        Buffer.alloc(maxLength - tokenBuffer.length),
    ])
    const paddedSecret = Buffer.concat([
        secretBuffer,
        Buffer.alloc(maxLength - secretBuffer.length),
    ])

    if (!crypto.timingSafeEqual(paddedToken, paddedSecret)) {
        return NextResponse.json(
            { success: false, error: 'Invalid cron secret' },
            { status: 401 }
        )
    }

    return null
}
