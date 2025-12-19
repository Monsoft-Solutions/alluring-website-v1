/**
 * Unified Chat Hook
 *
 * Simple hook that consumes the ChatContext for managing chat sessions.
 * Provides real-time synchronization between floating widget and embedded sections.
 *
 * @module hooks/chat/useUnifiedChat
 */
'use client'

import { useChatContext } from '@/contexts/chat.context'

/**
 * Unified hook for managing chat sessions
 *
 * Now a simple wrapper around ChatContext for backwards compatibility.
 * All state is managed globally in the ChatContextProvider.
 *
 * Features:
 * - Always creates anonymous sessions (no pre-chat form)
 * - Persists sessionId in cookie for cross-page continuity
 * - Restores message history when session exists
 * - Supports upgrading anonymous sessions with contact info
 * - Real-time message synchronization across all components
 *
 * @example
 * ```tsx
 * const {
 *   session,
 *   messages,
 *   isReady,
 *   initializeSession,
 *   updateContactInfo,
 * } = useUnifiedChat()
 *
 * // Initialize on mount or first interaction
 * useEffect(() => {
 *   initializeSession()
 * }, [])
 * ```
 */
export function useUnifiedChat() {
    return useChatContext()
}
