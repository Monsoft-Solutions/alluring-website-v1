'use client'

/**
 * How far the visitor has got in a consultation thread, for the parts of the
 * page that point back to it (the sticky bar, the closing block).
 *
 * The latest value is kept as well as dispatched: a thread that restores
 * saved answers reports them on mount, before later siblings have started
 * listening, and they still need to read it.
 */

import { useSyncExternalStore } from 'react'

import {
    CONSULT_CHAT_PROGRESS_EVENT,
    type ConsultChatProgressDetail,
} from './consult-chat.types'

const latest = new Map<string, ConsultChatProgressDetail>()

export function publishConsultChatProgress(
    detail: ConsultChatProgressDetail
): void {
    latest.set(detail.id, detail)
    window.dispatchEvent(
        new CustomEvent<ConsultChatProgressDetail>(
            CONSULT_CHAT_PROGRESS_EVENT,
            { detail }
        )
    )
}

/** The thread's progress, or null before it has reported any. */
export function useConsultChatProgress(
    chatId: string
): ConsultChatProgressDetail | null {
    return useSyncExternalStore(
        (onChange) => {
            const listener = (event: Event) => {
                const { detail } =
                    event as CustomEvent<ConsultChatProgressDetail>
                if (detail.id === chatId) onChange()
            }
            window.addEventListener(CONSULT_CHAT_PROGRESS_EVENT, listener)
            return () =>
                window.removeEventListener(
                    CONSULT_CHAT_PROGRESS_EVENT,
                    listener
                )
        },
        () => latest.get(chatId) ?? null,
        () => null
    )
}
