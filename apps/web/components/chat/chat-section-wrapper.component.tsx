/**
 * Chat Section Wrapper Component
 *
 * Client-side wrapper for ChatSection to prevent SSR issues during static generation.
 * This component ensures ChatSection only renders on the client side.
 *
 * @module components/chat/chat-section-wrapper
 */
'use client'

import dynamic from 'next/dynamic'

// Dynamically import ChatSection with ssr disabled
const ChatSection = dynamic(
    () =>
        import('./chat-section.component').then((mod) => ({
            default: mod.ChatSection,
        })),
    {
        ssr: false,
        loading: () => (
            <section className='w-full bg-linear-to-b from-stone-100 to-stone-50 py-16 md:py-24'>
                <div className='mx-auto max-w-4xl px-4 sm:px-6 lg:px-8'>
                    <div className='mb-8 text-center'>
                        <div className='bg-gold-100 mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5'>
                            <span className='text-gold-700 text-sm font-medium'>
                                AI-Powered Assistance
                            </span>
                        </div>
                        <h2 className='font-serif text-3xl font-bold tracking-tight text-stone-900 md:text-4xl'>
                            Loading Chat Assistant...
                        </h2>
                    </div>
                    <div className='mx-auto flex h-[500px] max-h-[70vh] items-center justify-center overflow-hidden rounded-2xl bg-white shadow-xl ring-1 shadow-stone-900/10 ring-stone-200/60'>
                        <div className='border-gold-500 h-5 w-5 animate-spin rounded-full border-2 border-t-transparent' />
                    </div>
                </div>
            </section>
        ),
    }
)

type ChatSectionWrapperProps = {
    /** Section ID for navigation */
    id?: string
    /** Section title */
    title?: string
    /** Section description */
    description?: string
    /** Custom welcome message override */
    welcomeMessage?: string
    /** Additional CSS classes */
    className?: string
}

/**
 * Client-side wrapper for ChatSection
 *
 * Prevents SSR issues by only rendering the chat on the client side.
 * Shows a loading state during hydration.
 */
export function ChatSectionWrapper(props: ChatSectionWrapperProps) {
    return <ChatSection {...props} />
}
