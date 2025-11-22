import { OrganizationSchema, WebSiteSchema } from '@workspace/seo/react'
import '@workspace/ui/globals.css'
import { Geist, Geist_Mono } from 'next/font/google'

import {
    AnalyticsProvider,
    PageViewTracker,
    ScrollDepthTracker,
} from '@/components/analytics'
import { CookieBanner } from '@/components/CookieBanner.component'
import { Footer } from '@/components/layout/Footer.component'
import { Header } from '@/components/layout/Header.component'
import { Providers } from '@/components/providers'
import { MobileCallButton } from '@/components/shared'
import { WebVitals } from '@/components/web-vitals.component'
import { env } from '@/env'
import { seoConfig } from '@/lib/seo-config'
import { toNextMetadata } from '@/lib/seo/metadata'

export const metadata = toNextMetadata(seoConfig)

const fontSans = Geist({
    subsets: ['latin'],
    variable: '--font-sans',
    display: 'swap',
    preload: true,
})

const fontMono = Geist_Mono({
    subsets: ['latin'],
    variable: '--font-mono',
    display: 'swap',
})

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    // Check if mobile call button should be enabled (default: true)
    const isMobileCallButtonEnabled =
        env.NEXT_PUBLIC_ENABLE_MOBILE_CALL_BUTTON !== 'false'

    return (
        <html lang='en'>
            <head>
                {/* Resource hints for external domains */}
                <link rel='dns-prefetch' href='https://fonts.googleapis.com' />
                <link
                    rel='preconnect'
                    href='https://fonts.gstatic.com'
                    crossOrigin='anonymous'
                />

                {/* Favicon and app icons */}
                <link rel='icon' type='image/png' href='/favicon.png' />
                <link rel='apple-touch-icon' href='/apple-touch-icon.png' />
            </head>
            <body
                className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased`}
            >
                <WebVitals />
                <PageViewTracker />
                <ScrollDepthTracker />
                <OrganizationSchema
                    name={seoConfig.siteName}
                    url={seoConfig.siteUrl}
                    logo={seoConfig.organization?.logo}
                    legalName={seoConfig.organization?.legalName}
                    founders={seoConfig.organization?.founders}
                    sameAs={seoConfig.organization?.socialProfiles?.map(
                        (s) => s.url
                    )}
                />
                <WebSiteSchema
                    name={seoConfig.siteName}
                    url={seoConfig.siteUrl}
                />
                <Providers>
                    {/* Analytics Scripts - Load conditionally based on consent */}
                    <AnalyticsProvider />
                    {/* Cookie Consent Banner */}
                    <CookieBanner />
                    <Header />
                    <main id='main-content'>{children}</main>
                    <Footer />
                    {/* Mobile Call Button - visible on mobile devices only */}
                    {isMobileCallButtonEnabled && (
                        <MobileCallButton
                            position='bottom-right'
                            style='icon-only'
                            isBanner={false}
                        />
                    )}
                </Providers>
            </body>
        </html>
    )
}
