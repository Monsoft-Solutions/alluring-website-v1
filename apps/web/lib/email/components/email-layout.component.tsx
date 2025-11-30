/**
 * Email Layout Component
 *
 * Base layout wrapper for all email templates.
 * Provides consistent structure, styling, and responsive design using Tailwind CSS.
 * Styled with Alluring Plastic Surgery brand colors (Stone + Gold palette).
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
 * Brand color configuration for emails
 * Using hex values for maximum email client compatibility
 */
const tailwindConfig = {
    theme: {
        extend: {
            colors: {
                stone: {
                    50: '#fafaf9',
                    100: '#f5f5f4',
                    200: '#e7e5e4',
                    300: '#d6d3d1',
                    400: '#a8a29e',
                    500: '#78716c',
                    600: '#57534e',
                    700: '#44403c',
                    800: '#292524',
                    900: '#1c1917',
                },
                gold: {
                    400: '#E5C158',
                    500: '#D4AF37',
                    600: '#B8963D',
                },
            },
        },
    },
}

/**
 * Base email layout component
 *
 * Provides responsive container, consistent styling with Tailwind CSS, and proper HTML structure.
 * All email templates should use this as the root wrapper.
 * Uses Alluring Plastic Surgery brand palette for luxury aesthetic.
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
            <Head>
                <style>
                    {`
                        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap');
                    `}
                </style>
            </Head>
            {preview && <Preview>{preview}</Preview>}
            <Tailwind config={tailwindConfig}>
                <Body className='bg-stone-100 font-sans'>
                    <Container className='mx-auto my-8 max-w-[600px] overflow-hidden rounded-lg border border-stone-200 bg-white shadow-lg'>
                        {children}
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    )
}
