import { OrganizationSchema, WebSiteSchema } from '@workspace/seo/react'
import '@workspace/ui/globals.css'
import { Geist, Geist_Mono, Lato, Playfair_Display } from 'next/font/google'

import { AnalyticsProvider } from '@/components/analytics/analytics-provider.component'
import { InternalPageViewTracker } from '@/components/analytics/internal-page-view-tracker.component'
import { PageViewTracker } from '@/components/analytics/page-view-tracker.component'
import { ScrollDepthTracker } from '@/components/analytics/scroll-depth-tracker.component'
import { CookieBanner } from '@/components/cookie-banner.component'
import { FloatingChatButton } from '@/components/chat/floating-chat-button.component'
import { FloatingFeedbackButton } from '@/components/feedback/floating-feedback-button.component'
import { ExitIntentPopup } from '@/components/home/exit-intent-popup.component'
import { Footer } from '@/components/layout/footer.component'
import { Header } from '@/components/layout/header.component'
import { AnnouncementBar } from '@/components/promotions/announcement-bar.component'
import { PromoModalWrapper } from '@/components/promotions/promo-modal-wrapper.component'
import { Providers } from '@/components/providers'
import { MobileCallButton } from '@/components/shared/mobile-call-button.component'
import { WebVitals } from '@/components/web-vitals.component'
import { GoogleTranslateInit } from '@/components/google-translate-init.component'
import { env } from '@/env'
import { seoConfig } from '@/lib/seo-config'
import { toNextMetadata } from '@/lib/seo/metadata'

/**
 * Global metadata with title template for consistent branding
 * All child pages will automatically have "| Alluring" appended
 * Homepage uses custom default title with no suffix for maximum SEO impact
 */
export const metadata = toNextMetadata(seoConfig, {
    title: {
        default:
            'Miami Plastic Surgery | Board-Certified Surgeons | Financing Available',
        template: '%s | Alluring Plastic Surgery',
    },
})

const fontLato = Lato({
    subsets: ['latin'],
    weight: ['300', '400', '700'],
    variable: '--font-lato',
    display: 'swap',
    preload: true,
})

const fontMono = Geist_Mono({
    subsets: ['latin'],
    variable: '--font-mono',
    display: 'swap',
})

// Geist kept for potential future use, but Lato is the primary sans-serif
const fontGeist = Geist({
    subsets: ['latin'],
    variable: '--font-geist',
    display: 'swap',
})

const fontPlayfair = Playfair_Display({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700'],
    style: ['normal', 'italic'],
    variable: '--font-playfair',
    display: 'swap',
})

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    // Check if mobile call button should be enabled (default: false)
    const isMobileCallButtonEnabled =
        env.NEXT_PUBLIC_ENABLE_MOBILE_CALL_BUTTON === 'true'

    // Check if beta mode is enabled (shows feedback button)
    const isBetaMode = env.NEXT_PUBLIC_BETA_MODE === 'true'

    // Check if chat widget is enabled (default: true, fetches config from API)
    const isChatEnabled = env.NEXT_PUBLIC_CHAT_ENABLED !== 'false'

    // Check if cookie banner should be enabled (default: true)
    const isCookieBannerEnabled =
        env.NEXT_PUBLIC_ENABLE_COOKIE_BANNER !== 'false'

    return (
        <html lang='en' className='scroll-smooth' suppressHydrationWarning>
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
                className={`${fontLato.variable} ${fontMono.variable} ${fontGeist.variable} ${fontPlayfair.variable} font-sans antialiased`}
                suppressHydrationWarning
            >
                {/* Google Translate - Client-side only to avoid hydration errors */}
                <GoogleTranslateInit />
                <WebVitals />
                <InternalPageViewTracker />
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
                    {/* Analytics Scripts - Load automatically when configured */}
                    <AnalyticsProvider />
                    {/* Cookie Consent Banner */}
                    {isCookieBannerEnabled && <CookieBanner />}
                    {/* Promotion Announcement Bar */}
                    <AnnouncementBar />
                    {/* Site Header */}
                    <Header />
                    {/* Main Content */}
                    <main id='main-content'>{children}</main>
                    {/* Site Footer */}
                    <Footer />
                    {/* Exit Intent Popup - Only on homepage */}
                    <ExitIntentPopup />
                    {/* Promotion Modal - Timed popup with lead capture */}
                    <PromoModalWrapper />
                    {/* Mobile Call Button - visible on mobile devices only */}
                    {isMobileCallButtonEnabled && (
                        <MobileCallButton
                            position='bottom-left'
                            style='icon-only'
                            isBanner={false}
                        />
                    )}
                    {/* Beta Feedback Button - visible during beta testing */}
                    {isBetaMode && <FloatingFeedbackButton />}
                    {/* Chat Widget - AI chat assistant */}
                    {isChatEnabled && <FloatingChatButton />}
                </Providers>
            </body>
        </html>
    )
}
