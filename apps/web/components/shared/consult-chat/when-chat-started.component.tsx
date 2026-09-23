'use client'

/**
 * Shows one of two things depending on whether the visitor has answered
 * anything in a consultation thread yet — so "pick up where you left off"
 * only appears when there is something to pick up. The server renders the
 * not-started version.
 */

import type { ReactNode } from 'react'

import { useConsultChatProgress } from './consult-chat-progress'

export function WhenChatStarted({
    chatId,
    started,
    notStarted,
}: {
    readonly chatId: string
    readonly started: ReactNode
    readonly notStarted: ReactNode
}) {
    const progress = useConsultChatProgress(chatId)
    return progress && progress.answered > 0 ? started : notStarted
}
