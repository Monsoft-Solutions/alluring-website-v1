# API Reference

Complete reference for all analytics functions, components, types, and configurations.

## Client Utilities

### trackEvent()

Track custom events to Google Analytics 4.

**Location**: `apps/web/lib/analytics/analytics.client.ts`

```typescript
function trackEvent(eventName: string, params?: EventParams): void
```

**Parameters**:

- `eventName` (string): Event name in lowercase snake_case
- `params` (EventParams, optional): Event parameters object

**Returns**: `void`

**Example**:

```typescript
import { trackEvent } from '@/lib/analytics/analytics.client'

trackEvent('button_click', {
    button_text: 'Get Started',
    button_location: 'hero',
})
```

**Notes**:

- Includes SSR guard (no-op on server)
- Silent fail on errors (doesn't block UI)
- Logs to console in development

---

### trackPageView()

Manually track page view to Google Analytics 4.

```typescript
function trackPageView(params?: PageViewParams): void
```

**Parameters**:

- `params` (PageViewParams, optional): Page view parameters

**PageViewParams**:

```typescript
interface PageViewParams {
    page_title?: string
    page_location?: string
    page_path?: string
}
```

**Returns**: `void`

**Example**:

```typescript
import { trackPageView } from '@/lib/analytics/analytics.client'

trackPageView({
    page_title: 'About Us',
    page_path: '/about',
    page_location: window.location.href,
})
```

**Notes**:

- GA4 auto-tracks initial page view
- Use for SPA navigation only
- Defaults to `document.title` and `window.location` if params not provided

---

### trackScrollDepth()

Track scroll depth milestone.

```typescript
function trackScrollDepth(params: ScrollDepthParams): void
```

**Parameters**:

- `params` (ScrollDepthParams): Scroll depth parameters

**ScrollDepthParams**:

```typescript
interface ScrollDepthParams {
    percent: 25 | 50 | 75 | 100
    page_path?: string
}
```

**Returns**: `void`

**Example**:

```typescript
import { trackScrollDepth } from '@/lib/analytics/analytics.client'

trackScrollDepth({
    percent: 75,
    page_path: '/blog/article',
})
```

**Notes**:

- Automatically tracked by `ScrollDepthTracker` component
- Manual tracking rarely needed

---

### trackClarityEvent()

Track custom event to Microsoft Clarity.

```typescript
function trackClarityEvent(
    eventName: string,
    eventData?: Record<string, unknown>
): void
```

**Parameters**:

- `eventName` (string): Event name
- `eventData` (Record<string, unknown>, optional): Event data object

**Returns**: `void`

**Example**:

```typescript
import { trackClarityEvent } from '@/lib/analytics/analytics.client'

trackClarityEvent('form_submit', {
    form_name: 'contact',
    success: true,
})
```

---

### identifyClarityUser()

Identify user in Microsoft Clarity for session linking.

```typescript
function identifyClarityUser(
    userId: string,
    sessionId?: string,
    pageId?: string
): void
```

**Parameters**:

- `userId` (string): Non-PII user identifier (hashed)
- `sessionId` (string, optional): Session identifier
- `pageId` (string, optional): Page identifier

**Returns**: `void`

**Example**:

```typescript
import { identifyClarityUser } from '@/lib/analytics/analytics.client'

identifyClarityUser('hashed_user_abc123')
```

**⚠️ Important**: Never pass PII. Use hashed or non-identifiable user IDs only.

---

### upgradeClaritySession()

Upgrade Clarity session to full fidelity recording.

```typescript
function upgradeClaritySession(): void
```

**Parameters**: None

**Returns**: `void`

**Example**:

```typescript
import { upgradeClaritySession } from '@/lib/analytics/analytics.client'

// Upgrade on important flows
upgradeClaritySession()
```

**Use Cases**:

- Checkout flows
- Premium user sessions
- A/B test participants
- After detecting errors

---

## Components

### AnalyticsProvider

Root component that conditionally loads all analytics services.

**Location**: `apps/web/components/analytics/analytics-provider.component.tsx`

```tsx
function AnalyticsProvider(): JSX.Element
```

**Parameters**: None (reads from environment via `getAnalyticsConfig()`)

**Example**:

```tsx
import { AnalyticsProvider } from '@/components/analytics/analytics-provider.component'

export default function RootLayout({ children }) {
    return (
        <html>
            <body>
                <AnalyticsProvider />
                {children}
            </body>
        </html>
    )
}
```

**Services Loaded**:

- GoogleAnalytics (if `NEXT_PUBLIC_GA_MEASUREMENT_ID` set)
- Clarity (if `NEXT_PUBLIC_CLARITY_PROJECT_ID` set)
- GoogleTagManager (if `NEXT_PUBLIC_GTM_ID` set)
- FacebookPixel (if `NEXT_PUBLIC_FACEBOOK_PIXEL_ID` set)

---

### GoogleAnalytics

Google Analytics 4 script loader with Consent Mode v2.

**Location**: `apps/web/components/analytics/google-analytics.component.tsx`

```tsx
function GoogleAnalytics({
    measurementId,
}: {
    measurementId: string
}): JSX.Element
```

**Props**:

- `measurementId` (string): GA4 Measurement ID (format: `G-XXXXXXXXXX`)

**Example**:

```tsx
import { GoogleAnalytics } from '@/components/analytics/google-analytics.component'

;<GoogleAnalytics measurementId='G-XXXXXXXXXX' />
```

**Features**:

- Consent Mode v2 integration
- Debug mode in development
- SSR-safe implementation

---

### PageViewTracker

Automatically tracks page views on Next.js route changes.

**Location**: `apps/web/components/analytics/page-view-tracker.component.tsx`

```tsx
function PageViewTracker(): null
```

**Parameters**: None

**Returns**: `null` (renders nothing)

**Example**:

```tsx
import { PageViewTracker } from '@/components/analytics/page-view-tracker.component'

export default function RootLayout({ children }) {
    return (
        <html>
            <body>
                <PageViewTracker />
                {children}
            </body>
        </html>
    )
}
```

**Notes**:

- Tracks to GA4 only (not internal analytics)
- Skips initial page view (GA4 auto-tracks)
- Uses `usePathname()` and `useSearchParams()` hooks

---

### ScrollDepthTracker

Automatically tracks scroll depth at 25%, 50%, 75%, 100% milestones.

**Location**: `apps/web/components/analytics/scroll-depth-tracker.component.tsx`

```tsx
function ScrollDepthTracker(): null
```

**Parameters**: None

**Returns**: `null` (renders nothing)

**Example**:

```tsx
import { ScrollDepthTracker } from '@/components/analytics/scroll-depth-tracker.component'

export default function RootLayout({ children }) {
    return (
        <html>
            <body>
                <ScrollDepthTracker />
                {children}
            </body>
        </html>
    )
}
```

**Features**:

- Global tracking across all pages
- Automatic reset on navigation
- Uses IntersectionObserver for performance

---

### InternalPageViewTracker

Cookie-free page view tracker with database storage.

**Location**: `apps/web/components/analytics/internal-page-view-tracker.component.tsx`

```tsx
function InternalPageViewTracker(): JSX.Element
```

**Parameters**: None

**Returns**: `JSX.Element` (Suspense wrapper)

**Example**:

```tsx
import { InternalPageViewTracker } from '@/components/analytics/internal-page-view-tracker.component'

export default function RootLayout({ children }) {
    return (
        <html>
            <body>
                <InternalPageViewTracker />
                {children}
            </body>
        </html>
    )
}
```

**Features**:

- No cookies (uses sessionStorage)
- UTM parameter extraction
- Geo and device info captured server-side
- Non-blocking (sendBeacon/fetch with keepalive)

---

### Clarity

Microsoft Clarity script loader.

**Location**: `apps/web/components/analytics/clarity.component.tsx`

```tsx
function Clarity({ projectId }: { projectId: string }): JSX.Element
```

**Props**:

- `projectId` (string): Clarity Project ID

**Example**:

```tsx
import { Clarity } from '@/components/analytics/clarity.component'

;<Clarity projectId='your-project-id' />
```

---

### GoogleTagManager

Google Tag Manager container loader.

**Location**: `apps/web/components/analytics/google-tag-manager.component.tsx`

```tsx
function GoogleTagManager({ containerId }: { containerId: string }): JSX.Element
```

**Props**:

- `containerId` (string): GTM Container ID (format: `GTM-XXXXXX`)

**Example**:

```tsx
import { GoogleTagManager } from '@/components/analytics/google-tag-manager.component'

;<GoogleTagManager containerId='GTM-XXXXXX' />
```

---

### FacebookPixel

Facebook Pixel script loader.

**Location**: `apps/web/components/analytics/facebook-pixel.component.tsx`

```tsx
function FacebookPixel({ pixelId }: { pixelId: string }): JSX.Element
```

**Props**:

- `pixelId` (string): Facebook Pixel ID

**Example**:

```tsx
import { FacebookPixel } from '@/components/analytics/facebook-pixel.component'

;<FacebookPixel pixelId='1234567890' />
```

---

## Configuration

### getAnalyticsConfig()

Get analytics configuration from environment variables.

**Location**: `apps/web/lib/analytics/config.ts`

```typescript
function getAnalyticsConfig(): AnalyticsConfig
```

**Parameters**: None

**Returns**: `AnalyticsConfig`

**AnalyticsConfig**:

```typescript
interface AnalyticsConfig {
    ga?: {
        measurementId: string
        enabled: boolean
    }
    clarity?: {
        projectId: string
        enabled: boolean
    }
    gtm?: {
        containerId: string
        enabled: boolean
    }
    facebookPixel?: {
        pixelId: string
        enabled: boolean
    }
}
```

**Example**:

```typescript
import { getAnalyticsConfig } from '@/lib/analytics/config'

const config = getAnalyticsConfig()

if (config.ga?.enabled) {
    console.log('GA4 enabled:', config.ga.measurementId)
}
```

---

### isAnalyticsEnabled()

Check if any analytics service is enabled.

```typescript
function isAnalyticsEnabled(): boolean
```

**Parameters**: None

**Returns**: `boolean`

**Example**:

```typescript
import { isAnalyticsEnabled } from '@/lib/analytics/config'

if (isAnalyticsEnabled()) {
    // Show cookie banner
}
```

---

## Hooks

### usePageViewTracking()

Hook for manual page view tracking (internal analytics).

**Location**: `apps/web/lib/analytics/usePageViewTracking.hook.ts`

```typescript
function usePageViewTracking(): {
    trackPageView: (pathname: string, search?: string) => Promise<void>
}
```

**Returns**: Object with `trackPageView` function

**Example**:

```tsx
import { usePageViewTracking } from '@/lib/analytics/usePageViewTracking.hook'

function MyComponent() {
    const { trackPageView } = usePageViewTracking()

    const handleNavigation = () => {
        trackPageView('/custom-page', 'utm_source=email')
    }

    return <button onClick={handleNavigation}>Navigate</button>
}
```

---

### useScrollDepth()

Hook for scroll depth tracking with customizable thresholds.

**Location**: `apps/web/lib/analytics/useScrollDepth.hook.ts`

```typescript
function useScrollDepth(options: {
    thresholds?: number[]
    resetOnPathChange?: boolean
    onThresholdReached?: (threshold: number) => void
}): void
```

**Parameters**:

- `options.thresholds` (number[], optional): Scroll thresholds (default: `[25, 50, 75, 100]`)
- `options.resetOnPathChange` (boolean, optional): Reset on navigation (default: `true`)
- `options.onThresholdReached` ((threshold: number) => void, optional): Callback function

**Returns**: `void`

**Example**:

```tsx
import { useScrollDepth } from '@/lib/analytics/useScrollDepth.hook'

function ArticlePage() {
    useScrollDepth({
        thresholds: [10, 25, 50, 75, 90, 100],
        onThresholdReached: (threshold) => {
            console.log(`User scrolled ${threshold}%`)
        },
    })

    return <article>...</article>
}
```

---

## Type Definitions

### EventParams

Generic event parameters object.

**Location**: `apps/web/lib/analytics/analytics.types.ts`

```typescript
interface EventParams {
    [key: string]: string | number | boolean | undefined
}
```

---

### PageViewParams

Page view specific parameters.

```typescript
interface PageViewParams {
    page_title?: string
    page_location?: string
    page_path?: string
}
```

---

### ScrollDepthParams

Scroll depth specific parameters.

```typescript
interface ScrollDepthParams {
    percent: 25 | 50 | 75 | 100
    page_path?: string
}
```

---

### ConsentConfig

Consent Mode v2 configuration object.

```typescript
type ConsentStorageType =
    | 'ad_storage'
    | 'ad_user_data'
    | 'ad_personalization'
    | 'analytics_storage'
    | 'functionality_storage'
    | 'personalization_storage'
    | 'security_storage'

type ConsentState = 'granted' | 'denied'

type ConsentConfig = Record<ConsentStorageType, ConsentState>
```

---

### GtagFunction

TypeScript type for gtag function.

```typescript
type GtagFunction = (
    command: 'config' | 'event' | 'consent' | 'set',
    targetOrAction: string,
    params?: Record<string, unknown>
) => void
```

---

## Environment Variables

### Required

```bash
# Google Analytics 4
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

### Optional

```bash
# Microsoft Clarity
NEXT_PUBLIC_CLARITY_PROJECT_ID=your-project-id

# Google Tag Manager
NEXT_PUBLIC_GTM_ID=GTM-XXXXXX

# Facebook Pixel
NEXT_PUBLIC_FACEBOOK_PIXEL_ID=1234567890

# Cookie Banner
NEXT_PUBLIC_ENABLE_COOKIE_BANNER=false

# Environment
NODE_ENV=development
```

---

## Global Types

### Window Extensions

```typescript
declare global {
    interface Window {
        gtag?: GtagFunction
        clarity?: ClarityFunction
        fbq?: FacebookPixelFunction
        dataLayer?: unknown[]
    }
}
```

---

## Related Documentation

- [Quick Start](./02-quick-start.md) - Getting started
- [Implementation Guide](./03-implementation-guide.md) - Detailed setup
- [Event Tracking](./07-event-tracking.md) - Custom events
- [Verification Guide](./11-verification-debugging.md) - Testing

---

**Last Updated**: December 16, 2024
