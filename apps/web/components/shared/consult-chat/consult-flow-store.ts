'use client'

/**
 * One store per consultation form, keyed by the form's section id.
 *
 * The visitor's answers live here once they touch the form, and in
 * `sessionStorage` for the tab (never the phone number), so two views of the
 * same form — the hero form and a card lower on the page — show the same
 * progress, and a visitor who leaves for the gallery and comes back picks up
 * where they left off.
 *
 * Until the visitor touches the form, nothing is held in memory: each view
 * reads what the tab saved earlier.
 */

import { useSyncExternalStore } from 'react'

import { writeSavedThread } from './consult-chat.util'
import type { FlowThread } from './consult-flow.logic'

const threads = new Map<string, FlowThread>()
const listeners = new Map<string, Set<() => void>>()

/** The `sessionStorage` key a form's answers are kept under. */
export const flowStorageKey = (formId: string) => `consult-chat:${formId}`

function notify(formId: string) {
    for (const listener of listeners.get(formId) ?? []) listener()
}

/** Replaces the form's answers, or clears them (after a successful send). */
export function writeFlowThread(formId: string, thread: FlowThread | null) {
    if (thread) threads.set(formId, thread)
    else threads.delete(formId)
    writeSavedThread(
        flowStorageKey(formId),
        thread
            ? {
                  ...thread.answers,
                  name: thread.name,
                  financing: thread.financing,
              }
            : null
    )
    notify(formId)
}

function subscribe(formId: string, listener: () => void) {
    const set = listeners.get(formId) ?? new Set()
    set.add(listener)
    listeners.set(formId, set)
    return () => {
        set.delete(listener)
        if (set.size === 0) listeners.delete(formId)
    }
}

/** The answers the visitor has given in this page view, or null before any. */
export function useFlowThread(formId: string): FlowThread | null {
    return useSyncExternalStore(
        (listener) => subscribe(formId, listener),
        () => threads.get(formId) ?? null,
        () => null
    )
}

/** For tests: forget every form. */
export function resetFlowStore() {
    threads.clear()
    listeners.clear()
}
