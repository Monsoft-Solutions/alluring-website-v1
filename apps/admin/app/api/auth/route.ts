import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

import { env } from '@/env'

const COOKIE_NAME = 'admin-auth'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { password } = body

        if (!password) {
            return NextResponse.json(
                { error: 'Password is required' },
                { status: 400 }
            )
        }

        if (password !== env.ADMIN_PASSWORD) {
            return NextResponse.json(
                { error: 'Invalid password' },
                { status: 401 }
            )
        }

        // Create a simple token (in production, use a proper JWT or session)
        const token = Buffer.from(
            `admin:${Date.now()}:${env.ADMIN_PASSWORD}`
        ).toString('base64')

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
