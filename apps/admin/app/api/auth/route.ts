import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { z } from 'zod'

import { env } from '@/env'

const COOKIE_NAME = 'admin-auth'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

const loginSchema = z.object({
    password: z.string().min(1, 'Password is required'),
})

export async function POST(request: Request) {
    try {
        const body = await request.json()

        // Validate request body with Zod
        const validationResult = loginSchema.safeParse(body)

        if (!validationResult.success) {
            return NextResponse.json(
                {
                    error: 'Validation failed',
                    details: validationResult.error.flatten().fieldErrors,
                },
                { status: 400 }
            )
        }

        const { password } = validationResult.data

        if (password !== env.ADMIN_PASSWORD) {
            return NextResponse.json(
                { error: 'Invalid password' },
                { status: 401 }
            )
        }

        // Create a simple token (in production, use a proper JWT or session)
        // We use a timestamp-based token to indicate a valid session without exposing secrets
        const token = Buffer.from(`admin:${Date.now()}`).toString('base64')

        const cookieStore = await cookies()
        cookieStore.set(COOKIE_NAME, token, {
            httpOnly: true,
            secure: env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: COOKIE_MAX_AGE,
            path: '/',
        })

        return NextResponse.json({ success: true })
    } catch {
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function DELETE() {
    try {
        const cookieStore = await cookies()
        cookieStore.delete(COOKIE_NAME)

        return NextResponse.json({ success: true })
    } catch {
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
