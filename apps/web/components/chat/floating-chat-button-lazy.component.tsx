/**
 * Lazy boundary for the built-in chat widget.
 *
 * Gated on NEXT_PUBLIC_CHAT_ENABLED, which is set in no env file — the site
 * runs the Loquent widget instead. A static import still bundled the widget's
 * pre-chat form, and with it react-hook-form and zod, into every route's
 * shared chunk. See issue #199.
 *
 * @module components/chat/floating-chat-button-lazy
 */
'use client'

import dynamic from 'next/dynamic'

export const FloatingChatButtonLazy = dynamic(
    () =>
        import('./floating-chat-button.component').then(
            (m) => m.FloatingChatButton
        ),
    { ssr: false }
)
