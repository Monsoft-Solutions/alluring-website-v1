# Quick Start Guide

Get analytics up and running in 5 minutes.

## Prerequisites

- Next.js 15+ with App Router
- TypeScript configured
- Environment variable support (`.env.local`)

## Installation

### 1. Environment Variables

Create or update `.env.local`:

```bash
# Required: Google Analytics 4
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Optional: Additional Services
NEXT_PUBLIC_CLARITY_PROJECT_ID=your-clarity-id
NEXT_PUBLIC_GTM_ID=GTM-XXXXXX
NEXT_PUBLIC_FACEBOOK_PIXEL_ID=your-pixel-id

# Optional: Cookie Banner
NEXT_PUBLIC_ENABLE_COOKIE_BANNER=false  # Set to 'true' to show banner
```

**Where to find these IDs**:

- **GA4**: [Google Analytics](https://analytics.google.com) → Admin → Data Streams → Measurement ID
- **Clarity**: [Microsoft Clarity](https://clarity.microsoft.com) → Project Settings → Project ID
- **GTM**: [Google Tag Manager](https://tagmanager.google.com) → Container ID (GTM-XXXXXX)
- **Facebook**: [Meta Events Manager](https://business.facebook.com/events_manager2) → Pixel ID

### 2. Add Analytics Provider

Update your root layout at `app/layout.tsx`:

```tsx
import { AnalyticsProvider } from '@/components/analytics/analytics-provider.component'
import { InternalPageViewTracker } from '@/components/analytics/internal-page-view-tracker.component'
import { PageViewTracker } from '@/components/analytics/page-view-tracker.component'
import { ScrollDepthTracker } from '@/components/analytics/scroll-depth-tracker.component'

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang='en'>
            <body>
                {/* Analytics Scripts - Load first */}
                <AnalyticsProvider />

                {/* Automatic Tracking */}
                <PageViewTracker />
                <ScrollDepthTracker />
                <InternalPageViewTracker />

                {children}
            </body>
        </html>
    )
}
```

### 3. Verify Installation

1. **Start development server**:

    ```bash
    npm run dev
    # or
    pnpm dev
    ```

2. **Open browser console** - Look for:

    ```
    Analytics: GA4 initialized (consent granted by default)
    ```

3. **Open GA4 DebugView**:
    - Go to [Google Analytics](https://analytics.google.com)
    - Navigate to: Admin → DebugView
    - You should see events appearing in real-time

4. **Test events**:
    - Load a page → See `page_view` event
    - Scroll down → See `scroll_depth` events (25%, 50%, 75%, 100%)
    - Navigate to another page → See new `page_view` event

## Basic Usage

### Track Custom Events

```tsx
'use client'

import { trackEvent } from '@/lib/analytics/analytics.client'

export function CTAButton() {
    const handleClick = () => {
        trackEvent('cta_click', {
            button_text: 'Get Started',
            page_section: 'hero',
        })

        // Your navigation logic
    }

    return <button onClick={handleClick}>Get Started</button>
}
```

### Track Form Submissions

```tsx
'use client'

import { trackEvent } from '@/lib/analytics/analytics.client'

export function ContactForm() {
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        trackEvent('form_submit', {
            form_name: 'contact',
            form_location: 'contact_page',
        })

        // Your form submission logic
    }

    return <form onSubmit={handleSubmit}>{/* ... */}</form>
}
```

### Track Outbound Links

```tsx
'use client'

import { trackEvent } from '@/lib/analytics/analytics.client'

export function ExternalLink({
    href,
    children,
}: {
    href: string
    children: React.ReactNode
}) {
    const handleClick = () => {
        trackEvent('outbound_link', {
            link_url: href,
            link_domain: new URL(href).hostname,
        })
    }

    return (
        <a
            href={href}
            onClick={handleClick}
            target='_blank'
            rel='noopener noreferrer'
        >
            {children}
        </a>
    )
}
```

## Configuration Options

### Debug Mode

**Automatic** in development (`NODE_ENV === 'development'`):

- Enables GA4 DebugView
- Console logging for all events
- Detailed error messages

**Production**: All debug features automatically disabled.

### Consent Configuration

**Current**: Analytics consent granted by default (no prompt required).

**To enable cookie banner**:

```bash
# .env.local
NEXT_PUBLIC_ENABLE_COOKIE_BANNER=true
```

**Learn More**: See [Consent Mode Documentation](./05-consent-mode.md) for GDPR/CCPA compliance.

### Disable Specific Services

Comment out services in `AnalyticsProvider` component:

```tsx
export function AnalyticsProvider() {
    const analyticsConfig = getAnalyticsConfig()

    return (
        <>
            {/* Google Analytics 4 */}
            {analyticsConfig.ga?.enabled && (
                <GoogleAnalytics
                    measurementId={analyticsConfig.ga.measurementId}
                />
            )}

            {/* Microsoft Clarity - Commented out */}
            {/* {analyticsConfig.clarity?.enabled && (
        <Clarity projectId={analyticsConfig.clarity.projectId} />
      )} */}
        </>
    )
}
```

## Troubleshooting

### Events Not Appearing

**Check**:

1. ✅ Environment variable set correctly: `NEXT_PUBLIC_GA_MEASUREMENT_ID`
2. ✅ Browser console for errors
3. ✅ Ad blocker disabled (uBlock, Privacy Badger, etc.)
4. ✅ Using development server (not build preview)

**Solution**: See [Verification & Debugging Guide](./11-verification-debugging.md)

### Console Errors

**"gtag is not defined"**:

- Script hasn't loaded yet
- Check Network tab for blocked requests
- Verify `AnalyticsProvider` is in layout

**"window is not defined"**:

- Trying to use analytics in Server Component
- Add `'use client'` directive
- Use analytics utilities only in client components

### No Scroll Depth Events

**Check**:

1. ✅ Page has enough content to scroll
2. ✅ `ScrollDepthTracker` component is mounted
3. ✅ Console shows "Tracked scroll depth" messages (dev mode)

## Next Steps

### For Developers

1. [Implementation Guide](./03-implementation-guide.md) - Deep dive into integration
2. [Event Tracking Guide](./07-event-tracking.md) - Custom event patterns
3. [API Reference](./10-api-reference.md) - Complete API documentation

### For Analytics Teams

1. [Google Analytics 4](./04-google-analytics-4.md) - GA4 configuration
2. [Verification & Debugging](./11-verification-debugging.md) - Testing procedures
3. [FAQ & Troubleshooting](./12-faq-troubleshooting.md) - Common issues

## Example Project Structure

```
your-app/
├── app/
│   ├── layout.tsx                    # ✅ Add AnalyticsProvider here
│   └── page.tsx
├── components/
│   └── analytics/
│       ├── analytics-provider.component.tsx
│       ├── google-analytics.component.tsx
│       ├── page-view-tracker.component.tsx
│       ├── scroll-depth-tracker.component.tsx
│       └── internal-page-view-tracker.component.tsx
├── lib/
│   └── analytics/
│       ├── analytics.client.ts       # ✅ Import trackEvent from here
│       ├── analytics.types.ts
│       └── config.ts
└── .env.local                        # ✅ Add measurement IDs here
```

## Quick Reference

### Environment Variables

| Variable                           | Required    | Example          |
| ---------------------------------- | ----------- | ---------------- |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID`    | ✅ Yes      | `G-XXXXXXXXXX`   |
| `NEXT_PUBLIC_CLARITY_PROJECT_ID`   | ❌ Optional | `abc123xyz`      |
| `NEXT_PUBLIC_GTM_ID`               | ❌ Optional | `GTM-XXXXXX`     |
| `NEXT_PUBLIC_FACEBOOK_PIXEL_ID`    | ❌ Optional | `123456789`      |
| `NEXT_PUBLIC_ENABLE_COOKIE_BANNER` | ❌ Optional | `true` / `false` |

### Key Functions

```typescript
// Custom event
trackEvent(eventName: string, params?: EventParams)

// Page view
trackPageView(params?: PageViewParams)

// Scroll depth
trackScrollDepth(params: ScrollDepthParams)

// Clarity events
trackClarityEvent(eventName: string, data?: Record<string, unknown>)
```

### Automatic Events

| Event           | Trigger                        |
| --------------- | ------------------------------ |
| `page_view`     | Every page load & navigation   |
| `scroll_depth`  | 25%, 50%, 75%, 100% milestones |
| `session_start` | First event in session         |
| `first_visit`   | First time visitor             |

---

**Need Help?** Check the [FAQ & Troubleshooting Guide](./12-faq-troubleshooting.md)

---

**Last Updated**: December 16, 2024
