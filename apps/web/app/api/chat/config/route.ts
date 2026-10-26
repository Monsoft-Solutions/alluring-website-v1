/**
 * Chat Config API Route
 *
 * Returns public chat configuration for the widget.
 *
 * @module app/api/chat/config/route
 */
import { NextResponse } from 'next/server'

import { resolveClaims } from '@/lib/claims/resolve-claims.server'
import { getChatConfig } from '@/lib/queries/chat.query'

/**
 * GET /api/chat/config
 *
 * Returns public chat configuration
 */
export async function GET() {
    try {
        const config = await getChatConfig()

        // Return only public configuration (no system prompt)
        return NextResponse.json({
            isEnabled: config.isEnabled,
            agentName: config.agentName,
            // Claim tokens (#354) resolved: a visitor never sees brackets.
            welcomeMessage: await resolveClaims(
                config.welcomeMessage,
                'text',
                'chat_config.welcome_message'
            ),
            buttonPosition: config.buttonPosition,
            primaryColor: config.primaryColor,
            agentImageUrl: config.agentImageUrl,
        })
    } catch (error) {
        console.error('Failed to get chat config:', error)
        return NextResponse.json(
            { error: 'Failed to load chat configuration' },
            { status: 500 }
        )
    }
}
