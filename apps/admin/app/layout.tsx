import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'

import '@workspace/ui/globals.css'

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
})

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
        <html lang='en' className={inter.variable}>
            <body className='bg-background min-h-screen font-sans antialiased'>
                {children}
            </body>
        </html>
    )
}
