import { OrganizationSchema, WebSiteSchema } from '@workspace/seo/react'
import '@workspace/ui/globals.css'
import { Geist, Geist_Mono, Lato, Playfair_Display } from 'next/font/google'
import Script from 'next/script'

import { AnalyticsProvider } from '@/components/analytics/analytics-provider.component'
import { InternalPageViewTracker } from '@/components/analytics/internal-page-view-tracker.component'
import { PageViewTracker } from '@/components/analytics/page-view-tracker.component'
import { ScrollDepthTracker } from '@/components/analytics/scroll-depth-tracker.component'
import { CookieBanner } from '@/components/cookie-banner.component'
import { FloatingChatButton } from '@/components/chat/floating-chat-button.component'
import { FloatingFeedbackButton } from '@/components/feedback/floating-feedback-button.component'
import { ExitIntentPopup } from '@/components/home/exit-intent-popup.component'
import { ConditionalLayout } from '@/components/layout/conditional-layout.component'
import { NonStandaloneOnly } from '@/components/layout/non-standalone-only.component'
import { AnnouncementBar } from '@/components/promotions/announcement-bar.component'
import { PromoModalWrapper } from '@/components/promotions/promo-modal-wrapper.component'
import { Providers } from '@/components/providers'
import { ScrollToTop } from '@/components/scroll-to-top.component'
import { MobileCallButton } from '@/components/shared/mobile-call-button.component'
import { WebVitals } from '@/components/web-vitals.component'
import { GoogleTranslateInit } from '@/components/google-translate-init.component'
import { env } from '@/env'
import { seoConfig } from '@/lib/seo-config'
import { toNextMetadata } from '@/lib/seo/metadata'

/**
 * Global metadata.
 *
 * There is deliberately no `template` here. Appending
 * " | Alluring Plastic Surgery" (27 chars) to every page pushed 176 of 205
 * titles past the ~65 characters Google renders, truncating the actual
 * keywords mid-phrase on procedure and blog pages. The brand now lives in the
 * titles of the pages people reach by searching the brand — home, about,
 * contact, reviews, consultation and specials — and is left off the long tail,
 * where the page's own subject matters more than repeating the practice name.
 */
export const metadata = toNextMetadata(seoConfig, {
    // A plain string, not { default, template }: Next requires a template
    // alongside a default, and a bare string already serves as the fallback
    // title for any page that does not set its own.
    title: 'Board-Certified Miami Plastic Surgery | Alluring Plastic Surgery',
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

    // Check if the built-in chat widget is enabled (default: false).
    // Disabled in favor of the Loquent chat widget below — opt in explicitly.
    const isChatEnabled = env.NEXT_PUBLIC_CHAT_ENABLED === 'true'

    // Check if Loquent external chat widget is enabled (default: true)
    const isLoquentChatEnabled =
        env.NEXT_PUBLIC_LOQUENT_CHAT_ENABLED !== 'false'

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

                {/* Loquent Chat Widget */}
                {isLoquentChatEnabled && (
                    <Script
                        id='loquent-tag'
                        src='https://app.loquent.io/api/tag/loquent-tag.js'
                        strategy='afterInteractive'
                        data-tag='tag_2a2044fdafc54be6b4fdddf3a66442c0'
                    />
                )}
            </head>
            <body
                className={`${fontLato.variable} ${fontMono.variable} ${fontGeist.variable} ${fontPlayfair.variable} font-sans antialiased`}
                suppressHydrationWarning
            >
                {/* Google Translate - Client-side only to avoid hydration errors */}
                <GoogleTranslateInit />
                <WebVitals />
                <ScrollToTop />
                <InternalPageViewTracker />
                <PageViewTracker />
                <ScrollDepthTracker />
                <OrganizationSchema
                    id={`${seoConfig.siteUrl}/#organization`}
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
                    searchUrlTemplate={`${seoConfig.siteUrl}/blog?q={search_term_string}`}
                />
                <Providers>
                    {/* Analytics Scripts - Load automatically when configured */}
                    <AnalyticsProvider />
                    {/* Cookie Consent Banner */}
                    {isCookieBannerEnabled && <CookieBanner />}
                    {/* Promotion Announcement Bar */}
                    <AnnouncementBar />
                    {/* Conditional Layout - Header/Footer hidden on standalone pages */}
                    <ConditionalLayout>{children}</ConditionalLayout>
                    {/* Exit Intent Popup - Only on homepage */}
                    <ExitIntentPopup />
                    {/* Promotion Modal - Timed popup with lead capture */}
                    <PromoModalWrapper />
                    {/* Mobile Call Button - visible on mobile devices only.
                        Suppressed on standalone routes (/landing, /links) so
                        ad/IG landing pages can ship their own chrome. */}
                    {isMobileCallButtonEnabled && (
                        <NonStandaloneOnly>
                            <MobileCallButton
                                position='bottom-left'
                                style='icon-only'
                                isBanner={false}
                            />
                        </NonStandaloneOnly>
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
