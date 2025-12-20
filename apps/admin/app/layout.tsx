import type { Metadata, Viewport } from 'next'
import { Toaster } from '@workspace/ui/components/sonner'
import '@workspace/ui/globals.css'

export const metadata: Metadata = {
    title: {
        default: 'Admin Dashboard',
        template: '%s | Admin Dashboard',
    },
    description: 'Alluring Plastic Surgery Admin Dashboard',
    robots: {
        index: false,
        follow: false,
    },
}

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang='en'>
            <body className='bg-background min-h-screen font-sans antialiased'>
                {children}
                <Toaster />
            </body>
        </html>
    )
}
