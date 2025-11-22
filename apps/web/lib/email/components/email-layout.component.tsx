/**
 * Email Layout Component
 *
 * Base layout wrapper for all email templates.
 * Provides consistent structure, styling, and responsive design using Tailwind CSS.
 *
 * @module lib/email/components/EmailLayout.component
 */
import { Body, Container, Head, Html, Preview } from '@react-email/components'
import { Tailwind } from '@react-email/tailwind'
import type { ReactNode } from 'react'

type EmailLayoutProps = {
    /**
     * Preview text shown in email clients
     */
    preview?: string

    /**
     * Email content
     */
    children: ReactNode
}

/**
 * Base email layout component
 *
 * Provides responsive container, consistent styling with Tailwind CSS, and proper HTML structure.
 * All email templates should use this as the root wrapper.
 *
 * @example
 * ```tsx
 * <EmailLayout preview="New contact form submission">
 *   <EmailHeader />
 *   <Section>Email content here</Section>
 *   <EmailFooter />
 * </EmailLayout>
 * ```
 */
export function EmailLayout({ preview, children }: EmailLayoutProps) {
    return (
        <Html>
            <Head />
            {preview && <Preview>{preview}</Preview>}
            <Tailwind>
                <Body className='bg-gray-50 font-sans'>
                    <Container className='mx-auto my-0 mb-16 max-w-[600px] bg-white px-0 pt-5 pb-12'>
                        {children}
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    )
}
