/**
 * Speech-to-Text Token API Route
 *
 * Generates single-use tokens for ElevenLabs Realtime Speech-to-Text.
 * Tokens expire after 15 minutes and can only be used once.
 *
 * @module app/api/stt/token/route
 */
import { type NextRequest, NextResponse } from 'next/server'

import { env } from '@/env'

/**
 * POST /api/stt/token
 *
 * Generate a single-use token for ElevenLabs STT WebSocket connection.
 * The token expires after 15 minutes and securely allows client-side
 * access to the realtime transcription service.
 */
export async function POST(_request: NextRequest) {
    try {
        // Check if ElevenLabs is configured
        if (!env.ELEVENLABS_API_KEY) {
            return NextResponse.json(
                { error: 'Voice input is not configured' },
                { status: 503 }
            )
        }

        // Request single-use token from ElevenLabs
        // See: https://elevenlabs.io/docs/developers/guides/cookbooks/speech-to-text/streaming
        const response = await fetch(
            'https://api.elevenlabs.io/v1/single-use-token/realtime_scribe',
            {
                method: 'POST',
                headers: {
                    'xi-api-key': env.ELEVENLABS_API_KEY,
                },
            }
        )

        if (!response.ok) {
            const errorText = await response.text()
            console.error('[STT Token] ElevenLabs API error:', {
                status: response.status,
                error: errorText,
            })

            if (response.status === 401) {
                return NextResponse.json(
                    { error: 'Invalid API key configuration' },
                    { status: 503 }
                )
            }

            if (response.status === 429) {
                return NextResponse.json(
                    { error: 'Rate limit exceeded. Please try again later.' },
                    { status: 429 }
                )
            }

            return NextResponse.json(
                { error: 'Failed to generate speech token' },
                { status: 500 }
            )
        }

        const data = await response.json()

        console.log(
            '[STT Token] Token generated successfully, length:',
            data.token?.length
        )

        if (!data.token) {
            console.error('[STT Token] No token in response:', data)
            return NextResponse.json(
                { error: 'Invalid token response from ElevenLabs' },
                { status: 500 }
            )
        }

        return NextResponse.json({
            token: data.token,
        })
    } catch (error) {
        console.error('[STT Token] Generation error:', error)
        return NextResponse.json(
            { error: 'Failed to generate speech token' },
            { status: 500 }
        )
    }
}

/**
 * OPTIONS handler for CORS preflight requests
 */
export async function OPTIONS(): Promise<NextResponse> {
    return new NextResponse(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    })
}
