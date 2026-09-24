import { OrganizationSchema, WebSiteSchema } from '@workspace/seo/react'
import '@workspace/ui/globals.css'
import { Bodoni_Moda, Geist_Mono, Instrument_Sans } from 'next/font/google'
import Script from 'next/script'

import './brand.css'

import { AnalyticsProvider } from '@/components/analytics/analytics-provider.component'
import { CtaClickTracker } from '@/components/analytics/cta-click-tracker.component'
import { InternalPageViewTracker } from '@/components/analytics/internal-page-view-tracker.component'
import { PageViewTracker } from '@/components/analytics/page-view-tracker.component'
import { WebVitalsReporter } from '@/components/analytics/web-vitals-reporter.component'
import { CookieBanner } from '@/components/cookie-banner.component'
import { FloatingChatButtonLazy } from '@/components/chat/floating-chat-button-lazy.component'
import { FloatingFeedbackButtonLazy } from '@/components/feedback/floating-feedback-button-lazy.component'
import { ConditionalLayout } from '@/components/layout/conditional-layout.component'
import { LeadPopupsWrapper } from '@/components/lead-popups/lead-popups-wrapper.component'
import { NonStandaloneOnly } from '@/components/layout/non-standalone-only.component'
import {
    NO_FLOATING_WIDGET_ROUTES,
    NO_PROMO_BAR_ROUTES,
} from '@/lib/constants/standalone-routes'
import { AnnouncementBar } from '@/components/promotions/announcement-bar.component'
import { Providers } from '@/components/providers'
import { ScrollToTop } from '@/components/scroll-to-top.component'
import { IconSprite } from '@/components/shared/icon-sprite.component'
import { MobileCallButton } from '@/components/shared/mobile-call-button.component'
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

/**
 * The site's type: Instrument Sans for everything read at text size, Bodoni
 * Moda for display (`font-sans` / `font-serif`, through `--font-text` and
 * `--font-display` in packages/ui globals). They replaced Lato and Playfair
 * Display in 2026-09, with the home page redesign.
 *
 * Instrument Sans is a variable file from 400 to 700, so `font-light` sets
 * at 400. Bodoni Moda is variable in weight and optical size: browsers pick
 * the optical size from the font size, so a 100 px headline gets razor
 * hairlines and a 20 px one sturdier strokes.
 */
const fontText = Instrument_Sans({
    subsets: ['latin'],
    variable: '--font-text',
    display: 'swap',
})

// Geist Mono is used by exactly four <kbd> elements in the blog search modal
// (components/blog/blog-search.component.tsx). `preload: false` keeps it
// available without spending 22.6 KB of preload on every route in the site.
const fontMono = Geist_Mono({
    subsets: ['latin'],
    variable: '--font-mono',
    display: 'swap',
    preload: false,
})

const fontDisplay = Bodoni_Moda({
    subsets: ['latin'],
    style: ['normal', 'italic'],
    axes: ['opsz'],
    variable: '--font-display',
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
                {/*
                    No font resource hints here. `next/font/google` self-hosts
                    every face at build time, so the old dns-prefetch to
                    fonts.googleapis.com and preconnect to fonts.gstatic.com
                    warmed connections nothing ever used — verified against
                    production HTML, which fetches no font from either origin.
                    The only thing that ever hit fonts.gstatic.com was the
                    Google Translate widget, which now loads on demand.
                */}

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
                className={`${fontText.variable} ${fontMono.variable} ${fontDisplay.variable} font-sans antialiased`}
                suppressHydrationWarning
            >
                {/* Symbol definitions for the repeated star / Google icons.
                    Must live in the document that draws them, so it sits at
                    the top of <body> ahead of any <use>. */}
                <IconSprite />
                {/* Google Translate - Client-side only to avoid hydration errors */}
                <GoogleTranslateInit />
                <ScrollToTop />
                <InternalPageViewTracker />
                <PageViewTracker />
                <CtaClickTracker />
                <WebVitalsReporter />
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
                    {/* Promotion Announcement Bar. Kept on /landing/*, which
                        redirects its CTA to the hero form; dropped on /lp/*,
                        which runs its own palette and its own offer. */}
                    <NonStandaloneOnly routes={NO_PROMO_BAR_ROUTES}>
                        <AnnouncementBar />
                    </NonStandaloneOnly>
                    {/* Conditional Layout - Header/Footer hidden on standalone pages */}
                    <ConditionalLayout>{children}</ConditionalLayout>
                    {/*
                        The lead popup (the promotion, or the text-consultation
                        request) is suppressed on standalone routes (/lp,
                        /landing, /links) and on the contact and specials pages:
                        a modal over the form is the fastest way to lose a click.
                    */}
                    <NonStandaloneOnly routes={NO_FLOATING_WIDGET_ROUTES}>
                        <LeadPopupsWrapper />
                    </NonStandaloneOnly>
                    {/* Mobile Call Button - visible on mobile devices only.
                        Suppressed on standalone routes so ad/IG landing pages
                        can ship their own chrome. */}
                    {isMobileCallButtonEnabled && (
                        <NonStandaloneOnly routes={NO_FLOATING_WIDGET_ROUTES}>
                            <MobileCallButton
                                position='bottom-left'
                                style='icon-only'
                                isBanner={false}
                            />
                        </NonStandaloneOnly>
                    )}
                    {/* Beta Feedback Button - visible during beta testing */}
                    {isBetaMode && <FloatingFeedbackButtonLazy />}
                    {/* Chat Widget - AI chat assistant */}
                    {isChatEnabled && <FloatingChatButtonLazy />}
                </Providers>
            </body>
        </html>
    )
}
